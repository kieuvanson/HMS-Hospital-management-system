import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';

const DoctorLayout = () => {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await userAPI.getProfile();
        setDoctor(user);
      } catch (error) {
        console.error('Không lấy được hồ sơ bác sĩ:', error);
        toast.error('Không lấy được thông tin bác sĩ');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <Sidebar doctor={doctor} loading={loading} />
      <div className="flex-1 overflow-auto focus:outline-none">
        <Header doctorName={doctor?.name || 'Bác sĩ'} />
        <main className="flex-1 relative pb-8 z-0 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
            <Outlet context={{ doctor, loading }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorLayout;
