import express from 'express';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/department_controller.js';

const router_department = express.Router();

// Routes
router_department.get('/', getAllDepartments);
router_department.get('/:id', getDepartmentById);
router_department.post('/', createDepartment);
router_department.put('/:id', updateDepartment);
router_department.delete('/:id', deleteDepartment);

export default router_department;
