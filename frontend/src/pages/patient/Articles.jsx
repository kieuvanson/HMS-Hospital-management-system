import React from 'react';

const mockArticles = [
  {
    id: 1,
    tag: 'Sức khỏe phụ nữ',
    title: '5 dấu hiệu cần đi khám phụ khoa sớm',
    excerpt: 'Nhận biết sớm các dấu hiệu bất thường giúp phòng ngừa nhiều bệnh lý nguy hiểm...',
    date: '02/03/2026',
  },
  {
    id: 2,
    tag: 'Dinh dưỡng',
    title: 'Chế độ ăn giúp tăng sức đề kháng',
    excerpt:
      'Một số nhóm thực phẩm nên bổ sung thường xuyên để nâng cao hệ miễn dịch cho cả gia đình...',
    date: '25/02/2026',
  },
  {
    id: 3,
    tag: 'Tim mạch',
    title: '7 thói quen tốt cho người tăng huyết áp',
    excerpt:
      'Tập thể dục đều đặn, hạn chế muối, ngủ đủ giấc là những yếu tố quan trọng trong kiểm soát huyết áp...',
    date: '18/02/2026',
  },
];

const Articles = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-5">
      <h1 className="text-2xl font-semibold text-secondary-900">Bài viết &amp; tin tức y tế</h1>
      <p className="text-sm text-secondary-600">
        Cập nhật kiến thức y khoa, lời khuyên chăm sóc sức khỏe từ đội ngũ bác sĩ của MediCore.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {mockArticles.map((a) => (
          <article
            key={a.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
          >
            <div className="h-28 bg-gradient-to-tr from-primary-200 via-primary-100 to-secondary-50" />
            <div className="p-4 flex-1 flex flex-col space-y-2 text-sm">
              <span className="inline-flex px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[11px] font-semibold">
                {a.tag}
              </span>
              <h2 className="font-semibold text-secondary-900 line-clamp-2">{a.title}</h2>
              <p className="text-secondary-600 text-xs line-clamp-3 flex-1">{a.excerpt}</p>
              <p className="text-[11px] text-secondary-500 mt-1">Cập nhật: {a.date}</p>
              <button className="mt-1 inline-flex text-xs text-primary-700 font-semibold hover:text-primary-800">
                Xem chi tiết
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Articles;

