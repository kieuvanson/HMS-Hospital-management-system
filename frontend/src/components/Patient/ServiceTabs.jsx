import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ServiceTabs = () => {
  const location = useLocation();

  const services = [
    { id: 'home', title: 'Trang chủ', link: '/patient/home' },
    { id: 'appointments', title: 'Đặt lịch khám', link: '/patient/appointments' },
    { id: 'visits', title: 'Lịch khám', link: '/patient/visits' },
    { id: 'examinations', title: 'Phiếu khám', link: '/patient/examinations' },
    { id: 'results', title: 'Xem kết quả', link: '/patient/results' },
    { id: 'prescriptions', title: 'Đơn thuốc', link: '/patient/prescriptions' },
    { id: 'payments', title: 'Thanh toán', link: '/patient/payments' },
    { id: 'telemedicine', title: 'Tư vấn online', link: '/patient/telemedicine' },
    { id: 'reviews', title: 'Đánh giá', link: '/patient/reviews' },
  ];

  const isActive = (link) => location.pathname === link;

  return (
    <nav className="sticky top-[116px] z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex overflow-x-auto gap-1 py-1">
          {services.map((service) => (
            <Link
              key={service.id}
              to={service.link}
              className={`px-4 py-3 text-center whitespace-nowrap text-sm font-medium rounded-lg transition-colors ${
                isActive(service.link)
                  ? 'text-sky-700 bg-sky-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
