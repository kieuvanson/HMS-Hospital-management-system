import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

export default function Login({ onSwitchToSignup }) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.signIn({
        email: formData.email,
        password: formData.password
      });
      
      // Lưu token vào localStorage (giữ cả key cũ để tương thích)
      const tokenToStore = response?.accessToken || response?.token;
      if (tokenToStore) {
        localStorage.setItem('accessToken', tokenToStore);
        localStorage.setItem('token', tokenToStore);
      }
      
      try {
        // Kiểm tra định dạng token
        if (typeof response.accessToken !== 'string' || !response.accessToken) {
          throw new Error('Token không hợp lệ hoặc không tồn tại');
        }

        // Giải mã token để lấy thông tin người dùng
        const decodedToken = jwtDecode(response.accessToken);
        
        // Lưu thông tin người dùng vào localStorage
        localStorage.setItem('user', JSON.stringify(decodedToken));
        
        toast.success('Đăng nhập thành công!');
        
        // Chuyển hướng dựa trên vai trò
        if (decodedToken.role === 'doctor' || decodedToken.role === 'admin') {
          window.location.href = '/doctor/dashboard';
        } else {
          window.location.href = '/dashboard';
        }
      } catch (decodeError) {
        console.error('Lỗi giải mã token:', decodeError);
        toast.error('Có lỗi xảy ra khi xử lý đăng nhập');
        setLoading(false);
      }
    } catch (error) {
      setError(error.message || 'Đã có lỗi xảy ra');
      toast.error(error.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Đăng nhập</h2>
        <p className="text-gray-500 text-sm">Truy cập vào hệ thống EMR của bạn</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="your.email@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-gray-600">Ghi nhớ đăng nhập</span>
          </label>
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
            Quên mật khẩu?
          </a>
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              Đang đăng nhập...
            </>
          ) : (
            'Đăng nhập'
          )}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          Chưa có tài khoản?{' '}
          <button
            onClick={onSwitchToSignup}
            className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
          >
            Đăng ký ngay
          </button>
        </p>
      </div>
    </div>
  );
}
