import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings, 
  Stethoscope,
  ClipboardList,
  LogOut
} from 'lucide-react';

const Sidebar = ({ doctor, loading }) => {
  const location = useLocation();
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
  
  const navItems = [
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
      name: 'Lịch hẹn hôm nay', 
      icon: <Calendar className="h-5 w-5" />, 
      path: '/doctor/appointments' 
    },
    { 
      name: 'Đơn thuốc', 
      icon: <FileText className="h-5 w-5" />, 
      path: '/doctor/prescriptions' 
    },
    { 
      name: 'Khám bệnh', 
      icon: <Stethoscope className="h-5 w-5" />, 
      path: '/doctor/examinations' 
    },
    { 
      name: 'Báo cáo thống kê', 
      icon: <BarChart3 className="h-5 w-5" />, 
      path: '/doctor/reports' 
    },
    { 
      name: 'Cài đặt', 
      icon: <Settings className="h-5 w-5" />, 
      path: '/doctor/settings' 
    },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-[#1E293B] text-[#F1F5F9]">
        {/* Logo và tên hệ thống */}
        <div className="flex items-center justify-center py-4 border-b border-[#334155]">
          <div className="flex items-center gap-3">
            <img src="/assets/logo-medicare.png" alt="MediCare Logo" className="h-10 w-10" />
            <h1 className="text-lg font-bold text-[#F1F5F9]">MediCare</h1>
          </div>
        </div>

        {/* Thông tin bác sĩ */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[#334155]">
          <div className="flex items-center justify-center bg-[#3B82F6] text-white rounded-full h-10 w-10 font-bold">
            {loading ? '...' : initials}
          </div>
          <div>
            <p className="text-sm font-medium text-[#F1F5F9]">BS. {displayName}</p>
            <p className="text-xs text-[#64748B]">{subtitle}</p>
          </div>
        </div>

        {/* Menu điều hướng */}
        <nav className="flex-1 px-3 py-4 space-y-2">
          {navItems.map((item) => (
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
