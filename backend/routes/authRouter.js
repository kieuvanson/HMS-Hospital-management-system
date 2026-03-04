import express from 'express';
import { Sign_up, Sign_in, Sign_out, createDoctorAccount, refreshToken } from '../controllers/auth_controller.js';

const router_auth = express.Router();
router_auth.post("/Sign_up", Sign_up);
router_auth.post("/Sign_in", Sign_in);
router_auth.post("/Sign_out", Sign_out);
router_auth.post("/refresh_token", refreshToken);
router_auth.post("/admin/create-doctor", createDoctorAccount);

export default router_auth; 