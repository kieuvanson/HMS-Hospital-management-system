import User from '../models/User_Model.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const protectedRoute = async(req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Không có token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

  const user = await User.findById(decoded.id).select('-hashpassword');

        if (!user) {
            return res.status(401).json({ 
                message: 'User không tồn tại.'
            });
        }
        req.user = user;
       
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc hết hạn' });
  }
};
