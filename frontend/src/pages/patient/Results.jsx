import React from 'react';

const Results = () => {
  const results = [
    {
      date: '01/03/2026',
      type: 'Xét nghiệm máu tổng quát',
      status: 'Đã có kết quả',
      doctor: 'BS. Nguyễn Thị Lan',
    },
    {
      date: '15/02/2026',
      type: 'Chụp X-quang phổi',
      status: 'Đã có kết quả',
      doctor: 'BS. Trần Văn Minh',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-secondary-900 mb-4">
        Kết quả xét nghiệm &amp; chẩn đoán hình ảnh
      </h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 text-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <p className="text-secondary-600">
            Xem nhanh các kết quả cận lâm sàng đã thực hiện tại hệ thống MediCore.
          </p>
          <button className="px-4 py-2 rounded-full border border-primary-200 text-primary-700 hover:bg-primary-50">
            Tải tất cả dưới dạng PDF
          </button>
        </div>

        <div className="space-y-3">
          {results.map((r, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row md:items-center justify-between gap-3 border border-gray-100 rounded-xl p-3 hover:border-primary-200"
            >
              <div>
                <p className="text-xs text-secondary-500">{r.date}</p>
                <p className="font-semibold text-secondary-900">{r.type}</p>
                <p className="text-xs text-secondary-500 mt-1">Bác sĩ chỉ định: {r.doctor}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                  {r.status}
                </span>
                <button className="px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs hover:bg-primary-700">
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;

