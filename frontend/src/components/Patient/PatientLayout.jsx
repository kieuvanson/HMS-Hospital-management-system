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
    <div className="min-h-screen flex flex-col bg-secondary-50">
      <PatientNavbar />
      {!isDoctorPage && <ServiceTabs />}
      <main className={`flex-1 ${isDoctorPage ? 'pt-[95px]' : 'pt-[70px]'}`}>
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-100 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} MediCore. All rights reserved.
      </footer>
    </div>
  );
};

export default PatientLayout;

