
import User from '../models/User_Model.js';

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
    const { name, avatarUrl, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { name, avatarUrl, phone },
      { new: true, runValidators: true }
    ).select('-hashpassword');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    return res.status(200).json({
      message: 'Cập nhật hồ sơ thành công',
      user: updatedUser
    });
  } catch (error) {
    console.error('Lỗi cập nhật hồ sơ:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại sau' });
  }
};
