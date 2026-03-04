import React from 'react';

const Reviews = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 space-y-5">
      <h1 className="text-2xl font-semibold text-secondary-900">Đánh giá dịch vụ y tế</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-sm space-y-4">
        <p className="text-secondary-600">
          Cảm ơn bạn đã sử dụng dịch vụ của MediCore. Hãy chia sẻ cảm nhận để chúng tôi cải thiện tốt
          hơn.
        </p>

        <div className="space-y-3">
          <div>
            <p className="font-semibold text-secondary-900 mb-1">Mức độ hài lòng chung</p>
            <div className="flex gap-2 text-xl">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} className="text-yellow-400">
                  ★
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-secondary-600 mb-1">Thời gian chờ</p>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>Rất hài lòng</option>
                <option>Hài lòng</option>
                <option>Bình thường</option>
                <option>Chưa hài lòng</option>
              </select>
            </div>
            <div>
              <p className="text-secondary-600 mb-1">Thái độ nhân viên</p>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>Rất hài lòng</option>
                <option>Hài lòng</option>
                <option>Bình thường</option>
                <option>Chưa hài lòng</option>
              </select>
            </div>
          </div>
          <div>
            <p className="text-secondary-600 mb-1">Ý kiến đóng góp thêm</p>
            <textarea
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ví dụ: khu vực chờ cần thêm ghế, mong muốn có thêm dịch vụ khám ngoài giờ..."
            />
          </div>
          <div className="flex justify-end">
            <button className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
              Gửi đánh giá
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviews;

