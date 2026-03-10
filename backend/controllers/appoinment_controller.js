// appointmentController.js
import Appointment from '../models/Appointment.js';
import DoctorProfile from '../models/DoctorProfile.js';
import User from '../models/User_Model.js';
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