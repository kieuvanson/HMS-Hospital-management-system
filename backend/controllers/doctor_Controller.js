import DoctorProfile from "../models/DoctorProfile.js";
import User from "../models/User_Model.js";
import Specialty from "../models/Specialty.js";
import Appointment from "../models/Appointment.js";

const DEFAULT_TIME_SLOTS = [
  { startTime: '08:00', endTime: '12:00' },
  { startTime: '13:00', endTime: '17:00' }
];

const DEFAULT_WORKING_SCHEDULE = [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
  dayOfWeek,
  timeSlots: DEFAULT_TIME_SLOTS
}));

const MAX_PAID_MONTHLY_OFF_DAYS = 2;

const getDayOfWeekMondayBased = (date) => {
  const jsDay = date.getDay();
  return jsDay === 0 ? 7 : jsDay;
};

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseMonthQuery = (monthQuery) => {
  const now = new Date();
  const fallback = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const value = monthQuery || fallback;

  if (!/^\d{4}-\d{2}$/.test(value)) {
    return null;
  }

  const [yearRaw, monthRaw] = value.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  return {
    year,
    month,
    monthKey: `${yearRaw}-${monthRaw}`,
    startDate: new Date(year, month - 1, 1),
    endDate: new Date(year, month, 0)
  };
};

const normalizeWorkingSchedule = (workingSchedule = DEFAULT_WORKING_SCHEDULE) => {
  if (!Array.isArray(workingSchedule) || workingSchedule.length === 0) {
    return DEFAULT_WORKING_SCHEDULE;
  }

  const seen = new Set();
  const normalized = [];

  for (const item of workingSchedule) {
    const dayOfWeek = Number(item?.dayOfWeek);
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7 || seen.has(dayOfWeek)) {
      continue;
    }

    const timeSlots = Array.isArray(item?.timeSlots)
      ? item.timeSlots
          .filter((slot) => slot?.startTime && slot?.endTime)
          .map((slot) => ({ startTime: slot.startTime, endTime: slot.endTime }))
      : [];

    if (timeSlots.length === 0) {
      continue;
    }

    normalized.push({ dayOfWeek, timeSlots });
    seen.add(dayOfWeek);
  }

  if (normalized.length === 0) {
    return DEFAULT_WORKING_SCHEDULE;
  }

  return normalized.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
};

const ensureDoctorProfileForSchedule = async (doctorUserId) => {
  let profile = await DoctorProfile.findOne({ userId: doctorUserId });

  if (!profile) {
    profile = await DoctorProfile.create({
      userId: doctorUserId,
      workingSchedule: DEFAULT_WORKING_SCHEDULE,
      slotDuration: 30
    });
  }

  const hasWorkingSchedule = Array.isArray(profile.workingSchedule) && profile.workingSchedule.length > 0;
  if (!hasWorkingSchedule) {
    profile.workingSchedule = DEFAULT_WORKING_SCHEDULE;
    await profile.save();
  }

  return profile;
};

const getMonthlyPaidOffLeaves = (profile, year, month) => {
  const leaves = Array.isArray(profile?.leaves) ? profile.leaves : [];
  return leaves.filter((leave) => {
    if (leave.leaveType !== 'paid_monthly_off') {
      return false;
    }
    const date = new Date(leave.startDate);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });
};

const getSalaryConfig = (profile) => {
  const baseMonthlySalary = Number(profile?.salaryConfig?.baseMonthlySalary || 15000000);
  const appointmentCommissionRate = Number(profile?.salaryConfig?.appointmentCommissionRate || 0.2);

  return {
    baseMonthlySalary: Number.isFinite(baseMonthlySalary) ? baseMonthlySalary : 15000000,
    appointmentCommissionRate: Number.isFinite(appointmentCommissionRate) ? appointmentCommissionRate : 0.2
  };
};

const getSalaryAccount = (profile) => ({
  bankName: profile?.salaryAccount?.bankName || '',
  accountNumber: profile?.salaryAccount?.accountNumber || '',
  accountHolder: profile?.salaryAccount?.accountHolder || ''
});

const calculateMonthlySalary = async ({ doctorId, profile, year, month }) => {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 1);

  const [completedAppointments, calendarResult] = await Promise.all([
    Appointment.find({
      doctorId,
      status: 'completed',
      appointmentDate: { $gte: monthStart, $lt: monthEnd }
    }).select('doctorInfo.consultationFee paymentStatus appointmentDate'),
    (async () => {
      const workingSchedule = normalizeWorkingSchedule(profile.workingSchedule);
      const monthlyPaidLeaves = getMonthlyPaidOffLeaves(profile, year, month);
      const paidLeaveMap = new Map(
        monthlyPaidLeaves.map((leave) => [toDateKey(new Date(leave.startDate)), leave])
      );

      const calendar = [];
      const currentDate = new Date(monthStart);
      const lastDate = new Date(year, month, 0);

      while (currentDate <= lastDate) {
        const key = toDateKey(currentDate);
        const dayOfWeek = getDayOfWeekMondayBased(currentDate);
        const dayRule = workingSchedule.find((item) => item.dayOfWeek === dayOfWeek);
        const isWorkingByDefault = Boolean(dayRule && Array.isArray(dayRule.timeSlots) && dayRule.timeSlots.length > 0);
        const paidLeave = paidLeaveMap.get(key);

        calendar.push({
          date: key,
          status: paidLeave ? 'paid_off' : (isWorkingByDefault ? 'working' : 'weekly_off')
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        calendar,
        paidLeaveCount: monthlyPaidLeaves.length
      };
    })()
  ]);

  const salaryConfig = getSalaryConfig(profile);
  const paidCompletedAppointments = completedAppointments.filter((item) => item.paymentStatus === 'paid');
  const grossConsultationFee = paidCompletedAppointments.reduce((sum, item) => {
    const fee = Number(item?.doctorInfo?.consultationFee || profile.consultationFee || 0);
    return sum + (Number.isFinite(fee) ? fee : 0);
  }, 0);

  const commissionAmount = Math.round(grossConsultationFee * salaryConfig.appointmentCommissionRate);
  const standardSalaryDays = calendarResult.calendar.filter((item) => item.status === 'working' || item.status === 'paid_off').length;

  const unpaidLeavesInMonth = (Array.isArray(profile?.leaves) ? profile.leaves : []).filter((leave) => {
    const leaveDate = new Date(leave.startDate);
    return leaveDate.getFullYear() === year && leaveDate.getMonth() + 1 === month && leave.salaryDeduction === true;
  });

  const unpaidLeaveDays = unpaidLeavesInMonth.length;
  const dailyRate = standardSalaryDays > 0 ? salaryConfig.baseMonthlySalary / standardSalaryDays : 0;
  const deductionAmount = Math.round(dailyRate * unpaidLeaveDays);
  const netSalary = Math.max(0, salaryConfig.baseMonthlySalary + commissionAmount - deductionAmount);

  return {
    month: `${year}-${String(month).padStart(2, '0')}`,
    salaryConfig,
    salaryAccount: getSalaryAccount(profile),
    stats: {
      completedAppointments: completedAppointments.length,
      paidCompletedAppointments: paidCompletedAppointments.length,
      grossConsultationFee,
      standardSalaryDays,
      paidOffDays: calendarResult.paidLeaveCount,
      unpaidLeaveDays
    },
    calculation: {
      baseMonthlySalary: salaryConfig.baseMonthlySalary,
      appointmentCommissionRate: salaryConfig.appointmentCommissionRate,
      appointmentCommissionAmount: commissionAmount,
      deductionAmount,
      netSalary
    }
  };
};

// Lấy tất cả bác sĩ
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .populate('department')
      .select('_id name email phone gender age department');

    // Lấy profile của từng bác sĩ
    const doctorsWithProfile = await Promise.all(
      doctors.map(async (doctor) => {
        const profile = await DoctorProfile.findOne({ userId: doctor._id })
          .populate('specialtyId', 'name');
        return {
          _id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          phone: doctor.phone,
          gender: doctor.gender,
          age: doctor.age,
          department: doctor.department,
          specialty: profile?.specialtyId?.name || 'N/A',
          specialtyId: profile?.specialtyId?._id,
          experienceYears: profile?.experienceYears || 0,
          licenseNumber: profile?.licenseNumber || '',
          consultationFee: profile?.consultationFee || 0
        };
      })
    );

    return res.status(200).json({
      message: "Lấy danh sách bác sĩ thành công",
      data: doctorsWithProfile
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách bác sĩ:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ, vui lòng thử lại sau",
      error: error.message
    });
  }
};

// Lấy bác sĩ theo khoa
export const getDoctorsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.query;

    if (!departmentId) {
      return res.status(400).json({ message: "Thiếu departmentId" });
    }

    const doctors = await User.find({
      role: 'doctor',
      department: departmentId
    }).select('_id name email phone gender age department');

    // Lấy profile của từng bác sĩ
    const doctorsWithProfile = await Promise.all(
      doctors.map(async (doctor) => {
        const profile = await DoctorProfile.findOne({ userId: doctor._id })
          .populate('specialtyId', 'name');
        return {
          _id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          phone: doctor.phone,
          gender: doctor.gender,
          age: doctor.age,
          department: doctor.department,
          specialty: profile?.specialtyId?.name || 'N/A',
          specialtyId: profile?.specialtyId?._id,
          experienceYears: profile?.experienceYears || 0,
          licenseNumber: profile?.licenseNumber || '',
          consultationFee: profile?.consultationFee || 0
        };
      })
    );

    return res.status(200).json({
      message: "Lấy danh sách bác sĩ theo khoa thành công",
      data: doctorsWithProfile
    });
  } catch (error) {
    console.error("Lỗi lấy bác sĩ theo khoa:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ, vui lòng thử lại sau",
      error: error.message
    });
  }
};

// Lấy bác sĩ theo chuyên khoa
export const getDoctorsBySpecialty = async (req, res) => {
  try {
    const { specialtyId } = req.query;
    if (!specialtyId) {
      return res.status(400).json({ message: "Thiếu specialtyId" });
    }

    const doctorProfiles = await DoctorProfile.find({ specialtyId })
      .populate('userId', 'name email phone gender age')
      .populate('specialtyId', 'name');

    const doctors = doctorProfiles.map(profile => ({
      _id: profile.userId._id,
      name: profile.userId.name,
      email: profile.userId.email,
      phone: profile.userId.phone,
      gender: profile.userId.gender,
      age: profile.userId.age,
      specialty: profile.specialtyId?.name,
      experienceYears: profile.experienceYears,
      licenseNumber: profile.licenseNumber,
      consultationFee: profile.consultationFee
    }));

    return res.status(200).json({
      message: "Lấy danh sách bác sĩ theo chuyên khoa thành công",
      data: doctors
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách bác sĩ theo chuyên khoa:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ, vui lòng thử lại sau",
      error: error.message
    });
  }
};

// Lấy profile bác sĩ
export const getDoctorProfile = async (req, res) => {
  try {
    // Ưu tiên lấy từ params, nếu không có thì lấy từ user hiện tại
    const doctorId = req.params.doctorId || req.user?._id;

    if (!doctorId) {
      return res.status(400).json({ message: "Không tìm thấy ID bác sĩ" });
    }

    const profile = await DoctorProfile.findOne({ userId: doctorId })
      .populate('userId', '-hashpassword')
      .populate('specialtyId', 'name');

    if (!profile) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ bác sĩ" });
    }

    return res.status(200).json({
      message: "Lấy hồ sơ bác sĩ thành công",
      data: profile
    });
  } catch (error) {
    console.error("Lỗi lấy hồ sơ bác sĩ:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ, vui lòng thử lại sau",
      error: error.message
    });
  }
};

// Tạo hồ sơ bác sĩ
export const createDoctorProfile = async (req, res) => {
  try {
    const {
      userId,
      specialtyId,
      licenseNumber,
      experienceYears,
      education,
      certifications,
      languages,
      consultationFee,
      bio,
      workingSchedule,
      slotDuration
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    if (user.role !== 'doctor') {
      return res.status(400).json({ message: "Người dùng không phải là bác sĩ" });
    }

    const specialty = await Specialty.findById(specialtyId);
    if (!specialty) {
      return res.status(404).json({ message: "Chuyên khoa không tồn tại" });
    }

    const existingProfile = await DoctorProfile.findOne({ userId });
    if (existingProfile) {
      return res.status(409).json({ message: "Hồ sơ bác sĩ đã tồn tại" });
    }

    if (licenseNumber) {
      const existingLicense = await DoctorProfile.findOne({ licenseNumber });
      if (existingLicense) {
        return res.status(409).json({ message: "Số giấy phép đã được sử dụng" });
      }
    }

    const newProfile = await DoctorProfile.create({
      userId,
      specialtyId,
      licenseNumber,
      experienceYears,
      education,
      certifications,
      languages: languages || ['Tiếng Việt'],
      consultationFee,
      bio,
      workingSchedule: normalizeWorkingSchedule(workingSchedule),
      slotDuration: slotDuration || 30
    });

    return res.status(201).json({
      message: "Tạo hồ sơ bác sĩ thành công",
      data: newProfile
    });
  } catch (error) {
    console.error('Lỗi tạo hồ sơ bác sĩ:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'UserId hoặc licenseNumber đã tồn tại'
      });
    }

    return res.status(500).json({
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      error: error.message
    });
  }
};

// Cập nhật hồ sơ bác sĩ
export const updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const updates = req.body;

    const profile = await DoctorProfile.findOneAndUpdate(
      { userId: doctorId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ bác sĩ" });
    }

    return res.status(200).json({
      message: "Cập nhật hồ sơ bác sĩ thành công",
      data: profile
    });
  } catch (error) {
    console.error("Lỗi cập nhật hồ sơ bác sĩ:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ, vui lòng thử lại sau",
      error: error.message
    });
  }
};

// Xóa hồ sơ bác sĩ
export const deleteDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.user._id;

    const profile = await DoctorProfile.findOneAndDelete({ userId: doctorId });

    if (!profile) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ bác sĩ" });
    }

    return res.status(200).json({ message: "Xóa hồ sơ bác sĩ thành công" });
  } catch (error) {
    console.error("Lỗi xóa hồ sơ bác sĩ:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ, vui lòng thử lại sau",
      error: error.message
    });
  }
};

export const getDoctorWorkSchedule = async (req, res) => {
  try {
    const profile = await ensureDoctorProfileForSchedule(req.user._id);

    return res.status(200).json({
      message: 'Lấy cấu hình lịch làm việc thành công',
      data: {
        workingSchedule: normalizeWorkingSchedule(profile.workingSchedule),
        slotDuration: profile.slotDuration || 30,
        monthlyPaidOffLimit: MAX_PAID_MONTHLY_OFF_DAYS
      }
    });
  } catch (error) {
    console.error('Lỗi lấy cấu hình lịch làm việc:', error);
    return res.status(500).json({
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      error: error.message
    });
  }
};

export const updateDoctorWorkSchedule = async (req, res) => {
  try {
    const { workingSchedule, slotDuration } = req.body;
    const profile = await ensureDoctorProfileForSchedule(req.user._id);

    const normalizedSchedule = normalizeWorkingSchedule(workingSchedule);
    profile.workingSchedule = normalizedSchedule;

    if (slotDuration !== undefined) {
      const parsedDuration = Number(slotDuration);
      if (!Number.isInteger(parsedDuration) || parsedDuration < 15 || parsedDuration > 120) {
        return res.status(400).json({ message: 'slotDuration phải trong khoảng 15-120 phút' });
      }
      profile.slotDuration = parsedDuration;
    }

    await profile.save();

    return res.status(200).json({
      message: 'Cập nhật lịch làm việc thành công',
      data: {
        workingSchedule: profile.workingSchedule,
        slotDuration: profile.slotDuration,
        monthlyPaidOffLimit: MAX_PAID_MONTHLY_OFF_DAYS
      }
    });
  } catch (error) {
    console.error('Lỗi cập nhật lịch làm việc:', error);
    return res.status(500).json({
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      error: error.message
    });
  }
};

export const getDoctorMonthlyLeaves = async (req, res) => {
  try {
    const monthInfo = parseMonthQuery(req.query.month);
    if (!monthInfo) {
      return res.status(400).json({ message: 'month phải theo định dạng YYYY-MM' });
    }

    const profile = await ensureDoctorProfileForSchedule(req.user._id);
    const monthlyPaidLeaves = getMonthlyPaidOffLeaves(profile, monthInfo.year, monthInfo.month);

    return res.status(200).json({
      message: 'Lấy ngày nghỉ trong tháng thành công',
      data: monthlyPaidLeaves
        .map((leave) => ({
          _id: leave._id,
          date: toDateKey(new Date(leave.startDate)),
          reason: leave.reason || '',
          salaryDeduction: leave.salaryDeduction,
          leaveType: leave.leaveType
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      meta: {
        month: monthInfo.monthKey,
        monthlyPaidOffLimit: MAX_PAID_MONTHLY_OFF_DAYS,
        usedPaidOffDays: monthlyPaidLeaves.length,
        remainingPaidOffDays: Math.max(0, MAX_PAID_MONTHLY_OFF_DAYS - monthlyPaidLeaves.length)
      }
    });
  } catch (error) {
    console.error('Lỗi lấy ngày nghỉ theo tháng:', error);
    return res.status(500).json({
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      error: error.message
    });
  }
};

export const registerDoctorMonthlyLeave = async (req, res) => {
  try {
    const { date, reason } = req.body;
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'date là bắt buộc và phải theo định dạng YYYY-MM-DD' });
    }

    const leaveDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(leaveDate.getTime())) {
      return res.status(400).json({ message: 'Ngày nghỉ không hợp lệ' });
    }

    const year = leaveDate.getFullYear();
    const month = leaveDate.getMonth() + 1;

    const profile = await ensureDoctorProfileForSchedule(req.user._id);
    const monthlyPaidLeaves = getMonthlyPaidOffLeaves(profile, year, month);

    const hasDuplicateDate = monthlyPaidLeaves.some((leave) => toDateKey(new Date(leave.startDate)) === date);
    if (hasDuplicateDate) {
      return res.status(409).json({ message: 'Ngày nghỉ này đã được đăng ký' });
    }

    if (monthlyPaidLeaves.length >= MAX_PAID_MONTHLY_OFF_DAYS) {
      return res.status(400).json({
        message: `Mỗi tháng chỉ được đăng ký tối đa ${MAX_PAID_MONTHLY_OFF_DAYS} ngày nghỉ không trừ lương`
      });
    }

    profile.leaves.push({
      startDate: leaveDate,
      endDate: leaveDate,
      reason: reason || 'Nghỉ cá nhân',
      leaveType: 'paid_monthly_off',
      salaryDeduction: false,
      isApproved: true
    });
    await profile.save();

    const updatedLeaves = getMonthlyPaidOffLeaves(profile, year, month);

    return res.status(201).json({
      message: 'Đăng ký ngày nghỉ thành công',
      data: updatedLeaves
        .map((leave) => ({
          _id: leave._id,
          date: toDateKey(new Date(leave.startDate)),
          reason: leave.reason || '',
          salaryDeduction: leave.salaryDeduction,
          leaveType: leave.leaveType
        }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      meta: {
        monthlyPaidOffLimit: MAX_PAID_MONTHLY_OFF_DAYS,
        usedPaidOffDays: updatedLeaves.length,
        remainingPaidOffDays: Math.max(0, MAX_PAID_MONTHLY_OFF_DAYS - updatedLeaves.length)
      }
    });
  } catch (error) {
    console.error('Lỗi đăng ký ngày nghỉ:', error);
    return res.status(500).json({
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      error: error.message
    });
  }
};

export const deleteDoctorMonthlyLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const profile = await ensureDoctorProfileForSchedule(req.user._id);

    const targetIndex = profile.leaves.findIndex(
      (leave) => leave._id.toString() === leaveId && leave.leaveType === 'paid_monthly_off'
    );

    if (targetIndex === -1) {
      return res.status(404).json({ message: 'Không tìm thấy ngày nghỉ cần xóa' });
    }

    profile.leaves.splice(targetIndex, 1);
    await profile.save();

    return res.status(200).json({ message: 'Xóa ngày nghỉ thành công' });
  } catch (error) {
    console.error('Lỗi xóa ngày nghỉ:', error);
    return res.status(500).json({
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      error: error.message
    });
  }
};

export const getDoctorWorkCalendar = async (req, res) => {
  try {
    const monthInfo = parseMonthQuery(req.query.month);
    if (!monthInfo) {
      return res.status(400).json({ message: 'month phải theo định dạng YYYY-MM' });
    }

    const profile = await ensureDoctorProfileForSchedule(req.user._id);
    const workingSchedule = normalizeWorkingSchedule(profile.workingSchedule);
    const monthlyPaidLeaves = getMonthlyPaidOffLeaves(profile, monthInfo.year, monthInfo.month);
    const paidLeaveMap = new Map(
      monthlyPaidLeaves.map((leave) => [toDateKey(new Date(leave.startDate)), leave])
    );

    const calendar = [];
    const currentDate = new Date(monthInfo.startDate);

    while (currentDate <= monthInfo.endDate) {
      const key = toDateKey(currentDate);
      const dayOfWeek = getDayOfWeekMondayBased(currentDate);
      const dayRule = workingSchedule.find((item) => item.dayOfWeek === dayOfWeek);
      const isWorkingByDefault = Boolean(dayRule && Array.isArray(dayRule.timeSlots) && dayRule.timeSlots.length > 0);
      const paidLeave = paidLeaveMap.get(key);

      calendar.push({
        date: key,
        dayOfWeek,
        status: paidLeave ? 'paid_off' : (isWorkingByDefault ? 'working' : 'weekly_off'),
        isPaidLeave: Boolean(paidLeave),
        salaryDeduction: paidLeave ? paidLeave.salaryDeduction : false,
        leaveReason: paidLeave?.reason || '',
        timeSlots: dayRule?.timeSlots || []
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return res.status(200).json({
      message: 'Lấy lịch tháng thành công',
      data: calendar,
      meta: {
        month: monthInfo.monthKey,
        monthlyPaidOffLimit: MAX_PAID_MONTHLY_OFF_DAYS,
        usedPaidOffDays: monthlyPaidLeaves.length,
        remainingPaidOffDays: Math.max(0, MAX_PAID_MONTHLY_OFF_DAYS - monthlyPaidLeaves.length)
      }
    });
  } catch (error) {
    console.error('Lỗi lấy lịch tháng:', error);
    return res.status(500).json({
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      error: error.message
    });
  }
};

export const getDoctorSalaryOverview = async (req, res) => {
  try {
    const monthInfo = parseMonthQuery(req.query.month);
    if (!monthInfo) {
      return res.status(400).json({ message: 'month phải theo định dạng YYYY-MM' });
    }

    const profile = await ensureDoctorProfileForSchedule(req.user._id);
    const salaryData = await calculateMonthlySalary({
      doctorId: req.user._id,
      profile,
      year: monthInfo.year,
      month: monthInfo.month
    });

    return res.status(200).json({
      message: 'Lấy bảng lương tháng thành công',
      data: salaryData
    });
  } catch (error) {
    console.error('Lỗi lấy bảng lương tháng:', error);
    return res.status(500).json({
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      error: error.message
    });
  }
};

export const getDoctorYearlySalaryOverview = async (req, res) => {
  try {
    const year = Number(req.query.year);
    if (!Number.isInteger(year) || year < 2000 || year > 3000) {
      return res.status(400).json({ message: 'year không hợp lệ' });
    }

    const profile = await ensureDoctorProfileForSchedule(req.user._id);
    const monthly = [];

    for (let month = 1; month <= 12; month += 1) {
      // eslint-disable-next-line no-await-in-loop
      const salaryData = await calculateMonthlySalary({
        doctorId: req.user._id,
        profile,
        year,
        month
      });
      monthly.push({
        month: salaryData.month,
        netSalary: salaryData.calculation.netSalary,
        baseMonthlySalary: salaryData.calculation.baseMonthlySalary,
        appointmentCommissionAmount: salaryData.calculation.appointmentCommissionAmount,
        deductionAmount: salaryData.calculation.deductionAmount,
        completedAppointments: salaryData.stats.completedAppointments,
        paidCompletedAppointments: salaryData.stats.paidCompletedAppointments
      });
    }

    const totals = monthly.reduce(
      (acc, item) => {
        acc.netSalary += item.netSalary;
        acc.baseMonthlySalary += item.baseMonthlySalary;
        acc.appointmentCommissionAmount += item.appointmentCommissionAmount;
        acc.deductionAmount += item.deductionAmount;
        acc.completedAppointments += item.completedAppointments;
        acc.paidCompletedAppointments += item.paidCompletedAppointments;
        return acc;
      },
      {
        netSalary: 0,
        baseMonthlySalary: 0,
        appointmentCommissionAmount: 0,
        deductionAmount: 0,
        completedAppointments: 0,
        paidCompletedAppointments: 0
      }
    );

    return res.status(200).json({
      message: 'Lấy tổng hợp lương năm thành công',
      data: {
        year,
        salaryAccount: getSalaryAccount(profile),
        salaryConfig: getSalaryConfig(profile),
        totals,
        monthly
      }
    });
  } catch (error) {
    console.error('Lỗi lấy lương năm:', error);
    return res.status(500).json({
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      error: error.message
    });
  }
};

export const updateDoctorSalaryAccount = async (req, res) => {
  try {
    const { bankName, accountNumber, accountHolder } = req.body;

    if (!bankName || !accountNumber || !accountHolder) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin tài khoản nhận lương' });
    }

    const profile = await ensureDoctorProfileForSchedule(req.user._id);
    profile.salaryAccount = {
      bankName: String(bankName).trim(),
      accountNumber: String(accountNumber).trim(),
      accountHolder: String(accountHolder).trim()
    };
    await profile.save();

    return res.status(200).json({
      message: 'Cập nhật tài khoản nhận lương thành công',
      data: getSalaryAccount(profile)
    });
  } catch (error) {
    console.error('Lỗi cập nhật tài khoản lương:', error);
    return res.status(500).json({
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      error: error.message
    });
  }
};

export const updateDoctorSalaryConfig = async (req, res) => {
  try {
    const { baseMonthlySalary, appointmentCommissionRate } = req.body;
    const profile = await ensureDoctorProfileForSchedule(req.user._id);

    const parsedBaseSalary = Number(baseMonthlySalary);
    const parsedCommissionRate = Number(appointmentCommissionRate);

    if (!Number.isFinite(parsedBaseSalary) || parsedBaseSalary < 0) {
      return res.status(400).json({ message: 'baseMonthlySalary không hợp lệ' });
    }

    if (!Number.isFinite(parsedCommissionRate) || parsedCommissionRate < 0 || parsedCommissionRate > 1) {
      return res.status(400).json({ message: 'appointmentCommissionRate phải nằm trong khoảng 0 đến 1' });
    }

    profile.salaryConfig = {
      baseMonthlySalary: parsedBaseSalary,
      appointmentCommissionRate: parsedCommissionRate
    };
    await profile.save();

    return res.status(200).json({
      message: 'Cập nhật cấu hình tính lương thành công',
      data: getSalaryConfig(profile)
    });
  } catch (error) {
    console.error('Lỗi cập nhật cấu hình lương:', error);
    return res.status(500).json({
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      error: error.message
    });
  }
};

export const getpatientsByDoctorId = async (req, res) => {
  try {
    const doctorId = req.user._id;
    
    // Lấy tất cả appointment của bác sĩ với thông tin bệnh nhân
    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', '_id name age gender phone email dateOfBirth address')
      .sort({ appointmentDate: -1 });
    
    if (!appointments || appointments.length === 0) {
      return res.status(200).json({ 
        message: "Không có bệnh nhân nào", 
        data: [] 
      });
    }
    
    // Tạo map để lấy appointment mới nhất của mỗi bệnh nhân
    const patientMap = new Map();
    
    appointments.forEach(appointment => {
      const patientId = appointment.patientId._id.toString();
      // Nếu chưa có bệnh nhân này hoặc appointment này mới hơn, thì cập nhật
      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, appointment);
      }
    });
    
    // Xây dựng danh sách bệnh nhân với status
    const patientsWithStatus = Array.from(patientMap.values()).map(appointment => {
      let status = 'chua_kham';
      const appointmentStatus = appointment.status;
      
      if (appointmentStatus === 'pending') status = 'chua_kham';
      else if (appointmentStatus === 'confirmed') status = 'chua_kham';
      else if (appointmentStatus === 'in_progress') status = 'dang_kham';
      else if (appointmentStatus === 'completed') status = 'da_kham';
      else if (appointmentStatus === 'cancelled') status = 'da_huy';
      
      return {
        _id: appointment.patientId._id,
        name: appointment.patientId.name,
        age: appointment.patientId.age || 0,
        gender: appointment.patientId.gender || '',
        phone: appointment.patientId.phone || '',
        email: appointment.patientId.email,
        dateOfBirth: appointment.patientId.dateOfBirth,
        address: appointment.patientId.address,
        status: status
      };
    });
    
    return res.status(200).json({ 
      message: "Lấy danh sách bệnh nhân thành công", 
      data: patientsWithStatus 
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách bệnh nhân:", error);
    return res.status(500).json({
      message: "Lỗi máy chủ, vui lòng thử lại sau",
      error: error.message
    });
  }
};
