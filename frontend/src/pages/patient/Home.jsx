import React, { useState, useEffect } from 'react';
import banner1 from '../../assets/img/system/baner1.png';
import banner2 from '../../assets/img/system/baner2.png';
import banner3 from '../../assets/img/system/baner3.png';
import banner4 from '../../assets/img/system/baner4.png';
import banner5 from '../../assets/img/system/baner5.png';
import { Link, useNavigate } from 'react-router-dom';
import { getHealthArticles } from '../../services/healthArticles';
import {
  CalendarCheck,
  FileText,
  Bell,
  CreditCard,
  MessageCircle,
  Star,
  Stethoscope,
  HeartPulse,
  Brain,
  ShieldCheck,
  UserCircle2,
  Phone,
  Activity,
  ClipboardList,
  Heart,
  TrendingUp,
} from 'lucide-react';

const PatientHome = () => {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [healthArticles, setHealthArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);

  // Banner data
  const banners = [
    {
      img: banner1,
      title: 'Chào mừng đến với MediCore',
      subtitle: 'Nơi sức khỏe của bạn được ưu tiên hàng đầu với đội ngũ y bác sĩ tận tâm và trang thiết bị hiện đại.',
      tag: 'Chăm sóc sức khỏe toàn diện',
    },
    {
      img: banner2,
      title: 'Đội ngũ bác sĩ tận tâm đồng hành cùng bạn',
      subtitle: 'Các bác sĩ giàu kinh nghiệm, luôn sẵn sàng tư vấn, chăm sóc và hỗ trợ bệnh nhân tận tình.',
      tag: 'Bác sĩ tận tâm - Bệnh nhân an tâm',
    },
    {
      img: banner3,
      title: 'Công nghệ hiện đại nâng tầm chất lượng',
      subtitle: 'Ứng dụng công nghệ tiên tiến, hệ thống thiết bị y tế hiện đại giúp chẩn đoán chính xác.',
      tag: 'Công nghệ vì sức khỏe',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentBanner(i => (i + 1) % banners.length), 5000);
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

  return (
    <div className="bg-white">
      {/* HERO BANNER SECTION */}
      <div className="relative h-96 lg:h-[500px] overflow-hidden group">
        <img
          src={banner.img}
          alt="Banner"
          className="w-full h-full object-cover transition-all duration-700"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />

        {/* Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-3xl mx-auto px-4 text-center text-white">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur border border-white/30 mb-4">
              <span className="text-sm font-semibold">{banner.tag}</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">
              {banner.title}
            </h1>
            <p className="text-base lg:text-lg text-gray-100 mb-8 max-w-2xl mx-auto">
              {banner.subtitle}
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/patient/appointments"
                className="px-6 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                Đặt lịch khám ngay
              </Link>
              <Link
                to="/patient/profile"
                className="px-6 py-3 rounded-full bg-white text-blue-600 font-semibold hover:bg-gray-100 transition-colors"
              >
                Cập nhật hồ sơ
              </Link>
            </div>
          </div>
        </div>

        {/* Banner Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentBanner(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === currentBanner ? 'bg-white w-8' : 'bg-white/50'
              }`}
              aria-label={`Banner ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* WELCOME & HIGHLIGHTS SECTION */}
      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left content */}
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 mb-4">
                <span className="text-sm font-semibold text-blue-700">Về MediCore</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Nơi sức khỏe của bạn là ưu tiên hàng đầu
              </h2>
              <p className="text-gray-600 text-lg mb-8">
                Với đội ngũ bác sĩ chuyên khoa, trang thiết bị hiện đại và dịch vụ chu đáo, 
                MediCore cam kết mang lại chất lượng chăm sóc sức khỏe tốt nhất.
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">200+</div>
                  <p className="text-sm text-gray-600">Bác sĩ chuyên khoa</p>
                </div>
                <div className="text-center border-l border-r border-gray-200">
                  <div className="text-3xl font-bold text-blue-600 mb-1">24/7</div>
                  <p className="text-sm text-gray-600">Hỗ trợ trực tuyến</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">100%</div>
                  <p className="text-sm text-gray-600">Bảo mật dữ liệu</p>
                </div>
              </div>
            </div>

            {/* Right: Promo Card */}
            <div className="relative">
              <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 shadow-xl">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                
                <div className="relative z-10 space-y-6">
                  <div>
                    <p className="text-blue-100 text-sm font-semibold uppercase tracking-wide mb-2">Ưu đãi tháng này</p>
                    <h3 className="text-2xl lg:text-3xl font-bold mb-2">
                      Gói khám tổng quát
                    </h3>
                    <p className="text-5xl font-bold text-blue-100">
                      Giảm 30%
                    </p>
                  </div>
                  <p className="text-blue-50 text-sm">
                    Phát hiện sớm các bệnh lý thường gặp, chủ động bảo vệ sức khỏe bản thân.
                  </p>
                  <div className="flex gap-3 pt-2">
                    <button className="flex-1 px-4 py-3 rounded-full bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-colors">
                      Tư vấn miễn phí
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK BOOKING SECTION - ADVERTISEMENT BANNER */}
      <section className="bg-gradient-to-b from-blue-400 via-blue-300 to-blue-400 py-20 lg:py-24 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl -ml-40 -mb-40"></div>
        
        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Đặt lịch khám<br/>một cách dễ dàng
                </h2>
                <p className="text-lg text-blue-50 leading-relaxed">
                  Hỗ trợ bạn tìm bác sĩ phù hợp, chọn thời gian linh hoạt, và nhận xác nhận ngay lập tức
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white bg-opacity-30 flex items-center justify-center mt-1">
                    <span className="text-white text-sm">→</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Chọn bác sĩ chuyên khoa</p>
                    <p className="text-sm text-blue-100">Từ đội ngũ chuyên gia hàng đầu</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white bg-opacity-30 flex items-center justify-center mt-1">
                    <span className="text-white text-sm">→</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Thời gian khám linh hoạt</p>
                    <p className="text-sm text-blue-100">Phù hợp với lịch của bạn</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white bg-opacity-30 flex items-center justify-center mt-1">
                    <span className="text-white text-sm">→</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white">Xác nhận ngay lập tức</p>
                    <p className="text-sm text-blue-100">Nhận thông báo qua email</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/patient/appointments')}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                <CalendarCheck className="w-6 h-6" />
                Đặt lịch ngay
              </button>
            </div>

            {/* Right Banner Image with Animation */}
            <div 
              className="hidden lg:flex items-start justify-center"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <style>{`
                @keyframes slideDownFade {
                  from {
                    opacity: 0;
                    transform: translateY(-30px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
                .banner-base {
                  transition: all 0.4s ease-in-out;
                }
                .banner-base.hovered {
                  opacity: 0.5;
                  filter: blur(4px);
                }
                .banner-overlay {
                  position: absolute;
                  top: 0;
                  left: 0;
                  opacity: 0;
                  transition: opacity 0.4s ease-in-out;
                  animation: none;
                }
                .banner-overlay.active {
                  opacity: 1;
                  animation: slideDownFade 0.5s ease-in-out forwards;
                }
              `}</style>
              
              <div className="relative w-full">
                {/* Base Banner */}
                <img 
                  src={banner4} 
                  alt="Medical Banner" 
                  className={`banner-base w-full h-96 object-cover rounded-2xl shadow-2xl ${isHovered ? 'hovered' : ''}`}
                />
                
                {/* Overlay Banner */}
                <img 
                  src={banner5} 
                  alt="Medical Banner Overlay" 
                  className={`banner-overlay w-full h-96 object-cover rounded-2xl shadow-2xl ${isHovered ? 'active' : ''}`}
                />
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* DOCTORS SECTION */}
      <section className="bg-gray-50 py-12 lg:py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Đội ngũ chuyên gia y tế hàng đầu</h2>
            <p className="text-gray-600 text-lg">Các bác sĩ giàu kinh nghiệm, luôn sẵn sàng phục vụ bạn</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'BSCKII. Nguyễn Quốc Dũng', specialty: 'Chẩn đoán hình ảnh', exp: '15 năm' },
              { name: 'PGS.TS. Đoàn Hữu Nghị', specialty: 'Tim mạch can thiệp', exp: '20 năm' },
              { name: 'TS.BS. Lê Chính Đại', specialty: 'Ung bướu', exp: '18 năm' },
            ].map((doctor, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <UserCircle2 className="w-20 h-20 text-white/80" />
                </div>
                <div className="p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{doctor.name}</h4>
                  <p className="text-blue-600 font-semibold text-sm mb-3">{doctor.specialty}</p>
                  <p className="text-gray-600 text-sm mb-4">Kinh nghiệm: {doctor.exp}</p>
                  <button className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    Đặt lịch với bác sĩ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIALTIES / CENTERS SECTION */}
      <section className="bg-white py-12 lg:py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Các chuyên khoa tại MediCore</h2>
            <p className="text-gray-600 text-lg">Cung cấp dịch vụ chuyên sâu các lĩnh vực y tế</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { icon: <HeartPulse className="w-8 h-8" />, name: 'Tim mạch' },
              { icon: <Brain className="w-8 h-8" />, name: 'Thần kinh' },
              { icon: <Stethoscope className="w-8 h-8" />, name: 'Nội tổng quát' },
              { icon: <ShieldCheck className="w-8 h-8" />, name: 'Miễn dịch' },
              { icon: <UserCircle2 className="w-8 h-8" />, name: 'Nhi khoa' },
              { icon: <Activity className="w-8 h-8" />, name: 'Nội tiết' },
              { icon: <ClipboardList className="w-8 h-8" />, name: 'Phẫu thuật' },
              { icon: <Heart className="w-8 h-8" />, name: 'Sản phụ khoa' },
            ].map((spec, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center hover:from-blue-100 hover:to-blue-200 transition-colors cursor-pointer">
                <div className="text-blue-600 mb-4 flex justify-center">
                  {spec.icon}
                </div>
                <h4 className="font-bold text-gray-900">{spec.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG/NEWS SECTION */}
      <section className="bg-gray-50 py-12 lg:py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Bài viết sức khỏe</h2>
              <p className="text-gray-600">Cập nhật kiến thức y tế và lời khuyên chăm sóc sức khỏe</p>
            </div>
            <Link to="/patient/articles" className="text-blue-600 font-semibold hover:text-blue-700">
              Xem tất cả →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articlesLoading && [0, 1, 2].map((item) => (
              <div key={item} className="bg-white rounded-2xl overflow-hidden shadow-md animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-6 w-24 rounded-full bg-gray-200" />
                  <div className="h-5 w-full rounded bg-gray-200" />
                  <div className="h-5 w-5/6 rounded bg-gray-200" />
                  <div className="h-4 w-2/3 rounded bg-gray-200 pt-3 border-t border-gray-100" />
                </div>
              </div>
            ))}

            {!articlesLoading && healthArticles.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow block"
              >
                {article.image ? (
                  <img src={article.image} alt={article.title} className="h-40 w-full object-cover" />
                ) : (
                  <div className="h-40 bg-gradient-to-r from-blue-500 to-blue-600" />
                )}
                <div className="p-6">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 mb-3">
                    <span className="text-xs font-semibold text-blue-700">{article.category}</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">{article.title}</h4>
                  <div className="flex items-center justify-between text-xs text-gray-600 pt-3 border-t border-gray-200">
                    <span>{article.author}</span>
                    <span>{article.date}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Sức khỏe là tài sản quý nhất</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Hãy liên hệ với chúng tôi ngay hôm nay để được tư vấn và lên kế hoạch chăm sóc sức khỏe phù hợp
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/patient/appointments" className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors">
              Đặt lịch khám
            </Link>
            <a href="tel:0123456789" className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Gọi ngay: 0123 456 789
            </a>
          </div>
        </div>
      </section>

      {/* INSURANCE SECTION */}
      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Ưu đãi và bảo hiểm y tế</h2>
              <ul className="space-y-4">
                {[
                  'Đăng ký các gói khám tầm soát sức khỏe định kỳ với mức giá ưu đãi',
                  'Theo dõi lịch sử khám chữa bệnh và quyền lợi bảo hiểm y tế',
                  'Nhận thông báo quyền lợi mới và chương trình khách hàng thân thiết',
                  'Hỗ trợ tư vấn bảo hiểm y tế chi tiết từ đội ngũ MediCore',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Đăng ký tư vấn bảo hiểm</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
                  <input type="text" placeholder="Nhập họ và tên" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input type="email" placeholder="email@example.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                  <input type="tel" placeholder="09xx xxx xxx" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Đơn vị bảo hiểm</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Bảo hiểm y tế nhà nước</option>
                    <option>Bảo hiểm tư nhân</option>
                    <option>Chưa có bảo hiểm</option>
                  </select>
                </div>
                <button type="submit" className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
                  Đăng ký tư vấn
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PatientHome;
