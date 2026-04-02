import React from 'react';
import { Search, Phone, Globe2, LogOut, CalendarPlus, ChevronDown } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toBackendAssetUrl } from '../../services/api';

const PatientNavbar = () => {
  const navigate = useNavigate();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth/login');
  };

  const initials =
    user?.name &&
    user.name
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0]?.toUpperCase())
      .join('')
      .slice(0, 2);

  // Helper để lấy link avatar đầy đủ
  const getAvatarSrc = (avatarUrl) => {
    return toBackendAssetUrl(avatarUrl);
  };

  return (
    <header className="sticky top-0 z-40 shadow-sm">
      <div className="bg-sky-700 text-sky-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-10 flex items-center justify-between text-xs">
          <div className="hidden sm:flex items-center gap-5">
            <span>Trung tâm hỗ trợ: 1900 123 456</span>
            <span className="inline-flex items-center gap-1">
              <Globe2 className="w-3 h-3" /> Hỗ trợ khách hàng
            </span>
          </div>
          <div className="w-full sm:w-auto flex items-center justify-end gap-5">
            <Link to="/patient/appointments" className="hover:text-white transition-colors">Đặt lịch khám</Link>
            <Link to="/patient/articles" className="hover:text-white transition-colors">Cẩm nang sức khỏe</Link>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center gap-5">
          <Link to="/patient/home" className="flex items-center gap-3 flex-shrink-0 hover:opacity-80 transition-opacity">
            <div className="w-11 h-11 rounded-lg bg-sky-700 flex items-center justify-center text-white font-bold">
              H
            </div>
            <div className="leading-tight">
              <p className="font-extrabold tracking-wide text-sky-800 text-sm">HSM HEALTHCARE</p>
              <p className="text-[11px] text-slate-500">Hệ thống chăm sóc sức khỏe</p>
            </div>
          </Link>

          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bác sĩ, chuyên khoa, bài viết..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-sky-700">
            <CalendarPlus className="w-5 h-5" />
            <div className="leading-tight">
              <p className="text-[11px] text-slate-500">Đặt lịch nhanh</p>
              <p className="font-semibold text-sm">Khám trong ngày</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-sky-50 flex items-center justify-center text-sky-700">
                <Phone className="w-4 h-4" />
              </div>
              <div className="leading-tight">
                <p className="text-[11px] text-slate-500">Tổng đài 24/7</p>
                <p className="font-semibold text-sky-800 text-sm">1900 123 456</p>
              </div>
            </div>

            <Link to="/patient/profile" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center overflow-hidden">
                {user.avatarUrl ? (
                  <img src={getAvatarSrc(user.avatarUrl)} alt="avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-sky-700 text-xs font-semibold">{initials || 'BN'}</span>
                )}
              </div>
              <div className="hidden sm:block leading-tight max-w-[140px] text-left">
                <p className="text-xs font-medium text-slate-800 truncate group-hover:text-sky-700">
                  {user?.name || 'Bệnh nhân'}
                </p>
                <p className="text-[11px] text-slate-500">Tài khoản</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-rose-500 hover:text-rose-600 font-medium text-sm"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-12 flex items-center gap-8 overflow-x-auto text-slate-600 text-[15px]">
          <Link to="/patient/specialties" className="hover:text-sky-700 whitespace-nowrap">Chuyên khoa</Link>
          <Link to="/patient/guide" className="hover:text-sky-700 whitespace-nowrap">Hướng dẫn bệnh nhân</Link>
          <a href="#" className="hover:text-sky-700 whitespace-nowrap">Phát triển bền vững</a>
          <a href="#" className="hover:text-sky-700 whitespace-nowrap">Về HSM</a>
          <a href="#" className="hover:text-sky-700 whitespace-nowrap">Chuyên trang sức khỏe</a>
        </div>
      </div>
    </header>
  );
};

export default PatientNavbar;

