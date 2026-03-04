import express from 'express';
import { protectedRoute } from '../middleware/authMiddleware.js';
import {createMedicalRecord,getMedicalRecordById,getMedicalRecords,updateMedicalRecord,deleteMedicalRecord } from '../controllers/medical_controller.js';
import { isDoctorRole, isPatientRole, setMedicalRecordFilter } from '../middleware/roleMiddleware.js';
const router_medical = express.Router();

router_medical.post("/records", protectedRoute, isDoctorRole, createMedicalRecord);
router_medical.get("/records/patient", protectedRoute, isPatientRole, getMedicalRecordById);
// ✅ Sử dụng middleware setMedicalRecordFilter để tự động filter theo role
router_medical.get("/records", protectedRoute, setMedicalRecordFilter, getMedicalRecords);
router_medical.delete("/records/:recordId", protectedRoute, isDoctorRole, deleteMedicalRecord);
router_medical.put("/records/:recordId", protectedRoute, isDoctorRole, updateMedicalRecord);
export default router_medical;