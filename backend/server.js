import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.config.js';
import router_auth from './routes/authRouter.js';
import router_user from './routes/userRouter.js';
import router_medical from './routes/medical-router.js';
import router_doctor from './routes/doctorRouter.js';
import router_appointment from './routes/appointmentRouter.js';
import router_specialty from './routes/specialtyRouter.js';
import router_department from './routes/departmentRouter.js';
import cookieParser from 'cookie-parser';
dotenv.config();
const app = express();
const PORT = process.env.PORT;
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000', // Thay đổi nếu frontend chạy trên cổng khác
  credentials: true // Cho phép gửi cookie
}));
//public route
// Cho phép truy cập file ảnh tĩnh

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sử dụng __dirname để trỏ đúng tới backend/uploads
const uploadsPath = path.join(__dirname, 'uploads');
console.log('Serving uploads from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath, {
  dotfiles: 'allow',
  index: false
}));

app.use('/api/auth', router_auth);
app.use('/api/user', router_user);
//private route
app.use('/api/medical', router_medical);
app.use('/api/doctor', router_doctor);
app.use('/api/appointment', router_appointment);
app.use('/api/specialty', router_specialty);
app.use('/api/department', router_department);


connectDB().then(()=>{
  app.listen(PORT,()=>{
    console.log(`Server đang chạy trên cổng  ${PORT}`); 

})});
