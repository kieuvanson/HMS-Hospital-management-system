import React, { useState } from 'react';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  User,
  ChevronDown,
  ChevronRight,
  FileText,
  Stethoscope,
  Filter,
} from 'lucide-react';

const examData = [
  {
    id: 1,
    date: '12/03/2026',
    time: '08:30',
    doctor: 'BS. Nguyễn Thị Lan',
    department: 'Nội tổng quát',
    room: 'Phòng 201',
    status: 'upcoming',
    reason: 'Khám định kỳ hàng tháng',
    notes: '',
  },
  {
    id: 2,
    date: '18/03/2026',
    time: '10:00',
    doctor: 'BS. Trần Văn Minh',
    department: 'Tim mạch',
    room: 'Phòng 305',
    status: 'upcoming',
    reason: 'Tái khám tăng huyết áp',
    notes: '',
  },
  {
    id: 3,
    date: '28/02/2026',
    time: '09:00',
    doctor: 'BS. Nguyễn Thị Lan',
    department: 'Nội tổng quát',
    room: 'Phòng 201',
    status: 'completed',
    reason: 'Khám định kỳ',
    diagnosis: 'Sức khỏe ổn định, không phát hiện bất thường',
    notes: 'Tiếp tục theo dõi huyết áp tại nhà. Tái khám sau 1 tháng.',
  },
  {
    id: 4,
    date: '10/02/2026',
    time: '14:00',
    doctor: 'BS. Trần Văn Minh',
    department: 'Tim mạch',
    room: 'Phòng 305',
    status: 'completed',
    reason: 'Khám tăng huyết áp',
    diagnosis: 'Tăng huyết áp độ 1',
    notes: 'Kê đơn thuốc hạ huyết áp. Hạn chế muối, tập thể dục đều đặn.',
  },
  {
    id: 5,
    date: '05/01/2026',
    time: '08:00',
    doctor: 'BS. Lê Hoàng Dũng',
    department: 'Cơ xương khớp',
    room: 'Phòng 112',
    status: 'completed',
    reason: 'Đau lưng kéo dài',
    diagnosis: 'Thoái hóa cột sống thắt lưng nhẹ',
    notes: 'Chỉ định vật lý trị liệu 2 tuần. Tái khám nếu không cải thiện.',
  },
  {
    id: 6,
    date: '15/12/2025',
    time: '09:30',
    doctor: 'BS. Phạm Thị Hoa',
    department: 'Da liễu',
    room: 'Phòng 408',
    status: 'cancelled',
    reason: 'Khám dị ứng da',
    notes: 'Bệnh nhân hủy vì lý do cá nhân.',
  },
];

const statusConfig = {
  upcoming: {
    label: 'Sắp tới',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-100',
    dot: 'bg-blue-500',
  },
  completed: {
    label: 'Đã khám',
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-100',
    dot: 'bg-green-500',
  },
  cancelled: {
    label: 'Đã hủy',
    bg: 'bg-gray-50',
    text: 'text-gray-500',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  },
};

const Examinations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = examData.filter((exam) => {
    const matchSearch =
      exam.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || exam.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const upcoming = filtered.filter((e) => e.status === 'upcoming');
  const past = filtered.filter((e) => e.status !== 'upcoming');

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 ">
        <h1 className="text-2xl font-semibold text-secondary-900">Phiếu khám bệnh</h1>
        <p className="text-sm text-secondary-500 mt-1">
          Quản lý và theo dõi tất cả các lần khám bệnh của bạn tại hệ thống.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder="Tìm theo bác sĩ, chuyên khoa, lý do khám..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-secondary-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="upcoming">Sắp tới</option>
              <option value="completed">Đã khám</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Upcoming Section */}
      {upcoming.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-secondary-900">
              Lịch khám sắp tới
            </h2>
            <span className="ml-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
              {upcoming.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map((exam) => {
              const status = statusConfig[exam.status];
              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text} border ${status.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>
                    <span className="text-xs text-secondary-400">#{exam.id}</span>
                  </div>

                  <h3 className="font-semibold text-secondary-900 mb-3">{exam.reason}</h3>

                  <div className="space-y-2 text-sm text-secondary-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                      <span>{exam.date}</span>
                      <Clock className="w-4 h-4 text-secondary-400 flex-shrink-0 ml-2" />
                      <span>{exam.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                      <span>{exam.doctor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                      <span>{exam.department}</span>
                      <MapPin className="w-4 h-4 text-secondary-400 flex-shrink-0 ml-2" />
                      <span>{exam.room}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Examinations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-secondary-500" />
          <h2 className="text-lg font-semibold text-secondary-900">Lịch sử khám</h2>
          <span className="ml-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-secondary-600 text-xs font-medium">
            {past.length}
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {past.length === 0 ? (
            <div className="p-12 text-center text-secondary-400 text-sm">
              Không tìm thấy phiếu khám nào phù hợp.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {past.map((exam) => {
                const status = statusConfig[exam.status];
                const isExpanded = expandedId === exam.id;

                return (
                  <div key={exam.id}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : exam.id)}
                      className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-secondary-50/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-secondary-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-secondary-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-secondary-900 text-sm truncate">
                            {exam.reason}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text} border ${status.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-secondary-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {exam.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {exam.doctor}
                          </span>
                          <span className="hidden sm:flex items-center gap-1">
                            <Stethoscope className="w-3.5 h-3.5" />
                            {exam.department}
                          </span>
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-5 pl-14">
                        <div className="rounded-xl bg-secondary-50 p-4 space-y-3 text-sm">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs text-secondary-400 mb-0.5">Thời gian</p>
                              <p className="text-secondary-700">{exam.date} — {exam.time}</p>
                            </div>
                            <div>
                              <p className="text-xs text-secondary-400 mb-0.5">Phòng khám</p>
                              <p className="text-secondary-700">{exam.room}</p>
                            </div>
                            <div>
                              <p className="text-xs text-secondary-400 mb-0.5">Bác sĩ</p>
                              <p className="text-secondary-700">{exam.doctor}</p>
                            </div>
                            <div>
                              <p className="text-xs text-secondary-400 mb-0.5">Chuyên khoa</p>
                              <p className="text-secondary-700">{exam.department}</p>
                            </div>
                          </div>

                          {exam.diagnosis && (
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-xs text-secondary-400 mb-0.5">Chẩn đoán</p>
                              <p className="text-secondary-800 font-medium">{exam.diagnosis}</p>
                            </div>
                          )}

                          {exam.notes && (
                            <div>
                              <p className="text-xs text-secondary-400 mb-0.5">Ghi chú bác sĩ</p>
                              <p className="text-secondary-700">{exam.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Examinations;
