import express from 'express';
import { protectedRoute } from '../middleware/authMiddleware.js';
import { isPatientRole,isDoctorRole,isAdminRole,checkRole } from '../middleware/roleMiddleware.js';   
import { createAppointment,getPatientAppointments, getAppointmentById, updateAppointmentStatus, cancelAppointment, getDoctorAppointments } from '../controllers/appoinment_controller.js';
const router_appointment = express.Router();

// Example routes for appointment booking
router_appointment.post('/book', protectedRoute, createAppointment);
router_appointment.get('/my-appointments', protectedRoute, isDoctorRole, getDoctorAppointments);
router_appointment.get('/list', protectedRoute, isPatientRole, getPatientAppointments);
router_appointment.get('/doctor/:doctorProfileId', getDoctorAppointments);
router_appointment.get('/:id', protectedRoute, getAppointmentById);
router_appointment.put('/:id', protectedRoute, isDoctorRole, updateAppointmentStatus);
router_appointment.delete('/:id', protectedRoute, isDoctorRole, cancelAppointment);

export default router_appointment;
