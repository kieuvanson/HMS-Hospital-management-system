
import express from 'express';
import {
  getDoctorProfile,
  createDoctorProfile,
  updateDoctorProfile,
  deleteDoctorProfile,
  getDoctorsBySpecialty,
  getAllDoctors,
  getDoctorsByDepartment,
  getpatientsByDoctorId
} from '../controllers/doctor_Controller.js';
import { protectedRoute } from '../middleware/authMiddleware.js';

const router = express.Router();

// Lấy tất cả bác sĩ
router.get('/all', getAllDoctors);

// Lấy bác sĩ theo khoa
router.get('/by-department', getDoctorsByDepartment);

// Lấy danh sách bác sĩ theo chuyên khoa
router.get('/by-specialty', getDoctorsBySpecialty);

// Lấy hồ sơ bác sĩ hiện tại (đăng nhập)
router.get('/profile/current', protectedRoute, getDoctorProfile);

// Lấy hồ sơ bác sĩ (cho cả bệnh nhân và bác sĩ)
router.get('/profile/:doctorId', protectedRoute, getDoctorProfile);

// Tạo hồ sơ bác sĩ
router.post('/profile', protectedRoute, createDoctorProfile);

// Cập nhật hồ sơ bác sĩ
router.put('/profile', protectedRoute, updateDoctorProfile);

// Xóa hồ sơ bác sĩ
router.delete('/profile', protectedRoute, deleteDoctorProfile);
// lay benh nhan theo bac si
router.get('/patients', protectedRoute, getpatientsByDoctorId);


export default router;