import React from 'react';

const DoctorCard = ({ doctor, onViewDetails, onBookAppointment }) => {
  const placeholderAvatar = 'https://via.placeholder.com/300x150?text=No+Image';

  return (
    <div className="bg-white rounded-lg shadow-md p-4 text-center border border-gray-200">
      <img
        src={doctor.avatar || placeholderAvatar}
        alt={doctor.name}
        className="w-full h-40 object-cover rounded-lg mb-4 border border-gray-300"
      />
      <h3 className="text-lg font-semibold text-secondary-900">{doctor.name}</h3>
      <p className="text-sm text-secondary-500">{doctor.title}</p>
      <p className="text-sm text-secondary-500">{doctor.specialty}</p>
      <div className="mt-4 flex justify-center gap-2">
        <button
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          onClick={() => onViewDetails(doctor.id)}
        >
          Xem thông tin
        </button>
        <button
          className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700"
          onClick={() => onBookAppointment(doctor.id)}
        >
          Đặt lịch
        </button>
      </div>
    </div>
  );
};

export default DoctorCard;