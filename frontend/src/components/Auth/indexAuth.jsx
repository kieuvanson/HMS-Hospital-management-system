import React, { useState } from 'react';
import { Heart, Lock, Activity } from 'lucide-react';
import Login from './Login';
import Signup from './Signup';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-teal-500 p-12 flex-col justify-between text-white">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Activity className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">MediCore – Hospital Management System</h1>
                <p className="text-blue-100 text-sm">Hệ thống quản lý bệnh viện điện tử hiện đại</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold leading-tight">
                Quản lý tác vụ y tế điện tử chuyên nghiệp
              </h2>
              <p className="text-blue-50 leading-relaxed">
                Hệ thống MediCore hiện đại, bảo mật cao, giúp tối ưu hóa quy trình khám chữa bệnh và quản lý thông tin bệnh nhân.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <Heart className="w-5 h-5" />
              <span className="text-sm">Bảo mật thông tin tuyệt đối</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
              <Lock className="w-5 h-5" />
              <span className="text-sm">Tuân thủ tiêu chuẩn y tế quốc tế</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12">
          <div className="max-w-md mx-auto">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
              <Activity className="w-7 h-7 text-blue-600" />
              <span className="text-xl font-bold text-gray-800">MediCore</span>
            </div>

            {isLogin ? (
              <Login onSwitchToSignup={toggleMode} />
            ) : (
              <Signup onSwitchToLogin={toggleMode} />
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500">
                Bằng việc đăng nhập, bạn đồng ý với{' '}
                <a href="#" className="text-blue-600 hover:underline">Điều khoản dịch vụ</a>
                {' '}và{' '}
                <a href="#" className="text-blue-600 hover:underline">Chính sách bảo mật</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
