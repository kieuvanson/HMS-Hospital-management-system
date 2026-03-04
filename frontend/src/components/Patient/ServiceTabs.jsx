import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ServiceTabs = () => {
  const location = useLocation();

  const services = [
    { id: 'home', title: 'Trang chủ', link: '/patient/home' },
    { id: 'appointments', title: 'Đặt lịch khám', link: '/patient/appointments' },
    { id: 'visits', title: 'Lịch khám', link: '/patient/visits' },
    { id: 'results', title: 'Xem kết quả', link: '/patient/results' },
    { id: 'prescriptions', title: 'Đơn thuốc', link: '/patient/prescriptions' },
    { id: 'payments', title: 'Thanh toán', link: '/patient/payments' },
    { id: 'telemedicine', title: 'Tư vấn online', link: '/patient/telemedicine' },
    { id: 'reviews', title: 'Đánh giá', link: '/patient/reviews' },
  ];

  const isActive = (link) => location.pathname === link;

  return (
    <nav className="sticky top-[95px] z-30 bg-gray-100 border-b border-gray-300\">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex overflow-x-auto">
          {services.map((service) => (
            <Link
              key={service.id}
              to={service.link}
              className={`px-6 py-4 text-center whitespace-nowrap font-medium transition-colors ${
                isActive(service.link)
                  ? 'text-blue-600 border-b-4 border-blue-600'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {service.title}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default ServiceTabs;
