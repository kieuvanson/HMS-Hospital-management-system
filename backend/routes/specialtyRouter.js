import express from 'express';
import { getAllSpecialties } from '../controllers/specialty_controller.js';
const router_specialty = express.Router();

// Lấy tất cả chuyên khoa (công khai, không cần auth)
router_specialty.get('/', getAllSpecialties);

export default router_specialty;
