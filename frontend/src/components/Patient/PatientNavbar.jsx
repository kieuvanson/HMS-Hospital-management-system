import React from 'react';
import { Search, Phone, Globe2, LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

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
    if (!avatarUrl) return '';
    if (avatarUrl.startsWith('blob:')) return avatarUrl;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `http://localhost:5000${avatarUrl}`;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      {/* Top bar */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-6">
            <span>Địa chỉ: 123 Đường Sức Khỏe, Hà Nội</span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <Globe2 className="w-3 h-3" /> Hỗ trợ khách hàng
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Ngôn ngữ: VI</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 font-medium"
            >
              <LogOut className="w-3 h-3" /> Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex items-center gap-6">
        {/* Logo */}
        <Link to="/patient/home" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
            Y
          </div>
          <div className="leading-tight">
            <p className="font-bold text-primary-700 text-sm">MediCore</p>
            <p className="text-[11px] text-gray-500">Chăm sóc sức khỏe toàn diện</p>
          </div>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm gói khám, xét nghiệm, bác sĩ..."
              className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Hotline & user */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
              <Phone className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <p className="text-[11px] text-gray-500">Đường dây nóng</p>
              <p className="font-semibold text-primary-700 text-sm">1900 123 456</p>
            </div>
          </div>

          <Link to="/patient/profile" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
              {user.avatarUrl ? (
                <img src={getAvatarSrc(user.avatarUrl)} alt="avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-primary-700 text-xs font-semibold">{initials || 'BN'}</span>
              )}
            </div>
            <div className="hidden sm:block leading-tight max-w-[140px] text-left">
              <p className="text-xs font-medium text-gray-800 truncate group-hover:text-primary-700">
                {user?.name || 'Bệnh nhân'}
              </p>
              <p className="text-[11px] text-gray-500">Xem hồ sơ &amp; thông tin cá nhân</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default PatientNavbar;

