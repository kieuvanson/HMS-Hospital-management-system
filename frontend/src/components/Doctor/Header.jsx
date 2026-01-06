import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Bell } from 'lucide-react';

const Header = ({ doctorName, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Xóa token local và chuyển hướng
    localStorage.removeItem('accessToken');
    if (onLogout) onLogout();
    navigate('/auth/login');
  };

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
      <div className="w-full px-3 sm:px-4 lg:px-6 flex items-center justify-between h-16 gap-3">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 gap-3">
          <div className="bg-blue-500 rounded-lg p-2 flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="white"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 10h11M9 21V3m12 7h-7m7 0l-3.5 3.5M19 10l-3.5-3.5"
              />
            </svg>
          </div>
          <span className="text-lg font-bold text-gray-800 whitespace-nowrap">Hệ thống HSM</span>
        </div>

        {/* Breadcrumb */}
        <nav className="hidden md:flex items-center text-sm text-gray-500 whitespace-nowrap">
          <span className="hover:text-gray-700">Trang chủ</span>
          <span className="mx-2">/</span>
          <span className="text-gray-700 font-medium">Tổng quan</span>
        </nav>

        {/* Search Bar */}
        <div className="hidden lg:flex items-center flex-1 max-w-xl">
          <input
            type="text"
            placeholder="Tìm kiếm bệnh nhân..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Search icon (mobile) */}
        <div className="lg:hidden flex items-center">
          <input
            type="text"
            placeholder="Tìm kiếm bệnh nhân..."
            className="w-40 sm:w-56 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Notification and User Actions */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-3 pr-3 border-r border-gray-200">
            <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold uppercase">
              {(doctorName || 'BS')
                .split(' ')
                .filter(Boolean)
                .map((p) => p[0]?.toUpperCase())
                .join('')
                .slice(0, 2)}
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800 truncate max-w-[140px] sm:max-w-[200px]">BS. {doctorName || 'Đang tải'}</p>
              <p className="text-xs text-gray-500">Tài khoản bác sĩ</p>
            </div>
          </div>
          <button className="relative">
            <Bell className="h-6 w-6 text-gray-500 hover:text-gray-700" />
            <span className="absolute top-0 right-0 inline-flex items-center justify-center h-4 w-4 text-xs font-bold text-white bg-red-500 rounded-full">3</span>
          </button>
          <button onClick={handleLogout} className="flex items-center space-x-2">
            <LogOut className="h-6 w-6 text-gray-500 hover:text-gray-700" />
            <span className="text-sm text-gray-500 hover:text-gray-700">Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
