import React from 'react';
import DoctorCard from '../components/DoctorCard';

const doctors = [
  {
    id: 1,
    name: 'GS. TS. BS. Nguyễn Đức Công',
    title: 'Nguyên Giám đốc Bệnh viện Thống Nhất',
    specialty: 'Nội tổng quát',
    avatar: 'path/to/avatar1.jpg',
  },
  {
    id: 2,
    name: 'PGS. TS. BS. Lê Văn Quang',
    title: 'Nguyên Phó giám đốc Bệnh viện Thống Nhất',
    specialty: 'Tim mạch',
    avatar: 'path/to/avatar2.jpg',
  },
  // Thêm các bác sĩ khác
];

const Doctors = () => {
  const handleViewDetails = (doctorId) => {
    console.log(`Xem thông tin bác sĩ với ID: ${doctorId}`);
    // Thêm logic để chuyển đến trang chi tiết bác sĩ
  };

  const handleBookAppointment = (doctorId) => {
    console.log(`Đặt lịch với bác sĩ ID: ${doctorId}`);
    // Thêm logic để chuyển đến trang đặt lịch
  };

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-secondary-900 mb-6">Đội ngũ chuyên gia</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            onViewDetails={handleViewDetails}
            onBookAppointment={handleBookAppointment}
          />
        ))}
      </div>
    </div>
  );
};

export default Doctors;