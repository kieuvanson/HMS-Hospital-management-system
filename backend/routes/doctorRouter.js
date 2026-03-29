
import express from 'express';
import {
  getDoctorProfile,
  createDoctorProfile,
  updateDoctorProfile,
  deleteDoctorProfile,
  getDoctorsBySpecialty,
  getAllDoctors,
  getDoctorsByDepartment,
  getpatientsByDoctorId,
  getDoctorWorkSchedule,
  updateDoctorWorkSchedule,
  getDoctorMonthlyLeaves,
  registerDoctorMonthlyLeave,
  deleteDoctorMonthlyLeave,
  getDoctorWorkCalendar,
  getDoctorSalaryOverview,
  getDoctorYearlySalaryOverview,
  updateDoctorSalaryAccount
} from '../controllers/doctor_Controller.js';
import { protectedRoute } from '../middleware/authMiddleware.js';
import { isDoctorRole } from '../middleware/roleMiddleware.js';
import {
  getAdministrativeTemplates,
  getMyAdministrativeRequests,
  createAdministrativeRequest,
  updateAdministrativeRequest
} from '../controllers/administrative_controller.js';

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

// Quản lý lịch làm việc bác sĩ
router.get('/work-schedule', protectedRoute, isDoctorRole, getDoctorWorkSchedule);
router.put('/work-schedule', protectedRoute, isDoctorRole, updateDoctorWorkSchedule);
router.get('/work-calendar', protectedRoute, isDoctorRole, getDoctorWorkCalendar);
router.get('/monthly-leaves', protectedRoute, isDoctorRole, getDoctorMonthlyLeaves);
router.post('/monthly-leaves', protectedRoute, isDoctorRole, registerDoctorMonthlyLeave);
router.delete('/monthly-leaves/:leaveId', protectedRoute, isDoctorRole, deleteDoctorMonthlyLeave);

// Quản lý lương bác sĩ
router.get('/salary-overview', protectedRoute, isDoctorRole, getDoctorSalaryOverview);
router.get('/salary-overview-yearly', protectedRoute, isDoctorRole, getDoctorYearlySalaryOverview);
router.put('/salary-account', protectedRoute, isDoctorRole, updateDoctorSalaryAccount);

// Thủ tục hành chính bác sĩ
router.get('/administrative-templates', protectedRoute, isDoctorRole, getAdministrativeTemplates);
router.get('/administrative-requests', protectedRoute, isDoctorRole, getMyAdministrativeRequests);
router.post('/administrative-requests', protectedRoute, isDoctorRole, createAdministrativeRequest);
router.put('/administrative-requests/:requestId', protectedRoute, isDoctorRole, updateAdministrativeRequest);


export default router;