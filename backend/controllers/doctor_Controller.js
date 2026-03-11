import DoctorProfile from "../models/DoctorProfile.js";
import User from "../models/User_Model.js";
import Specialty from "../models/Specialty.js";
import Appointment from "../models/Appointment.js";

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
      workingSchedule,
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
