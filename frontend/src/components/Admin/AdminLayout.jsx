import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, BarChart3, Users, Stethoscope, UserCheck, DollarSign, Settings, FileText, Home, LogOut, Heart } from "lucide-react";

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [expandedMenu, setExpandedMenu] = useState({});

  const menuItems = [
    { path: "/admin/dashboard", label: "Trang chủ", icon: Home },
    { path: "/admin/doctors", label: "Quản lý Bác sĩ", icon: Stethoscope },
    { path: "/admin/nurses", label: "Quản lý Y tá", icon: UserCheck },
    { path: "/admin/users", label: "Quản lý người dùng", icon: Users },
    { path: "/admin/expenses", label: "Chi tiêu", icon: DollarSign },
    { path: "/admin/reports", label: "Báo cáo", icon: FileText },
    { path: "/admin/settings", label: "Cài đặt", icon: Settings },
  ];

  const toggleMenu = (groupName) => {
    setExpandedMenu(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const handleLogout = () => {
    // Xóa token
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirect về login
    navigate('/auth/login');
  };

  const menuGroups = [
    {
      name: "DASHBOARD & QUẢN LÝ",
      items: [
        { path: "/admin/dashboard", label: "Trang chủ", icon: Home },
        { path: "/admin/doctors", label: "Quản lý Bác sĩ", icon: Stethoscope },
        { path: "/admin/nurses", label: "Quản lý Y tá", icon: UserCheck },
        { path: "/admin/users", label: "Quản lý người dùng", icon: Users },
      ]
    },
    {
      name: "TÀI CHÍNH & BÁOOCÁO",
      items: [
        { path: "/admin/expenses", label: "Chi tiêu", icon: DollarSign },
        { path: "/admin/reports", label: "Báo cáo", icon: FileText, hasSubmenu: true },
      ]
    },
    {
      name: "CẤU HÌNH HỆ THỐNG",
      items: [
        { path: "#logout", label: "Đăng xuất", icon: LogOut, isLogout: true },
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-64 bg-slate-900 text-white shadow-lg flex flex-col overflow-y-auto">
        {/* Logo Section */}
        <div className="bg-slate-900 p-6 flex-shrink-0 border-b border-slate-700">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
              <Heart className="w-7 h-7 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">MediCore</p>
              <p className="text-xs text-gray-300">Quản lý bệnh viện</p>
            </div>
          </div>
        </div>


        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <a
                key={item.path}
                href={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-slate-700 text-blue-400"
                    : "text-gray-300 hover:bg-slate-700/50 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        {/* Footer - Logout */}
        <div className="border-t border-slate-700 p-4 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-slate-700/50 hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Đăng xuất</span>
          </button>
          <p className="text-xs text-gray-500 mt-4 text-center">Phiên bản 1.0.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
