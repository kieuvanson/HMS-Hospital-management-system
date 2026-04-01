import React, { useState, useEffect } from 'react';
import banner1 from '../../assets/img/system/baner1.png';
import banner2 from '../../assets/img/system/baner2.png';
import banner3 from '../../assets/img/system/baner3.png';
import bannerDocter from '../../assets/img/system/banner_docter.png';
import { Link, useNavigate } from 'react-router-dom';
import { getHealthArticles } from '../../services/healthArticles';
import {
  CalendarCheck,
  Stethoscope,
  ShieldCheck,
  Phone,
  FlaskConical,
  Award,
  BadgeCheck,
  Medal,
  Shield,
  Building2,
  ArrowRight,
} from 'lucide-react';

const PatientHome = () => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [healthArticles, setHealthArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  const banners = [
    {
      img: banner1,
      title: 'Chăm sóc bằng tài năng, đạo đức và sự thấu cảm',
      subtitle:
        'HSM xây dựng hành trình khám chữa bệnh hiện đại, minh bạch và tối ưu trải nghiệm cho từng bệnh nhân.',
      tag: 'Hệ thống chăm sóc sức khỏe toàn diện',
    },
    {
      img: banner2,
      title: 'Đội ngũ bác sĩ đồng hành cùng bạn mọi giai đoạn',
      subtitle:
        'Kết nối nhanh với bác sĩ chuyên khoa, đặt lịch linh hoạt và theo dõi kết quả trên một nền tảng duy nhất.',
      tag: 'Bác sĩ tận tâm - Bệnh nhân an tâm',
    },
    {
      img: banner3,
      title: 'Công nghệ hiện đại nâng cao chất lượng điều trị',
      subtitle:
        'Quy trình thông minh, dữ liệu thống nhất và nền tảng y tế số giúp chuẩn hóa hoạt động khám chữa bệnh.',
      tag: 'Công nghệ vì sức khỏe',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadArticles = async () => {
      const articles = await getHealthArticles(3);
      if (isActive) {
        setHealthArticles(articles);
        setArticlesLoading(false);
      }
    };

    loadArticles();

    return () => {
      isActive = false;
    };
  }, []);

  const banner = banners[currentBanner];
  const certificateLogos = [
    {
      code: 'JCI',
      name: 'Joint Commission International',
      Icon: BadgeCheck,
      accent: 'from-sky-500 to-blue-600',
    },
    {
      code: 'ISO 9001',
      name: 'Quality Management System',
      Icon: Medal,
      accent: 'from-indigo-500 to-blue-700',
    },
    {
      code: 'RTAC',
      name: 'Reproductive Technology Accreditation',
      Icon: Shield,
      accent: 'from-emerald-500 to-cyan-600',
    },
  ];
  const partnerLogos = [
    {
      name: 'Osaka Metropolitan University',
      short: 'OMU',
      accent: 'from-amber-400 to-yellow-500',
      ring: 'ring-amber-100',
      bg: 'from-amber-50 to-yellow-50',
    },
    {
      name: 'The University of Sydney',
      short: 'USYD',
      accent: 'from-red-500 to-rose-500',
      ring: 'ring-rose-100',
      bg: 'from-rose-50 to-pink-50',
    },
    {
      name: 'Macquarie University',
      short: 'MQ',
      accent: 'from-emerald-500 to-teal-500',
      ring: 'ring-emerald-100',
      bg: 'from-emerald-50 to-teal-50',
    },
  ];

  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-100 to-emerald-50" />
        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="inline-flex items-center px-4 py-1.5 rounded-full bg-white text-sky-700 text-xs font-semibold border border-sky-100 shadow-sm mb-5">
                {banner.tag}
              </p>
              <h1 className="text-4xl lg:text-6xl font-black text-slate-800 leading-tight">
                {banner.title}
              </h1>
              <p className="mt-5 text-slate-600 text-lg max-w-xl">{banner.subtitle}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/patient/appointments')}
                  className="px-7 py-3 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors"
                >
                  Đặt lịch ngay
                </button>
                <Link
                  to="/patient/profile"
                  className="px-7 py-3 rounded-full bg-white text-slate-700 border border-slate-200 font-semibold hover:bg-slate-100 transition-colors"
                >
                  Hồ sơ của tôi
                </Link>
              </div>
              <div className="mt-8 flex gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentBanner(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === currentBanner ? 'w-9 bg-sky-700' : 'w-2 bg-sky-300'
                    }`}
                    aria-label={`Banner ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-emerald-200/50 rounded-full blur-3xl" />
              <img
                src={banner.img}
                alt="hero"
                className="relative z-10 w-full h-[380px] lg:h-[440px] object-cover rounded-3xl border border-white shadow-xl"
              />
            </div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 lg:px-8 -mt-8 lg:-mt-10 z-20">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl grid grid-cols-1 md:grid-cols-3 overflow-hidden">
            <div className="p-6 flex gap-3 border-b md:border-b-0 md:border-r border-slate-100">
              <Phone className="w-6 h-6 text-sky-700 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-800">Gọi tổng đài</p>
                <p className="text-sm text-slate-500 mt-1">Tư vấn và giải đáp vấn đề của bạn</p>
              </div>
            </div>
            <div className="p-6 flex gap-3 border-b md:border-b-0 md:border-r border-slate-100">
              <CalendarCheck className="w-6 h-6 text-sky-700 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-800">Đặt lịch hẹn</p>
                <p className="text-sm text-slate-500 mt-1">Đặt nhanh, chọn giờ linh hoạt</p>
              </div>
            </div>
            <div className="p-6 flex gap-3">
              <Stethoscope className="w-6 h-6 text-sky-700 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-800">Tìm bác sĩ</p>
                <p className="text-sm text-slate-500 mt-1">Tìm chuyên gia phù hợp nhanh chóng</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <img
            src={bannerDocter}
            alt="doctor"
            className="w-full h-[430px] lg:h-[500px] max-w-xl mx-auto rounded-[2rem] object-cover object-top shadow-lg"
          />
          <div>
            <h2 className="text-4xl font-black text-slate-800">Tại sao nên chọn HSM?</h2>
            <div className="w-36 h-1 bg-emerald-400 rounded-full mt-3 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <ShieldCheck className="w-7 h-7 text-sky-700 mb-3" />
                <h3 className="font-bold text-slate-800 text-xl">Chất lượng quốc tế</h3>
                <p className="text-slate-600 text-sm mt-2">
                  Quy trình vận hành được chuẩn hóa, tập trung vào an toàn bệnh nhân.
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <Stethoscope className="w-7 h-7 text-sky-700 mb-3" />
                <h3 className="font-bold text-slate-800 text-xl">Chuyên gia hàng đầu</h3>
                <p className="text-slate-600 text-sm mt-2">
                  Đội ngũ bác sĩ và điều dưỡng nhiều kinh nghiệm từ các chuyên khoa.
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <FlaskConical className="w-7 h-7 text-sky-700 mb-3" />
                <h3 className="font-bold text-slate-800 text-xl">Công nghệ tiên tiến</h3>
                <p className="text-slate-600 text-sm mt-2">
                  Ứng dụng hệ thống số để kết nối lịch hẹn, hồ sơ và kết quả cận lâm sàng.
                </p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <Award className="w-7 h-7 text-sky-700 mb-3" />
                <h3 className="font-bold text-slate-800 text-xl">Nghiên cứu đổi mới</h3>
                <p className="text-slate-600 text-sm mt-2">
                  Liên tục cập nhật phương pháp điều trị nhằm nâng cao hiệu quả chăm sóc.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sky-700 text-white py-14 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h2 className="text-4xl font-black">Chứng nhận và giải thưởng</h2>
          <div className="w-44 h-1 bg-white/80 rounded-full mt-3 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <p className="text-sky-100 text-lg">
              HSM tự hào được các tổ chức uy tín ghi nhận trong lĩnh vực quản lý chất lượng và an toàn y tế.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {certificateLogos.map((item) => {
                const Icon = item.Icon;
                return (
                  <div
                    key={item.code}
                    className="h-28 rounded-2xl bg-white text-sky-700 font-bold flex flex-col items-center justify-center border border-sky-100 shadow-sm"
                  >
                    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${item.accent} text-white flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="mt-2 text-base leading-none">{item.code}</p>
                    <p className="mt-1 text-[10px] text-slate-500 font-medium text-center px-2 line-clamp-2">{item.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <img src={banner3} alt="hospital" className="rounded-3xl w-full h-[340px] object-cover shadow-md" />
          <div>
            <h2 className="text-5xl font-black text-slate-800 leading-tight">
              Hệ thống phòng khám và trung tâm của chúng tôi
            </h2>
            <div className="w-40 h-1 bg-emerald-400 rounded-full mt-3 mb-6" />
            <p className="text-slate-600 text-lg leading-8">
              Mạng lưới cơ sở được xây dựng để tối ưu quá trình tiếp đón, thăm khám và theo dõi điều trị.
              Bệnh nhân có thể đặt lịch, theo dõi lịch sử và nhận thông báo ngay trên hệ thống.
            </p>
            <button className="mt-7 inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-7 py-3 rounded-full font-semibold transition-colors">
              Xem thêm <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-10 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <h2 className="text-5xl font-black text-center text-slate-800">Đối tác của chúng tôi</h2>
          <div className="w-36 h-1 bg-emerald-400 rounded-full mt-3 mb-10 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {partnerLogos.map((partner) => (
              <div
                key={partner.name}
                className="group relative rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className={`h-2 w-full bg-gradient-to-r ${partner.accent}`} />
                <div className={`p-6 bg-gradient-to-b ${partner.bg}`}>
                  <div className={`mx-auto w-16 h-16 rounded-2xl bg-white ring-4 ${partner.ring} flex items-center justify-center shadow-sm`}>
                    <Building2 className="w-5 h-5 text-slate-500 mr-1" />
                    <span className="text-xs font-black text-slate-700 tracking-wide">{partner.short}</span>
                  </div>
                  <p className="mt-4 text-slate-800 font-bold text-xl">{partner.short}</p>
                  <p className="mt-1 text-slate-600 font-semibold">{partner.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-4xl font-black text-slate-800">Cẩm nang sức khỏe</h2>
              <p className="text-slate-500 mt-2">
                Cập nhật bài viết mới nhất để bạn theo dõi sức khỏe chủ động hơn.
              </p>
            </div>
            <Link to="/patient/articles" className="text-sky-700 font-semibold hover:text-sky-900">
              Xem tất cả
            </Link>
          </div>

          {articlesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded mb-4" />
                  <div className="h-4 bg-slate-200 rounded mb-2" />
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {healthArticles.map((article) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md transition-shadow"
                >
                  <p className="text-xs text-emerald-600 font-semibold">{article.category}</p>
                  <h3 className="mt-2 text-xl font-bold text-slate-800 group-hover:text-sky-700 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="mt-3 text-slate-600 text-sm line-clamp-3">{article.excerpt}</p>
                  <p className="mt-4 text-xs text-slate-400">{article.date}</p>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PatientHome;
