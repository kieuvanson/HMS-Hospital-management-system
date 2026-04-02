import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toBackendAssetUrl } from '../../services/api';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Stethoscope,
  LogOut,
  Heart,
  ClipboardCheck,
  Wallet,
  FileText
} from 'lucide-react';

const getAvatarUrl = (url) => {
  return toBackendAssetUrl(url) || null;
};

const Sidebar = ({ doctor, loading }) => {
  const location = useLocation();
  const [avatarUrl, setAvatarUrl] = useState(null);
  
  const displayName = doctor?.name || 'Đang tải...';
  const subtitle = doctor?.role ? doctor.role : (doctor?.email || 'Nội tổng quát');
  const initials = doctor?.name
    ? doctor.name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase())
        .join('')
        .slice(0, 2)
    : 'BS';

  // Lắng nghe event profileUpdated
  useEffect(() => {
    const handleProfileUpdate = () => {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      setAvatarUrl(currentUser.avatarUrl);
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    // Lấy avatar từ localStorage lần đầu
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    setAvatarUrl(currentUser.avatarUrl);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);
  
  const workNavItems = [
    { 
      name: 'Tổng quan', 
      icon: <LayoutDashboard className="h-5 w-5" />, 
      path: '/doctor/dashboard' 
    },
    { 
      name: 'Bệnh nhân', 
      icon: <Users className="h-5 w-5" />, 
      path: '/doctor/patients' 
    },
    { 
      name: 'Lịch hẹn', 
      icon: <Calendar className="h-5 w-5" />, 
      path: '/doctor/appointments' 
    },
    { 
      name: 'Khám bệnh', 
      icon: <Stethoscope className="h-5 w-5" />, 
      path: '/doctor/examinations' 
    },
    { 
      name: 'Báo cáo', 
      icon: <BarChart3 className="h-5 w-5" />, 
      path: '/doctor/reports' 
    },
    { 
      name: 'Cài đặt', 
      icon: <Settings className="h-5 w-5" />, 
      path: '/doctor/settings' 
    },
  ];

  const personalNavItems = [
    {
      name: 'Đăng ký lịch làm việc',
      icon: <ClipboardCheck className="h-5 w-5" />,
      path: '/doctor/work-schedule-registration'
    },
    {
      name: 'Theo dõi mức lương',
      icon: <Wallet className="h-5 w-5" />,
      path: '/doctor/salary-tracking'
    },
    {
      name: 'Thủ tục hành chính',
      icon: <FileText className="h-5 w-5" />,
      path: '/doctor/administrative-procedures'
    }
  ];

  const renderNavSection = (title, items) => (
    <div className="space-y-2">
      <p className="px-4 text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">{title}</p>
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            location.pathname === item.path
              ? 'bg-[#334155] text-[#3B82F6]'
              : 'hover:bg-[#334155] hover:text-[#F1F5F9]'
          }`}
        >
          <span className="mr-3">{item.icon}</span>
          {item.name}
        </Link>
      ))}
    </div>
  );

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-[#1E293B] text-[#F1F5F9]">
        {/* Logo và tên hệ thống */}
        <div className="flex items-center justify-center py-4 border-b border-[#334155]">
          <div className="flex items-center gap-3 w-full px-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
              <Heart className="h-6 w-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-[#F1F5F9]">MediCore</h1>
              <p className="text-xs text-[#64748B]">Quản lý bệnh viện</p>
            </div>
          </div>
        </div>

        {/* Menu điều hướng */}
        <nav className="flex-1 px-3 py-4 space-y-5">
          {renderNavSection('Công việc', workNavItems)}
          {renderNavSection('Cá nhân', personalNavItems)}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#334155] p-4">
          <button className="flex items-center gap-2 text-sm font-medium text-[#F1F5F9] hover:text-[#EF4444]">
            <LogOut className="h-5 w-5" />
            Đăng xuất
          </button>
          <p className="text-xs text-[#64748B] mt-2">Phiên bản 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
