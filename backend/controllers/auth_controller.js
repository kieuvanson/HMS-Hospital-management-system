import bcrypt from 'bcrypt';
import User from '../models/User_Model.js';
import DoctorProfile from '../models/DoctorProfile.js';
import Specialty from '../models/Specialty.js';
import Department from '../models/Department.js';
import Session from '../models/Session.js';
import { createAccessToken,createrefreshToken,saveRefreshToken, getRefreshCookieClearOptions } from '../utils/jwt.js';
export const Sign_up= async(req,res)=>{
    try {
        const {email,password,name}=req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const normalizedName = String(name || '').trim();

        if(!normalizedEmail || !password || !normalizedName){
            return res.status(400).json({message:"Vui lòng điền đầy đủ thông tin"});
        }
         const duplicateUser = await User.findOne({ email: normalizedEmail });
        if (duplicateUser) {
            return res.status(409).json({ message: "Email đã được sử dụng" });
        }   
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(password,salt);
        await User.create({
            email: normalizedEmail,
            hashpassword,
            name: normalizedName,
        });
        return res.status(201).json({message:"Đăng ký thành công"});

    } catch (error) {
        if (error?.code === 11000 && error?.keyPattern?.email) {
            return res.status(409).json({ message: "Email đã được sử dụng" });
        }
        console.error("Lỗi đăng ký người dùng:", error);
        return res.status(500).json({message:"Lỗi máy chủ, vui lòng thử lại sau"});
    }

}
export const Sign_in= async(req,res)=>{
    try {
        const {email,password}=req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();
        if(!normalizedEmail || !password){
            return res.status(400).json({message:"Vui lòng điền đầy đủ thông tin"});
        }
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
        }
        const passwordMatch = await bcrypt.compare(password, user.hashpassword);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
        }
        const accessToken = createAccessToken(user);
        const refreshToken = createrefreshToken();
        await saveRefreshToken(user,refreshToken,res);
        return res.status(200).json({
            message:`User ${user.name} đăng nhập thành công`,accessToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender
            }
        });

    } catch (error) {
        console.error("Lỗi đăng nhập người dùng:", error);
        return res.status(500).json({message:"Lỗi máy chủ, vui lòng thử lại sau"});
    }
};
export const Sign_out= async(req,res)=>{
    try {
        // Lấy refresh token từ cookie
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            return res.status(400).json({ message: "Không tìm thấy token đăng xuất" });
        }

        // Xóa refresh token khỏi cơ sở dữ liệu
        await Session.deleteOne({ refreshToken: refreshToken });
        // Xóa cookie trên trình duyệt
        res.clearCookie('refreshToken', getRefreshCookieClearOptions());
        return res.status(204);
    } catch (error) {
         console.error("Lỗi khi logout:", error);
        return res.status(500).json({message:"Lỗi máy chủ, vui lòng thử lại sau"});
    }
};

// Refresh access token khi hết hạn
export const refreshToken = async (req, res) => {
    try {
        const refreshTokenFromCookie = req.cookies?.refreshToken;
        
        if (!refreshTokenFromCookie) {
            return res.status(401).json({ message: "Không tìm thấy refresh token" });
        }

        // Tìm session trong DB
        const session = await Session.findOne({ refreshToken: refreshTokenFromCookie });
        
        if (!session) {
            return res.status(401).json({ message: "Refresh token không hợp lệ" });
        }

        // Kiểm tra xem refresh token có hết hạn chưa
        if (new Date() > session.expiresAt) {
            await Session.deleteOne({ refreshToken: refreshTokenFromCookie });
            res.clearCookie('refreshToken', getRefreshCookieClearOptions());
            return res.status(401).json({ message: "Refresh token đã hết hạn, vui lòng đăng nhập lại" });
        }

        // Lấy user từ DB
        const user = await User.findById(session.userId);
        if (!user) {
            return res.status(401).json({ message: "User không tồn tại" });
        }

        // Tạo access token mới
        const newAccessToken = createAccessToken(user);

        return res.status(200).json({ 
            accessToken: newAccessToken,
            message: "Refresh token thành công"
        });
    } catch (error) {
        console.error("Lỗi khi refresh token:", error);
        return res.status(500).json({ message: "Lỗi máy chủ, vui lòng thử lại sau" });
    }
};

// Admin tạo tài khoản bác sĩ
export const createDoctorAccount = async (req, res) => {
    try {
        const { name, email, password, age, gender, specialty, department, phone } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();

        // Validation
        if (!name || !normalizedEmail || !password || !age || !gender || !specialty || !department) {
            return res.status(400).json({ 
                message: "Vui lòng điền đầy đủ thông tin bắt buộc" 
            });
        }

        // Check email exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({ 
                message: "Email đã được sử dụng" 
            });
        }

        // Find specialty by name to get specialtyId
        const specialtyDoc = await Specialty.findOne({ name: specialty });
        if (!specialtyDoc) {
            return res.status(404).json({ 
                message: "Chuyên môn không tồn tại" 
            });
        }

        // Find department by name to get departmentId
        const departmentDoc = await Department.findOne({ name: department });
        if (!departmentDoc) {
            return res.status(404).json({ 
                message: "Khoa không tồn tại" 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(password, salt);

        // Create user account
        const newUser = await User.create({
            name,
            email: normalizedEmail,
            hashpassword,
            age: parseInt(age),
            gender,
            department,
            phone: phone || "",
            role: "doctor"
        });

        // Generate auto license number
        const licenseNumber = `LIC${String(newUser._id.getTimestamp().getTime()).slice(-5)}`;

        // Create doctor profile with specialtyId
        const doctorProfile = await DoctorProfile.create({
            userId: newUser._id,
            specialtyId: specialtyDoc._id,
            phone: phone || "",
            licenseNumber: licenseNumber
        });

        return res.status(201).json({
            message: "Tạo tài khoản bác sĩ thành công",
            doctor: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                age: newUser.age,
                gender: newUser.gender,
                specialty: specialty,
                department: department,
                phone: newUser.phone,
                status: "Hoạt động"
            }
        });

    } catch (error) {
        if (error?.code === 11000 && error?.keyPattern?.email) {
            return res.status(409).json({ message: "Email đã được sử dụng" });
        }
        console.error("Lỗi tạo tài khoản bác sĩ:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ, vui lòng thử lại sau",
            error: error.message
        });
    }
};