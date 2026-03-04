import path from 'path';
import fs from 'fs';
import multer from 'multer';
import User from '../models/User_Model.js';

// Cấu hình lưu file upload cho Patient
const patientStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(path.resolve(), 'uploads/patient/avatars');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + file.fieldname + ext);
  }
});

// Cấu hình lưu file upload cho Doctor
const doctorStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(path.resolve(), 'uploads/doctor/avatars');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + file.fieldname + ext);
  }
});

export const uploadAvatar = multer({ storage: patientStorage });
export const uploadDoctorAvatar = multer({ storage: doctorStorage });

// Middleware để select đúng upload handler dựa trên role
export const selectAvatarUpload = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    
    // Gán uploader vào req để sử dụng sau
    if (user.role === 'doctor') {
      uploadDoctorAvatar.single('avatar')(req, res, (err) => {
        if (err) {
          return res.status(400).json({ message: 'Lỗi upload file: ' + err.message });
        }
        next();
      });
    } else {
      uploadAvatar.single('avatar')(req, res, (err) => {
        if (err) {
          return res.status(400).json({ message: 'Lỗi upload file: ' + err.message });
        }
        next();
      });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Lỗi trong quá trình xử lý' });
  }
};

export const getUserProfile= async(req,res)=>{
    try {
     
        const UserProfile=await User.findById(req.user.id).select('-hashpassword');
        if(!UserProfile){
            return res.status(404).json({message:"Người dùng không tồn tại"});
        }
        return res.status(200).json({user:UserProfile
        }); 
    } catch (error) {
        console.error("Lỗi lấy thông tin người dùng:", error);
        return res.status(500).json({message:"Lỗi máy chủ, vui lòng thử lại sau"});
    }
}

export const updateUserProfile = async (req, res) => {
  try {
    console.log('==== [updateUserProfile] ====');
    console.log('req.file:', req.file);
    console.log('req.body.avatarUrl:', req.body.avatarUrl);
    let avatarUrl;
    // Lấy user hiện tại để kiểm tra avatar cũ
    const currentUser = await User.findById(req.user._id);
    if (!currentUser) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    
    // Xác định folder dựa trên role
    const avatarFolder = currentUser.role === 'doctor' ? 'doctor' : 'patient';
    
    // Nếu có file mới, xóa file cũ (nếu có)
    if (req.file) {
      avatarUrl = `/uploads/${avatarFolder}/avatars/${req.file.filename}`;
      if (currentUser.avatarUrl) {
        // Đường dẫn tuyệt đối tới file cũ
        const oldAvatarPath = path.join(
          path.resolve(),
          currentUser.avatarUrl.startsWith('/') ? currentUser.avatarUrl.slice(1) : currentUser.avatarUrl
        );
        // Không xóa nếu file cũ là mặc định hoặc không tồn tại
        if (fs.existsSync(oldAvatarPath)) {
          try {
            fs.unlinkSync(oldAvatarPath);
            console.log('Đã xóa avatar cũ:', oldAvatarPath);
          } catch (err) {
            console.warn('Không thể xóa avatar cũ:', err.message);
          }
        }
      }
    } else if (req.body.avatarUrl && !req.body.avatarUrl.startsWith('blob:')) {
      avatarUrl = req.body.avatarUrl;
    }
    const { name, phone, cccd, gender, address, dateOfBirth } = req.body;
    const updateData = { name, phone, cccd, gender, address, dateOfBirth };
    if (avatarUrl) updateData.avatarUrl = avatarUrl;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-hashpassword');
    if (!updatedUser) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }
    console.log('==> Lưu user:', updateData);
    return res.status(200).json({
      message: 'Cập nhật hồ sơ thành công',
      user: updatedUser
    });
  } catch (error) {
    console.error('Lỗi cập nhật hồ sơ:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại sau' });
  }
};

// API cập nhật avatar
export const updateAvatar = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn ảnh.' });
        }
        
        // Lấy user để check role
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }
        
        // Xác định folder dựa trên role
        const avatarFolder = user.role === 'doctor' ? 'doctor' : 'patient';
        
        // Đường dẫn truy cập ảnh
        const avatarUrl = `/uploads/${avatarFolder}/avatars/${req.file.filename}`;
        
        // Xóa ảnh cũ nếu có
        if (user.avatarUrl) {
            const oldAvatarPath = path.join(
                path.resolve(),
                user.avatarUrl.startsWith('/') ? user.avatarUrl.slice(1) : user.avatarUrl
            );
            if (fs.existsSync(oldAvatarPath)) {
                try {
                    fs.unlinkSync(oldAvatarPath);
                    console.log('Đã xóa avatar cũ:', oldAvatarPath);
                } catch (err) {
                    console.warn('Không thể xóa avatar cũ:', err.message);
                }
            }
        }
        
        // Cập nhật vào database
        const updatedUser = await User.findByIdAndUpdate(userId, { avatarUrl }, { new: true });
        res.json({ message: 'Cập nhật avatar thành công!', avatarUrl });
    } catch (err) {
        res.status(500).json({ message: 'Lỗi server', error: err.message });
    }
};
