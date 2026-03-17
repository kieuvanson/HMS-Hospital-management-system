// appointmentController.js
import Appointment from '../models/Appointment.js';
import DoctorProfile from '../models/DoctorProfile.js';
import User from '../models/User_Model.js';
import MedicalRecord from '../models/medical_record.js';
import { sendAppointmentConfirmation, sendAppointmentReminder } from '../services/emailService.js';

// 1. TẠO LỊCH HẸN MỚI
export const createAppointment = async (req, res) => {
  try {
    const { 
      doctorProfileId, 
      appointmentDate, 
      appointmentTime, 
      reason, 
      symptoms, 
      notes 
    } = req.body;
    
    const patientId = req.user.id; // Từ auth middleware

    // Validate ngày giờ
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    if (appointmentDateTime < new Date()) {
      return res.status(400).json({ 
        message: 'Không thể đặt lịch trong quá khứ' 
      });
    }

    // Kiểm tra bác sĩ tồn tại và đang hoạt động
    // Thử tìm theo userId (nếu frontend gửi userId)
    let doctorProfile = await DoctorProfile.findOne({ userId: doctorProfileId })
      .populate('userId');
    
    // Nếu không tìm thấy, thử tìm theo _id
    if (!doctorProfile) {
      doctorProfile = await DoctorProfile.findById(doctorProfileId)
        .populate('userId');
    }
    
    if (!doctorProfile) {
      return res.status(404).json({ message: 'Không tìm thấy bác sĩ' });
    }

    // Kiểm tra slot còn trống
    const existingAppointment = await Appointment.findOne({
      doctorId: doctorProfile.userId._id,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: { $in: ['pending', 'confirmed', 'in_progress'] }
    });

    if (existingAppointment) {
      return res.status(409).json({ 
        message: 'Khung giờ này đã có người đặt' 
      });
    }

    // Lấy thông tin bệnh nhân
    const patient = await User.findById(patientId);

    // Tạo appointment với denormalized data
    const appointment = new Appointment({
      patientId,
      doctorId: doctorProfile.userId._id,
      doctorProfileId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      reason,
      symptoms: symptoms || [],
      notes,
      
      // Denormalized data
      doctorInfo: {
        userId: doctorProfile.userId._id,
        name: doctorProfile.userId.name,
        specialty: doctorProfile.specialty,
        phone: doctorProfile.userId.phone,
        consultationFee: doctorProfile.consultationFee
      },
      patientInfo: {
        name: patient.name,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender
      }
    });

    await appointment.save();

    // Gửi email xác nhận (async, không cần await)
    sendAppointmentConfirmation(patient.email, appointment).catch(err => 
      console.error('Email error:', err)
    );

    res.status(201).json({
      message: 'Đặt lịch thành công',
      data: appointment
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    
    // Handle unique constraint violation
    if (error.code === 11000) {
      return res.status(409).json({ 
        message: 'Khung giờ này đã được đặt bởi người khác' 
      });
    }
    
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 2. LẤY DANH SÁCH LỊCH HẸN CỦA BỆNH NHÂN
export const getPatientAppointments = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { patientId };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate('doctorProfileId', 'specialty consultationFee')
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      data: appointments,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 2B. LẤY DANH SÁCH LỊCH HẸN CỦA BẠC SĨ CHO MỘT BỆNH NHÂN CỤ THỂ
export const getAppointmentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Verify the doctor is the current user
    const doctorId = req.user._id;
    
    // Lấy tất cả appointments của bệnh nhân này với bác sĩ hiện tại
    const appointments = await Appointment.find({ 
      patientId,
      doctorId 
    })
      .sort({ appointmentDate: -1, appointmentTime: -1 });

    res.json({ data: appointments });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 3. LẤY DANH SÁCH LỊCH HẸN CỦA BÁC SĨ
export const getDoctorAppointments = async (req, res) => {
  try {
    // Kiểm tra quyền từ token
    if (!req.user || req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    // Lấy doctorId từ userId trong token
    console.log('Searching DoctorProfile with userId:', req.user._id);
    const doctorProfile = await DoctorProfile.findOne({ userId: req.user._id });
    if (!doctorProfile) {
      console.log('DoctorProfile not found for userId:', req.user._id);
      return res.status(404).json({ message: 'Không tìm thấy hồ sơ bác sĩ' });
    }
    console.log('Found DoctorProfile:', doctorProfile._id);
    
    const { date, status } = req.query;
    let query = { doctorId: req.user._id };
    
    // Nếu không chỉ định status, lấy những lịch hẹn còn hiệu lực
    if (status) {
      query.status = status;
    } else {
      query.status = { $in: ['pending', 'confirmed', 'in_progress'] };
    }

    console.log('Querying appointments with:', query);
    
    // Nếu có lọc theo ngày, dùng regex để so sánh chỉ date part (không care timezone)
    if (date && date.trim()) {
      try {
        // Parse date string (format: YYYY-MM-DD)
        const dateObj = new Date(date);
        const year = dateObj.getUTCFullYear();
        const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getUTCDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        // Tạo regex để match ngày (bất kể timezone)
        query.appointmentDate = {
          $gte: new Date(`${date}T00:00:00Z`),
          $lt: new Date(`${date}T23:59:59.999Z`)
        };
        console.log('📅 Date filter applied:', { dateInput: date, dateString });
      } catch (err) {
        console.log('⚠️ Date parsing error:', err.message);
      }
    } else {
      console.log('⚠️ No date provided, showing all appointments for doctor');
    }
    
    console.log('Final query:', JSON.stringify(query, null, 2));
    const appointments = await Appointment.find(query)
      .populate('patientId', 'name phone email')
      .sort({ appointmentTime: 1 });
    
    console.log('✓ Found appointments:', appointments.length);
    appointments.forEach(app => {
      console.log(`  - ${app.appointmentTime}: ${app.reason} (${app.status})`);
    });
    res.json({ data: appointments });
  } catch (error) {
    console.error('Error in getDoctorAppointments:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 4. XEM CHI TIẾT LỊCH HẸN
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const appointment = await Appointment.findById(id)
      .populate('patientId', 'name phone email')
      .populate('doctorProfileId');

    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Kiểm tra quyền xem
    const isPatient = appointment.patientId._id.toString() === userId;
    const isDoctor = appointment.doctorId.toString() === userId;

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    res.json({ data: appointment });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 5. CẬP NHẬT TRẠNG THÁI (Bác sĩ xác nhận)
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Chỉ bác sĩ hoặc admin mới được confirm
    if (appointment.doctorInfo.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền thực hiện' });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['in_progress', 'cancelled', 'no_show'],
      'in_progress': ['completed']
    };

    if (!validTransitions[appointment.status]?.includes(status)) {
      return res.status(400).json({ 
        message: 'Không thể chuyển trạng thái này' 
      });
    }

    appointment.status = status;
    await appointment.save();

    res.json({ 
      message: 'Cập nhật trạng thái thành công', 
      data: appointment 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 6. HỦY LỊCH HẸN
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;
    const userId = req.user.id;

    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Kiểm tra quyền hủy
    const isPatient = appointment.patientId.toString() === userId;
    const isDoctor = appointment.doctorInfo.userId.toString() === userId;

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền hủy lịch' });
    }

    // Không cho hủy nếu đã completed
    if (['completed', 'cancelled'].includes(appointment.status)) {
      return res.status(400).json({ 
        message: 'Không thể hủy lịch hẹn này' 
      });
    }

    // Kiểm tra thời gian hủy (VD: không cho hủy trước giờ hẹn < 2h)
    const appointmentDateTime = new Date(`${appointment.appointmentDate.toISOString().split('T')[0]}T${appointment.appointmentTime}`);
    const hoursUntilAppointment = (appointmentDateTime - new Date()) / (1000 * 60 * 60);
    
    if (hoursUntilAppointment < 2 && isPatient) {
      return res.status(400).json({ 
        message: 'Chỉ có thể hủy trước giờ hẹn ít nhất 2 tiếng' 
      });
    }

    appointment.status = 'cancelled';
    appointment.cancelledBy = userId;
    appointment.cancelledAt = new Date();
    appointment.cancelReason = cancelReason;

    await appointment.save();

    res.json({ 
      message: 'Hủy lịch hẹn thành công', 
      data: appointment 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 7. CẬP NHẬT KẾT QUẢ KHÁM (sau khi completed)
export const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      diagnosis, 
      prescription, 
      doctorNotes, 
      followUpDate,
      followUpInstructions 
    } = req.body;
    const userId = req.user.id;

    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Chỉ bác sĩ phụ trách mới được cập nhật
    if (appointment.doctorInfo.userId.toString() !== userId) {
      return res.status(403).json({ message: 'Không có quyền cập nhật' });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({ 
        message: 'Chỉ cập nhật được khi lịch hẹn đã hoàn thành' 
      });
    }

    appointment.diagnosis = diagnosis;
    appointment.prescription = prescription;
    appointment.doctorNotes = doctorNotes;
    appointment.followUpDate = followUpDate;
    appointment.followUpInstructions = followUpInstructions;

    await appointment.save();

    res.json({ 
      message: 'Cập nhật kết quả khám thành công', 
      data: appointment 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 8. LẤY SLOT TRỐNG CỦA BÁC SĨ
export const getAvailableSlots = async (req, res) => {
  try {
    const { doctorProfileId, date } = req.query;

    if (!doctorProfileId || !date) {
      return res.status(400).json({ 
        message: 'Thiếu thông tin doctorProfileId hoặc date' 
      });
    }

    // Tìm DoctorProfile để lấy userId (doctorId)
    const doctorProfile = await DoctorProfile.findById(doctorProfileId);
    if (!doctorProfile) {
      return res.status(404).json({ 
        message: 'Không tìm thấy bác sĩ' 
      });
    }

    // Lấy tất cả appointment đã đặt trong ngày (query theo doctorId)
    const bookedAppointments = await Appointment.find({
      doctorId: doctorProfile.userId,
      appointmentDate: new Date(date),
      status: { $in: ['pending', 'confirmed', 'in_progress'] }
    }).select('appointmentTime');

    const bookedTimes = bookedAppointments.map(apt => apt.appointmentTime);

    // Tạo danh sách slot từ 8h-17h (mỗi slot 30 phút)
    const allSlots = [];
    for (let hour = 8; hour < 17; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

    res.json({ 
      date, 
      availableSlots,
      bookedSlots: bookedTimes 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 9. LẤY LỊCH SỬ KHÁM CỦA BỆNH NHÂN VỚI BÁC SĨ
export const getPatientHistoryWithDoctor = async (req, res) => {
  try {
    const { patientId, doctorId } = req.query;

    const appointments = await Appointment.find({
      patientId,
      doctorId,
      status: 'completed'
    })
      .sort({ appointmentDate: -1 })
      .select('appointmentDate appointmentTime diagnosis prescription followUpDate');

    res.json({ data: appointments });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 10. THỐNG KÊ LỊCH HẸN (cho admin/doctor)
export const getAppointmentStats = async (req, res) => {
  try {
    const { doctorId, startDate, endDate } = req.query;

    const match = {};
    if (doctorId) match.doctorId = doctorId;
    if (startDate && endDate) {
      match.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Appointment.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = await Appointment.aggregate([
      { 
        $match: { 
          ...match,
          status: 'completed',
          paymentStatus: 'paid'
        } 
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$doctorInfo.consultationFee' }
        }
      }
    ]);

    res.json({ 
      statusStats: stats,
      revenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ===== EXAMINATION APIs (Trang Khám bệnh) =====

// 11. LẤY DANH SÁCH KHÁM HÔM NAY (bác sĩ)
export const getTodayExaminations = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const { search, status } = req.query;

    // Tính khoảng ngày hôm nay (UTC)
    const now = new Date();
    // Lấy ngày theo local (UTC+7), rồi tạo range UTC
    const todayStart = new Date(now);
    todayStart.setUTCHours(0, 0, 0, 0);
    // Điều chỉnh -7h để cover toàn bộ ngày theo giờ VN
    todayStart.setHours(todayStart.getHours() - 7);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const query = {
      doctorId: req.user._id,
      appointmentDate: { $gte: todayStart, $lt: todayEnd },
      status: { $in: ['confirmed', 'in_progress', 'completed'] }
    };

    // Lọc theo status cụ thể nếu có
    if (status && status !== 'all') {
      // Map frontend status sang DB status
      const statusMap = { waiting: 'confirmed', in_progress: 'in_progress', completed: 'completed' };
      query.status = statusMap[status] || status;
    }

    let appointments = await Appointment.find(query)
      .populate('patientId', 'name phone dateOfBirth gender email')
      .sort({ appointmentTime: 1 });

    // Tìm kiếm theo tên/SĐT/lý do
    if (search && search.trim()) {
      const keyword = search.toLowerCase().trim();
      appointments = appointments.filter(apt => {
        const patientName = (apt.patientInfo?.name || apt.patientId?.name || '').toLowerCase();
        const patientPhone = apt.patientInfo?.phone || apt.patientId?.phone || '';
        const reason = (apt.reason || '').toLowerCase();
        return patientName.includes(keyword) || patientPhone.includes(keyword) || reason.includes(keyword);
      });
    }

    // Tính thống kê (không theo filter)
    const allToday = await Appointment.find({
      doctorId: req.user._id,
      appointmentDate: { $gte: todayStart, $lt: todayEnd },
      status: { $in: ['confirmed', 'in_progress', 'completed'] }
    }).select('status');

    const stats = {
      waiting: allToday.filter(a => a.status === 'confirmed').length,
      inProgress: allToday.filter(a => a.status === 'in_progress').length,
      completed: allToday.filter(a => a.status === 'completed').length,
    };

    // Format dữ liệu trả về cho frontend
    const data = appointments.map(apt => {
      const patient = apt.patientId || {};
      const dob = apt.patientInfo?.dateOfBirth || patient.dateOfBirth;
      const age = dob ? Math.floor((Date.now() - new Date(dob)) / (365.25 * 24 * 3600 * 1000)) : null;

      return {
        _id: apt._id,
        appointmentTime: apt.appointmentTime,
        appointmentDate: apt.appointmentDate,
        reason: apt.reason,
        status: apt.status,  // 'confirmed' | 'in_progress' | 'completed'
        diagnosis: apt.diagnosis,
        prescription: apt.prescription,
        doctorNotes: apt.doctorNotes,
        followUpDate: apt.followUpDate,
        followUpInstructions: apt.followUpInstructions,
        startedAt: apt.startedAt,
        completedAt: apt.completedAt,
        patient: {
          _id: patient._id,
          name: apt.patientInfo?.name || patient.name,
          phone: apt.patientInfo?.phone || patient.phone,
          gender: apt.patientInfo?.gender || patient.gender,
          age,
          email: patient.email,
        }
      };
    });

    res.json({ data, stats });
  } catch (error) {
    console.error('getTodayExaminations error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 12. BẮT ĐẦU KHÁM (confirmed → in_progress)
export const startExamination = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.user || req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Kiểm tra đây là bác sĩ phụ trách
    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Đây không phải lịch hẹn của bạn' });
    }

    // Chỉ được bắt đầu khi status = confirmed
    if (appointment.status !== 'confirmed') {
      return res.status(400).json({ 
        message: `Không thể bắt đầu khám từ trạng thái ${appointment.status}` 
      });
    }

    appointment.status = 'in_progress';
    appointment.startedAt = new Date();
    await appointment.save();

    res.json({ 
      message: 'Bắt đầu khám thành công',
      data: { _id: appointment._id, status: appointment.status, startedAt: appointment.startedAt }
    });
  } catch (error) {
    console.error('startExamination error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 13. HOÀN THÀNH KHÁM (in_progress → completed) + Tạo MedicalRecord
export const completeExamination = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      diagnosis,
      prescription,      // array: [{ medicationName, dosage, frequency, duration, instructions }]
      doctorNotes,
      vitalSigns,        // { bloodPressure: {systolic, diastolic}, heartRate, temperature, weight, height }
      followUpDate,
      followUpInstructions,
      symptoms,
      icdCode
    } = req.body;

    if (!req.user || req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    if (!diagnosis) {
      return res.status(400).json({ message: 'Chẩn đoán là bắt buộc' });
    }

    const appointment = await Appointment.findById(id).populate('patientId', 'name phone');
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Đây không phải lịch hẹn của bạn' });
    }

    if (appointment.status !== 'in_progress') {
      return res.status(400).json({ 
        message: `Không thể hoàn thành từ trạng thái ${appointment.status}` 
      });
    }

    // Cập nhật appointment
    appointment.status = 'completed';
    appointment.completedAt = new Date();
    appointment.diagnosis = diagnosis;
    appointment.prescription = Array.isArray(prescription)
      ? prescription.map(p => `${p.medicationName} - ${p.dosage || ''} - ${p.frequency || ''} - ${p.duration || ''}`).join('; ')
      : (prescription || '');
    appointment.doctorNotes = doctorNotes;
    appointment.followUpDate = followUpDate || null;
    appointment.followUpInstructions = followUpInstructions;
    await appointment.save();

    // Tạo MedicalRecord
    const medicalRecord = await MedicalRecord.create({
      patientId: appointment.patientId._id || appointment.patientId,
      doctorId: req.user._id,
      visitDate: appointment.appointmentDate,
      chiefComplaint: appointment.reason,
      symptoms: symptoms || appointment.symptoms || [],
      vitalSigns: vitalSigns || {},
      diagnosis,
      icdCode: icdCode || '',
      prescription: Array.isArray(prescription) ? prescription : [],
      notes: doctorNotes || '',
      followUpDate: followUpDate || null,
      status: 'completed'
    });

    res.json({
      message: 'Hoàn thành khám thành công',
      data: {
        _id: appointment._id,
        status: appointment.status,
        completedAt: appointment.completedAt,
        diagnosis: appointment.diagnosis,
        medicalRecordId: medicalRecord._id
      }
    });
  } catch (error) {
    console.error('completeExamination error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 14B. CẬP NHẬT HỒ SƠ KHÁM (sau khi completed - bác sĩ chỉnh sửa)
export const updateMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      diagnosis,
      icdCode,
      doctorNotes,
      followUpDate,
      followUpInstructions,
      symptoms,
      prescription,
      vitalSigns,
    } = req.body;

    if (!req.user || req.user.role !== 'doctor') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    if (!diagnosis || !diagnosis.trim()) {
      return res.status(400).json({ message: 'Chẩn đoán là bắt buộc' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    if (appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Đây không phải lịch hẹn của bạn' });
    }

    if (appointment.status !== 'completed') {
      return res.status(400).json({ message: 'Chỉ được chỉnh sửa hồ sơ đã hoàn thành' });
    }

    // Cập nhật appointment
    appointment.diagnosis = diagnosis;
    appointment.doctorNotes = doctorNotes || '';
    appointment.followUpDate = followUpDate || null;
    appointment.followUpInstructions = followUpInstructions || '';
    appointment.prescription = Array.isArray(prescription)
      ? prescription.map(p => `${p.medicationName} - ${p.dosage || ''} - ${p.frequency || ''} - ${p.duration || ''}`).join('; ')
      : (prescription || appointment.prescription || '');
    await appointment.save();

    // Cập nhật MedicalRecord mới nhất tương ứng
    try {
      const medicalRecord = await MedicalRecord.findOne({
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        visitDate: appointment.appointmentDate,
      }).sort({ createdAt: -1 });

      if (medicalRecord) {
        medicalRecord.diagnosis = diagnosis;
        medicalRecord.icdCode = icdCode || medicalRecord.icdCode || '';
        medicalRecord.notes = doctorNotes || '';
        medicalRecord.followUpDate = followUpDate || null;
        medicalRecord.symptoms = symptoms || medicalRecord.symptoms || [];
        medicalRecord.prescription = Array.isArray(prescription) ? prescription : medicalRecord.prescription;
        if (vitalSigns) medicalRecord.vitalSigns = vitalSigns;
        await medicalRecord.save();
      }
    } catch (mrErr) {
      console.warn('MedicalRecord update warning:', mrErr.message);
    }

    res.json({
      message: 'Cập nhật hồ sơ khám thành công',
      data: {
        _id: appointment._id,
        diagnosis: appointment.diagnosis,
        doctorNotes: appointment.doctorNotes,
        followUpDate: appointment.followUpDate,
        followUpInstructions: appointment.followUpInstructions,
        prescription: appointment.prescription,
      }
    });
  } catch (error) {
    console.error('updateMedicalRecordById error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// 14. CHI TIẾT APPOINTMENT CHO TRANG KHÁM
export const getExaminationDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const appointment = await Appointment.findById(id)
      .populate('patientId', 'name phone email dateOfBirth gender')
      .populate('doctorProfileId', 'specialty consultationFee');

    if (!appointment) {
      return res.status(404).json({ message: 'Không tìm thấy lịch hẹn' });
    }

    // Kiểm tra quyền: bác sĩ phụ trách hoặc bệnh nhân
    const isDoctor = appointment.doctorId.toString() === userId.toString();
    const isPatient = appointment.patientId?._id?.toString() === userId.toString();
    if (!isDoctor && !isPatient && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền xem' });
    }

    // Lấy lịch sử khám trước của bệnh nhân này
    const history = await MedicalRecord.find({
      patientId: appointment.patientId._id || appointment.patientId,
      doctorId: appointment.doctorId
    })
      .sort({ visitDate: -1 })
      .limit(5)
      .select('visitDate diagnosis prescription followUpDate chiefComplaint');

    res.json({ data: appointment, history });
  } catch (error) {
    console.error('getExaminationDetail error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};