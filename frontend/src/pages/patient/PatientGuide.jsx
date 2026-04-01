import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  FileText,
  CreditCard,
  Bell,
  Search,
  ChevronDown,
  CircleHelp,
  Phone,
} from 'lucide-react';

const guideSteps = [
  {
    title: 'Bước 1: Chuẩn bị hồ sơ cá nhân',
    description: 'Cập nhật thông tin cơ bản, số điện thoại, CCCD và ngày sinh trong mục Hồ sơ để hệ thống tự điền khi đặt lịch.',
    to: '/patient/profile',
    action: 'Mở hồ sơ',
  },
  {
    title: 'Bước 2: Chọn chuyên khoa phù hợp',
    description: 'Vào trang chuyên khoa để xem mô tả từng chuyên khoa và chọn đúng nhu cầu khám của bạn.',
    to: '/patient/specialties',
    action: 'Xem chuyên khoa',
  },
  {
    title: 'Bước 3: Đặt lịch khám',
    description: 'Điền biểu mẫu đặt lịch, chọn bác sĩ và khung giờ còn trống. Sau khi gửi thành công bạn sẽ nhận được xác nhận.',
    to: '/patient/appointments',
    action: 'Đặt lịch ngay',
  },
  {
    title: 'Bước 4: Theo dõi kết quả và đơn thuốc',
    description: 'Sau khi khám, bạn có thể xem kết quả cận lâm sàng, phiếu khám và đơn thuốc trực tiếp trên hệ thống.',
    to: '/patient/results',
    action: 'Xem kết quả',
  },
];

const quickActions = [
  { title: 'Đặt lịch khám', icon: CalendarCheck, to: '/patient/appointments', color: 'bg-sky-50 text-sky-700' },
  { title: 'Xem phiếu khám', icon: FileText, to: '/patient/examinations', color: 'bg-indigo-50 text-indigo-700' },
  { title: 'Thanh toán', icon: CreditCard, to: '/patient/payments', color: 'bg-emerald-50 text-emerald-700' },
  { title: 'Thông báo', icon: Bell, to: '/patient/notifications', color: 'bg-amber-50 text-amber-700' },
];

const faqItems = [
  {
    category: 'Đặt lịch',
    question: 'Tôi có thể đặt lịch trước bao lâu?',
    answer: 'Bạn có thể đặt lịch trước theo lịch mở của bác sĩ. Hệ thống sẽ hiển thị các khung giờ còn trống để bạn lựa chọn.',
  },
  {
    category: 'Đặt lịch',
    question: 'Đặt lịch xong có thể đổi giờ khám không?',
    answer: 'Bạn có thể đặt lại lịch mới hoặc liên hệ tổng đài hỗ trợ để được hướng dẫn xử lý lịch hẹn hiện tại.',
  },
  {
    category: 'Hồ sơ',
    question: 'Vì sao cần cập nhật đầy đủ hồ sơ cá nhân?',
    answer: 'Hồ sơ chính xác giúp bác sĩ có dữ liệu đầy đủ khi thăm khám và giảm thời gian nhập thông tin tại quầy.',
  },
  {
    category: 'Kết quả',
    question: 'Khi nào có thể xem kết quả cận lâm sàng?',
    answer: 'Tùy loại xét nghiệm, kết quả sẽ được cập nhật ngay khi hoàn tất và hiển thị trong mục Xem kết quả.',
  },
  {
    category: 'Thanh toán',
    question: 'Tôi có thể xem lại lịch sử thanh toán ở đâu?',
    answer: 'Bạn vào mục Thanh toán để xem trạng thái giao dịch và lịch sử các lần thanh toán trước đó.',
  },
];

const topics = ['Tất cả', 'Đặt lịch', 'Hồ sơ', 'Kết quả', 'Thanh toán'];

const PatientGuide = () => {
  const [keyword, setKeyword] = useState('');
  const [topic, setTopic] = useState('Tất cả');
  const [openFaq, setOpenFaq] = useState(0);

  const filteredFaq = useMemo(() => {
    const key = keyword.trim().toLowerCase();
    return faqItems.filter((item) => {
      const byTopic = topic === 'Tất cả' || item.category === topic;
      const byKeyword =
        !key || item.question.toLowerCase().includes(key) || item.answer.toLowerCase().includes(key);
      return byTopic && byKeyword;
    });
  }, [keyword, topic]);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-r from-sky-50 to-cyan-50 p-6 lg:p-10">
        <p className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-white text-sky-700 border border-sky-100">
          Hướng dẫn bệnh nhân
        </p>
        <h1 className="mt-3 text-4xl lg:text-5xl font-black text-slate-800">Trung tâm hướng dẫn sử dụng hệ thống HSM</h1>
        <p className="mt-3 text-slate-600 max-w-3xl leading-7">
          Trang này giúp bạn thao tác nhanh trên hệ thống: từ cập nhật hồ sơ, đặt lịch khám, theo dõi kết quả đến thanh toán.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-black text-slate-800 mb-4">Tác vụ nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                to={item.to}
                className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-shadow"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="mt-3 font-semibold text-slate-800">{item.title}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-black text-slate-800 mb-4">Quy trình sử dụng dành cho bệnh nhân</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {guideSteps.map((step, index) => (
            <article key={step.title} className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-sm font-semibold text-sky-700">Mục {index + 1}</p>
              <h3 className="mt-1 text-xl font-bold text-slate-800">{step.title}</h3>
              <p className="mt-2 text-slate-600 leading-7">{step.description}</p>
              <Link to={step.to} className="mt-4 inline-flex items-center text-sm font-semibold text-sky-700 hover:text-sky-900">
                {step.action}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-3xl p-5 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
          <h2 className="text-2xl font-black text-slate-800">Câu hỏi thường gặp</h2>
          <div className="relative w-full lg:w-[340px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm câu hỏi..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {topics.map((item) => (
            <button
              key={item}
              onClick={() => setTopic(item)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                topic === item ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {filteredFaq.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-8 text-center text-slate-600">
            Không tìm thấy câu hỏi phù hợp.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaq.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={`${faq.question}-${index}`} className="border border-slate-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-white hover:bg-slate-50"
                  >
                    <div>
                      <p className="text-xs font-semibold text-sky-700">{faq.category}</p>
                      <p className="text-base font-bold text-slate-800 mt-0.5">{faq.question}</p>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && <div className="px-4 pb-4 text-slate-600 leading-7">{faq.answer}</div>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-sky-700">Bạn vẫn cần hỗ trợ thêm?</p>
          <h3 className="text-2xl font-black text-slate-800 mt-1">Liên hệ tổng đài chăm sóc khách hàng</h3>
          <p className="text-slate-600 mt-1">Đội ngũ hỗ trợ luôn sẵn sàng giải đáp quy trình khám và sử dụng hệ thống.</p>
        </div>
        <a
          href="tel:1900123456"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-700 text-white font-semibold hover:bg-sky-800"
        >
          <Phone className="w-4 h-4" /> 1900 123 456
        </a>
      </section>
    </div>
  );
};

export default PatientGuide;
