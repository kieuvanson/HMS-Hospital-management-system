import React, { useEffect, useState } from 'react';
import { getHealthArticles } from '../../services/healthArticles';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadArticles = async () => {
      const nextArticles = await getHealthArticles(9);
      if (isActive) {
        setArticles(nextArticles);
        setLoading(false);
      }
    };

    loadArticles();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-5">
      <h1 className="text-2xl font-semibold text-secondary-900">Bài viết &amp; tin tức y tế</h1>
      <p className="text-sm text-secondary-600">
        Cập nhật kiến thức y khoa và tin tức sức khỏe mới nhất từ nguồn tin bên ngoài.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading && [0, 1, 2, 3, 4, 5].map((item) => (
          <article
            key={item}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col animate-pulse"
          >
            <div className="h-28 bg-gray-200" />
            <div className="p-4 flex-1 flex flex-col space-y-2 text-sm">
              <div className="h-5 w-24 rounded-full bg-gray-200" />
              <div className="h-4 w-full rounded bg-gray-200" />
              <div className="h-4 w-4/5 rounded bg-gray-200" />
              <div className="h-4 w-3/5 rounded bg-gray-200" />
            </div>
          </article>
        ))}

        {!loading && articles.map((a) => (
          <article
            key={a.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
          >
            {a.image ? (
              <img src={a.image} alt={a.title} className="h-28 w-full object-cover" />
            ) : (
              <div className="h-28 bg-gradient-to-tr from-primary-200 via-primary-100 to-secondary-50" />
            )}
            <div className="p-4 flex-1 flex flex-col space-y-2 text-sm">
              <span className="inline-flex px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 text-[11px] font-semibold">
                {a.category}
              </span>
              <h2 className="font-semibold text-secondary-900 line-clamp-2">{a.title}</h2>
              <p className="text-secondary-600 text-xs line-clamp-3 flex-1">{a.excerpt}</p>
              <p className="text-[11px] text-secondary-500 mt-1">Cập nhật: {a.date}</p>
              <a
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex text-xs text-primary-700 font-semibold hover:text-primary-800"
              >
                Xem chi tiết
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Articles;

