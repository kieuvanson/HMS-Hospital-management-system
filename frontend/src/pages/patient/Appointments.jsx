
import React from 'react';
import AppointmentForm from '../../components/AppointmentForm';

const Appointments = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 -my-4">
      <h1 className="text-2xl font-semibold text-secondary-900 mb-4">Đặt lịch khám bác sĩ</h1>
      <AppointmentForm />
    </div>
  );
};

export default Appointments;
