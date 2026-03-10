import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User_Model.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Appointment from '../models/Appointment.js';
import { connectDB } from '../config/db.config.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedPatientsAppointments = async () => {
  try {
    await connectDB();

    // Tìm bác sĩ Kiều Văn Sơn
    const doctor = await User.findOne({ 
      role: 'doctor',
      $or: [
        { name: 'Kiều Văn Sơn' },
        { email: 'sonkieuvan@gmail.com' }
      ]
    });
    if (!doctor) {
      console.log('❌ Không tìm thấy bác sĩ Kiều Văn Sơn trong database');
      process.exit(1);
    }

    console.log(`✓ Tìm thấy bác sĩ: ${doctor.name} (${doctor.email})`);

    // Tìm DoctorProfile
    const doctorProfile = await DoctorProfile.findOne({ userId: doctor._id });
    if (!doctorProfile) {
      console.log('❌ Không tìm thấy DoctorProfile cho bác sĩ này');
      process.exit(1);
    }

    console.log(`✓ Tìm thấy DoctorProfile: ${doctorProfile._id}`);

    // Dữ liệu mẫu bệnh nhân
    const patientsData = [
      {
        name: 'Nguyễn Văn A',
        email: 'patient_a_' + Date.now() + '@example.com',
        phone: '0912345678',
        gender: 'Nam',
        age: 30,
        cccd: '123456789012' + Math.floor(Math.random() * 1000),
        address: '123 Đường Trần Hưng Đạo, TP.HCM'
      },
      {
        name: 'Trần Thị B',
        email: 'patient_b_' + Date.now() + '@example.com',
        phone: '0987654321',
        gender: 'Nữ',
        age: 25,
        cccd: '223456789013' + Math.floor(Math.random() * 1000),
        address: '456 Đường Lê Lợi, TP.HCM'
      },
      {
        name: 'Lê Văn C',
        email: 'patient_c_' + Date.now() + '@example.com',
        phone: '0909123123',
        gender: 'Nam',
        age: 40,
        cccd: '323456789014' + Math.floor(Math.random() * 1000),
        address: '789 Đường Nguyễn Huệ, TP.HCM'
      },
      {
        name: 'Phạm Thị D',
        email: 'patient_d_' + Date.now() + '@example.com',
        phone: '0911000001',
        gender: 'Nữ',
        age: 35,
        cccd: '423456789015' + Math.floor(Math.random() * 1000),
        address: '321 Đường Võ Văn Kiệt, TP.HCM'
      },
      {
        name: 'Hoàng Minh E',
        email: 'patient_e_' + Date.now() + '@example.com',
        phone: '0901234567',
        gender: 'Nam',
        age: 45,
        cccd: '523456789016' + Math.floor(Math.random() * 1000),
        address: '654 Đường Cộng Hòa, TP.HCM'
      },
      {
        name: 'Vũ Anh F',
        email: 'patient_f_' + Date.now() + '@example.com',
        phone: '0934567890',
        gender: 'Nữ',
        age: 28,
        cccd: '623456789017' + Math.floor(Math.random() * 1000),
        address: '987 Đường Đông Du, TP.HCM'
      },
      {
        name: 'Cao Văn G',
        email: 'patient_g_' + Date.now() + '@example.com',
        phone: '0945678901',
        gender: 'Nam',
        age: 50,
        cccd: '723456789018' + Math.floor(Math.random() * 1000),
        address: '111 Phố Xuân Dương, Hà Nội'
      },
      {
        name: 'Đặng Thị H',
        email: 'patient_h_' + Date.now() + '@example.com',
        phone: '0956789012',
        gender: 'Nữ',
        age: 32,
        cccd: '823456789019' + Math.floor(Math.random() * 1000),
        address: '222 Phố Tây Hồ, Hà Nội'
      },
      {
        name: 'Bùi Minh I',
        email: 'patient_i_' + Date.now() + '@example.com',
        phone: '0967890123',
        gender: 'Nam',
        age: 38,
        cccd: '923456789020' + Math.floor(Math.random() * 1000),
        address: '333 Phố Hàng Bông, Hà Nội'
      },
      {
        name: 'Tạ Anh K',
        email: 'patient_k_' + Date.now() + '@example.com',
        phone: '0978901234',
        gender: 'Nữ',
        age: 29,
        cccd: '023456789021' + Math.floor(Math.random() * 1000),
        address: '444 Phố Hàng Giấy, Hà Nội'
      },
      {
        name: 'Đỗ Công L',
        email: 'patient_l_' + Date.now() + '@example.com',
        phone: '0989012345',
        gender: 'Nam',
        age: 42,
        cccd: '123456789022' + Math.floor(Math.random() * 1000),
        address: 'Quận 1, TP.HCM'
      },
      {
        name: 'Trương Thị M',
        email: 'patient_m_' + Date.now() + '@example.com',
        phone: '0990123456',
        gender: 'Nữ',
        age: 27,
        cccd: '223456789023' + Math.floor(Math.random() * 1000),
        address: 'Quận 2, TP.HCM'
      }
    ];

    console.log(`\n📝 Đang tạo ${patientsData.length} bệnh nhân mẫu...`);

    // Tạo bệnh nhân
    const patients = [];
    for (const patientData of patientsData) {
      const hashedPassword = await bcrypt.hash('password123', 10);

      const patient = await User.create({
        email: patientData.email,
        hashpassword: hashedPassword,
        name: patientData.name,
        phone: patientData.phone,
        gender: patientData.gender,
        age: patientData.age,
        cccd: patientData.cccd,
        address: patientData.address,
        role: 'patients'
      });

      patients.push(patient);
      console.log(`  ✓ Tạo bệnh nhân: ${patient.name}`);
    }

    // Tạo lịch hẹn cho từng bệnh nhân
    const reasonsData = [
      'Khám tuyến tổng quát',
      'Tái khám sau điều trị',
      'Khám bệnh định kỳ',
      'Khám sức khỏe dự phòng',
      'Tư vấn sức khỏe',
      'Khám theo yêu cầu',
      'Kiểm tra sức khỏe định kỳ',
      'Khám chuyên khoa',
      'Theo dõi tình trạng bệnh',
      'Khám bệnh đặc biệt'
    ];

    const statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

    const symptomsData = [
      ['Đau đầu', 'Mệt mỏi'],
      ['Huyết áp cao'],
      ['Không có'],
      ['Sốt, ho'],
      ['Đau bụng', 'Buồn nôn'],
      ['Chóng mặt'],
      ['Mất ngủ'],
      ['Ho kéo dài'],
      ['Cảm cúm'],
      ['Mệt mỏi, chóng mặt']
    ];

    console.log('\n📅 Đang tạo lịch hẹn...');

    const today = new Date();
    const appointments = [];

    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const numAppointments = Math.floor(Math.random() * 3) + 1; // 1-3 lịch hẹn mỗi bệnh nhân

      for (let j = 0; j < numAppointments; j++) {
        // Tạo ngày hẹn trong 30 ngày tới
        const appointmentDate = new Date(today);
        appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 30));

        // Tạo giờ hẹn (8-17h)
        const hour = Math.floor(Math.random() * 10) + 8;
        const minute = Math.random() > 0.5 ? '00' : '30';
        const appointmentTime = `${String(hour).padStart(2, '0')}:${minute}`;

        const appointment = {
          patientId: patient._id,
          doctorId: doctor._id,
          doctorProfileId: doctorProfile._id,
          appointmentDate: appointmentDate,
          appointmentTime: appointmentTime,
          reason: reasonsData[Math.floor(Math.random() * reasonsData.length)],
          symptoms: symptomsData[Math.floor(Math.random() * symptomsData.length)],
          notes: 'Bệnh nhân đã khai báo y tế',
          status: statuses[Math.floor(Math.random() * statuses.length)],
          doctorInfo: {
            userId: doctor._id,
            name: doctor.name,
            specialty: doctorProfile.specialtyId?.name || 'Chuyên khoa',
            phone: doctor.phone,
            consultationFee: doctorProfile.consultationFee
          },
          patientInfo: {
            name: patient.name,
            phone: patient.phone,
            dateOfBirth: patient.dateOfBirth,
            gender: patient.gender
          }
        };

        appointments.push(appointment);
      }
    }

    // Xóa các lịch hẹn cũ và tạo mới
    await Appointment.deleteMany({ doctorId: doctor._id });
    console.log('✓ Đã xóa lịch hẹn cũ');

    const createdAppointments = await Appointment.insertMany(appointments);
    console.log(`✓ Đã tạo ${createdAppointments.length} lịch hẹn`);

    console.log('\n✅ Seed dữ liệu hoàn tất!');
    console.log(`📌 Tổng: ${patients.length} bệnh nhân, ${createdAppointments.length} lịch hẹn`);
    console.log(`\n👤 Bác sĩ: ${doctor.name} (${doctor.email})`);
    console.log(`🏥 Email bệnh nhân: patient_[a-m]_* @example.com`);
    console.log(`🔑 Mật khẩu: password123`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedPatientsAppointments();
