import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User_Model.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Appointment from '../models/Appointment.js';
import { connectDB } from '../config/db.config.js';

dotenv.config();

const seedAppointments = async () => {
  try {
    await connectDB();
    
    // Tìm một bác sĩ trong database
    const doctor = await User.findOne({ role: 'doctor' });
    if (!doctor) {
      console.log('❌ Không tìm thấy bác sĩ trong database');
      process.exit(1);
    }
    
    console.log(`✓ Tìm thấy bác sĩ: ${doctor.name} (${doctor.email})`);
    
    // Tìm DoctorProfile của bác sĩ
    const doctorProfile = await DoctorProfile.findOne({ userId: doctor._id });
    if (!doctorProfile) {
      console.log('❌ Không tìm thấy DoctorProfile cho bác sĩ này');
      process.exit(1);
    }
    
    console.log(`✓ Tìm thấy DoctorProfile: ${doctorProfile._id}`);
    
    // Tìm một bệnh nhân
    const patient = await User.findOne({ role: 'patients' });
    if (!patient) {
      console.log('❌ Không tìm thấy bệnh nhân trong database');
      process.exit(1);
    }
    
    console.log(`✓ Tìm thấy bệnh nhân: ${patient.name} (${patient.email})`);
    
    // Xóa lịch hẹn cũ để tránh trùng
    await Appointment.deleteMany({ doctorProfileId: doctorProfile._id });
    console.log('✓ Đã xóa lịch hẹn cũ');
    
    // Tạo các lịch hẹn mẫu
    // Dùng ngày UTC để tránh timezone issues
    const today = new Date();
    const year = today.getUTCFullYear();
    const month = String(today.getUTCMonth() + 1).padStart(2, '0');
    const day = String(today.getUTCDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    console.log(`📅 Creating appointments for date: ${dateString}`);
    
    const appointments = [
      {
        patientId: patient._id,
        doctorProfileId: doctorProfile._id,
        appointmentDate: new Date(`${dateString}T00:00:00Z`),
        appointmentTime: '08:00',
        reason: 'Khám tuyến tổng quát',
        symptoms: ['Đau đầu', 'Mệt mỏi'],
        notes: 'Bệnh nhân phàn nàn về triệu chứng từ 3 ngày',
        status: 'confirmed',
        doctorInfo: {
          userId: doctor._id,
          name: doctor.name,
          specialty: doctorProfile.specialty,
          phone: doctor.phone,
          consultationFee: doctorProfile.consultationFee
        },
        patientInfo: {
          name: patient.name,
          phone: patient.phone,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender
        }
      },
      {
        patientId: patient._id,
        doctorProfileId: doctorProfile._id,
        appointmentDate: new Date(`${dateString}T00:00:00Z`),
        appointmentTime: '10:00',
        reason: 'Tái khám sau điều trị',
        symptoms: ['Huyết áp cao'],
        notes: 'Theo dõi tình trạng',
        status: 'pending',
        doctorInfo: {
          userId: doctor._id,
          name: doctor.name,
          specialty: doctorProfile.specialty,
          phone: doctor.phone,
          consultationFee: doctorProfile.consultationFee
        },
        patientInfo: {
          name: patient.name,
          phone: patient.phone,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender
        }
      },
      {
        patientId: patient._id,
        doctorProfileId: doctorProfile._id,
        appointmentDate: new Date(`${dateString}T00:00:00Z`),
        appointmentTime: '14:00',
        reason: 'Khám bệnh định kỳ',
        symptoms: ['Không có'],
        notes: 'Khám sức khỏe định kỳ hàng năm',
        status: 'in_progress',
        doctorInfo: {
          userId: doctor._id,
          name: doctor.name,
          specialty: doctorProfile.specialty,
          phone: doctor.phone,
          consultationFee: doctorProfile.consultationFee
        },
        patientInfo: {
          name: patient.name,
          phone: patient.phone,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender
        }
      }
    ];
    
    const result = await Appointment.insertMany(appointments);
    console.log(`✓ Đã tạo ${result.length} lịch hẹn mẫu`);
    console.log('\n📋 Các lịch hẹn được tạo:');
    result.forEach(app => {
      console.log(`  - ${app.appointmentTime}: ${app.reason} (${app.status})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
};

seedAppointments();
