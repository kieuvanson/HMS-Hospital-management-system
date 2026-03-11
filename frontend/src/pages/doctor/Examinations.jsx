import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  Stethoscope,
  Calendar,
  Clock,
  User,
  FileText,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  ClipboardList,
} from 'lucide-react';

const mockExaminations = [
  {
    id: 1,
    patient: 'Nguyễn Văn An',
    phone: '0901234567',
    gender: 'Nam',
    age: 45,
    date: '12/03/2026',
    time: '08:30',
    room: 'Phòng 201',
    reason: 'Khám định kỳ hàng tháng',
    status: 'waiting',
    vitalSigns: { bp: '130/85', temp: '36.8°C', pulse: '78 bpm', weight: '72 kg' },
  },
  {
    id: 2,
    patient: 'Trần Thị Bích',
    phone: '0912345678',
    gender: 'Nữ',
    age: 32,
    date: '12/03/2026',
    time: '09:00',
    room: 'Phòng 201',
    reason: 'Đau đầu kéo dài 2 tuần',
    status: 'waiting',
    vitalSigns: { bp: '120/80', temp: '37.0°C', pulse: '72 bpm', weight: '55 kg' },
  },
  {
    id: 3,
    patient: 'Lê Hoàng Phúc',
    phone: '0923456789',
    gender: 'Nam',
    age: 58,
    date: '12/03/2026',
    time: '09:30',
    room: 'Phòng 201',
    reason: 'Tái khám tăng huyết áp',
    status: 'in_progress',
    vitalSigns: { bp: '145/90', temp: '36.7°C', pulse: '82 bpm', weight: '80 kg' },
  },
  {
    id: 4,
    patient: 'Phạm Minh Tâm',
    phone: '0934567890',
    gender: 'Nam',
    age: 40,
    date: '12/03/2026',
    time: '10:00',
    room: 'Phòng 201',
    reason: 'Đau bụng vùng thượng vị',
    status: 'completed',
    vitalSigns: { bp: '125/80', temp: '36.9°C', pulse: '75 bpm', weight: '68 kg' },
    diagnosis: 'Viêm dạ dày - tá tràng',
    prescription: 'Omeprazole 20mg, Sucralfate 1g',
    notes: 'Nội soi dạ dày sau 2 tuần nếu không cải thiện.',
  },
  {
    id: 5,
    patient: 'Võ Thị Hà',
    phone: '0945678901',
    gender: 'Nữ',
    age: 28,
    date: '12/03/2026',
    time: '10:30',
    room: 'Phòng 201',
    reason: 'Ho khan kéo dài',
    status: 'completed',
    vitalSigns: { bp: '110/70', temp: '37.2°C', pulse: '80 bpm', weight: '50 kg' },
    diagnosis: 'Viêm họng cấp',
    prescription: 'Amoxicillin 500mg, Paracetamol 500mg',
    notes: 'Nghỉ ngơi, uống nhiều nước ấm. Tái khám sau 5 ngày.',
  },
  {
    id: 6,
    patient: 'Đặng Quốc Bảo',
    phone: '0956789012',
    gender: 'Nam',
    age: 65,
    date: '12/03/2026',
    time: '11:00',
    room: 'Phòng 201',
    reason: 'Kiểm tra sau phẫu thuật',
    status: 'cancelled',
    vitalSigns: null,
    notes: 'Bệnh nhân xin hoãn, hẹn lại tuần sau.',
  },
];

const statusConfig = {
  waiting: {
    label: 'Chờ khám',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    icon: AlertCircle,
  },
  in_progress: {
    label: 'Đang khám',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    icon: Stethoscope,
  },
  completed: {
    label: 'Hoàn thành',
    bg: 'bg-green-100',
    text: 'text-green-800',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Đã hủy',
    bg: 'bg-red-100',
    text: 'text-red-800',
    icon: XCircle,
  },
};

const Examinations = () => {
  const { doctor } = useOutletContext() || {};
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = mockExaminations.filter((exam) => {
    const matchSearch =
      exam.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.phone.includes(searchTerm);
    const matchStatus = filterStatus === 'all' || exam.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const waitingCount = mockExaminations.filter((e) => e.status === 'waiting').length;
  const inProgressCount = mockExaminations.filter((e) => e.status === 'in_progress').length;
  const completedCount = mockExaminations.filter((e) => e.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-20">
        <h1 className="text-3xl font-bold text-gray-900">Khám bệnh</h1>
        <p className="text-gray-600 mt-2">Danh sách bệnh nhân cần khám hôm nay — {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-yellow-100">
            <AlertCircle className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{waitingCount}</p>
            <p className="text-sm text-gray-500">Chờ khám</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-blue-100">
            <Stethoscope className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
            <p className="text-sm text-gray-500">Đang khám</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-5 flex items-center gap-4">
          <div className="p-3 rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
            <p className="text-sm text-gray-500">Hoàn thành</p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên bệnh nhân, SĐT, lý do khám..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="waiting">Chờ khám</option>
              <option value="in_progress">Đang khám</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* Examination List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Không tìm thấy bệnh nhân nào phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">STT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Bệnh nhân</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Giờ khám</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Lý do</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((exam, idx) => {
                  const status = statusConfig[exam.status];
                  const StatusIcon = status.icon;
                  const isExpanded = expandedId === exam.id;

                  return (
                    <React.Fragment key={exam.id}>
                      <tr className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{exam.patient}</p>
                            <p className="text-xs text-gray-500">{exam.gender}, {exam.age} tuổi · {exam.phone}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {exam.time}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{exam.reason}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                            <StatusIcon size={14} />
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : exam.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Detail */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="px-4 py-4 bg-gray-50">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Vital Signs */}
                              {exam.vitalSigns && (
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-blue-600" />
                                    Sinh hiệu
                                  </h4>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <p className="text-xs text-gray-400">Huyết áp</p>
                                      <p className="font-medium text-gray-800">{exam.vitalSigns.bp}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-400">Nhiệt độ</p>
                                      <p className="font-medium text-gray-800">{exam.vitalSigns.temp}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-400">Mạch</p>
                                      <p className="font-medium text-gray-800">{exam.vitalSigns.pulse}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-400">Cân nặng</p>
                                      <p className="font-medium text-gray-800">{exam.vitalSigns.weight}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Diagnosis & Notes */}
                              <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                  Kết quả khám
                                </h4>
                                {exam.diagnosis ? (
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <p className="text-xs text-gray-400">Chẩn đoán</p>
                                      <p className="font-medium text-gray-800">{exam.diagnosis}</p>
                                    </div>
                                    {exam.prescription && (
                                      <div>
                                        <p className="text-xs text-gray-400">Đơn thuốc</p>
                                        <p className="text-gray-700">{exam.prescription}</p>
                                      </div>
                                    )}
                                    {exam.notes && (
                                      <div>
                                        <p className="text-xs text-gray-400">Ghi chú</p>
                                        <p className="text-gray-700">{exam.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-400 italic">
                                    {exam.status === 'cancelled'
                                      ? exam.notes || 'Đã hủy'
                                      : 'Chưa có kết quả — bệnh nhân chưa được khám.'}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Action buttons */}
                            {(exam.status === 'waiting' || exam.status === 'in_progress') && (
                              <div className="flex gap-3 mt-4">
                                {exam.status === 'waiting' && (
                                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                    Bắt đầu khám
                                  </button>
                                )}
                                {exam.status === 'in_progress' && (
                                  <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors">
                                    Hoàn thành khám
                                  </button>
                                )}
                                <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                  Kê đơn thuốc
                                </button>
                                <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                  Chỉ định xét nghiệm
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Examinations;
