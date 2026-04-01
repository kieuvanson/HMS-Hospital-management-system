import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import PatientNavbar from './PatientNavbar';
import ServiceTabs from './ServiceTabs';

const PatientLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Check if current page is doctor selection or related pages
  const isDoctorPage = location.pathname.includes('/doctor') || location.pathname.includes('select-doctor');

  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    if (!userRaw) return;
    try {
      const user = JSON.parse(userRaw);
      if (user.role && user.role !== 'patients') {
        navigate('/doctor/dashboard');
      }
    } catch {
      // ignore parse error
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <PatientNavbar />
      {!isDoctorPage && <ServiceTabs />}
      <main className={`flex-1 ${isDoctorPage ? 'pt-[116px]' : 'pt-0'}`}>
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 mt-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h4 className="font-bold text-slate-900 mb-3">HSM Healthcare</h4>
            <p className="text-slate-600 leading-6">
              Hệ thống quản lý và chăm sóc sức khỏe theo hướng cá nhân hóa cho bệnh nhân và đội ngũ y tế.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Dịch vụ</h4>
            <ul className="space-y-2 text-slate-600">
              <li>Đặt lịch khám</li>
              <li>Theo dõi kết quả</li>
              <li>Quản lý đơn thuốc</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Hỗ trợ</h4>
            <ul className="space-y-2 text-slate-600">
              <li>Tổng đài: 1900 123 456</li>
              <li>Email: support@hsmhealth.vn</li>
              <li>Làm việc: 24/7</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-3">Địa chỉ</h4>
            <p className="text-slate-600 leading-6">
              123 Đường Sức Khỏe, Hà Nội<br />
              Cơ sở 2: 25 Nguyễn Văn Linh, Đà Nẵng
            </p>
          </div>
        </div>
        <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} HSM Healthcare. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PatientLayout;

