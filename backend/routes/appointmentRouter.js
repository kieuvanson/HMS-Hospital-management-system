import express from 'express';
import { protectedRoute } from '../middleware/authMiddleware.js';
import { isPatientRole, isDoctorRole } from '../middleware/roleMiddleware.js';
import {
  createAppointment,
  getPatientAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  getDoctorAppointments,
  getAppointmentsByPatient,
  // Examination APIs
  getTodayExaminations,
  startExamination,
  completeExamination,
  getExaminationDetail,
  updateMedicalRecordById,
  getAvailableSlots,
} from '../controllers/appoinment_controller.js';

const router_appointment = express.Router();

// ===== EXAMINATION ROUTES (Trang Khám bệnh - phải đặt trước /:id) =====
router_appointment.get('/examinations/today', protectedRoute, isDoctorRole, getTodayExaminations);
router_appointment.put('/:id/start', protectedRoute, isDoctorRole, startExamination);
router_appointment.put('/:id/complete', protectedRoute, isDoctorRole, completeExamination);
router_appointment.get('/:id/detail', protectedRoute, getExaminationDetail);
router_appointment.put('/:id/medical-record', protectedRoute, isDoctorRole, updateMedicalRecordById);

// ===== EXISTING ROUTES =====
router_appointment.post('/book', protectedRoute, createAppointment);
router_appointment.get('/available-slots', protectedRoute, getAvailableSlots);
router_appointment.get('/my-appointments', protectedRoute, isDoctorRole, getDoctorAppointments);
router_appointment.get('/list', protectedRoute, isPatientRole, getPatientAppointments);
router_appointment.get('/patient/:patientId', protectedRoute, isDoctorRole, getAppointmentsByPatient);
router_appointment.get('/doctor/:doctorProfileId', getDoctorAppointments);
router_appointment.get('/:id', protectedRoute, getAppointmentById);
router_appointment.put('/:id', protectedRoute, isDoctorRole, updateAppointmentStatus);
router_appointment.delete('/:id', protectedRoute, isDoctorRole, cancelAppointment);

export default router_appointment;
