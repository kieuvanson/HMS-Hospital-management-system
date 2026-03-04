import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { appointmentAPI } from '../../services/api';
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle, XCircle, AlertCircle, ChevronRight, X } from 'lucide-react';

const DoctorAppointments = () => {
  const { doctor } = useOutletContext() || {};
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed, cancelled
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate, filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      // Gọi API lấy lịch hẹn của bác sĩ theo ngày
      const data = await appointmentAPI.getAppointmentsByDoctor({
        date: selectedDate,
        status: filter === 'all' ? null : filter
      });
      console.log('📅 Appointments data received:', data);
      console.log('📅 Is array:', Array.isArray(data));
      setAppointments(data || []);
    } catch (error) {
      console.error('Lỗi lấy danh sách lịch hẹn:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xác nhận', icon: AlertCircle },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã xác nhận', icon: CheckCircle },
      in_progress: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Đang khám', icon: Clock },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Hoàn thành', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy', icon: XCircle }
    };
    
    const s = statusMap[status] || statusMap.pending;
    const Icon = s.icon;
    
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${s.bg} ${s.text} text-xs font-semibold`}>
        <Icon size={14} />
        {s.label}
      </div>
    );
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      // Gọi API cập nhật trạng thái
      await appointmentAPI.updateAppointmentStatus(appointmentId, newStatus);
      fetchAppointments();
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý lịch hẹn</h1>
        <p className="text-gray-600 mt-2">Xem và quản lý tất cả lịch hẹn của bạn</p>
      </div>

      {/* Filter và ngày chọn */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chọn ngày */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chọn ngày</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter trạng thái */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo trạng thái</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="in_progress">Đang khám</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danh sách lịch hẹn - Bảng */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Không có lịch hẹn nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Bệnh nhân
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Ngày khám
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Giờ khám
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Lý do
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr 
                    key={appointment._id}
                    onClick={() => setSelectedAppointment(appointment)}
                    className="hover:bg-gray-50 cursor-pointer transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{appointment.patientInfo?.name || '-'}</p>
                          <p className="text-xs text-gray-500">{appointment.patientInfo?.phone || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">
                        {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{appointment.appointmentTime || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 line-clamp-1 max-w-xs">{appointment.reason || '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <ChevronRight size={20} className="text-gray-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal chi tiết */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex z-50">
          {/* Overlay */}
          <div 
            className="absolute inset-0"
            onClick={() => setSelectedAppointment(null)}
          ></div>

          {/* Modal Content */}
          <div className="relative ml-auto w-full max-w-2xl bg-white shadow-lg h-screen flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-900">Chi tiết lịch hẹn</h2>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 pb-6 space-y-6">
              {/* Thông tin bệnh nhân */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin bệnh nhân</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Tên</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.patientInfo?.name || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Số điện thoại</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.patientInfo?.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center gap-3">
                    <Mail size={18} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.patientId?.email || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin lịch hẹn */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin lịch hẹn</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar size={18} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Ngày khám</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedAppointment.appointmentDate).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Giờ khám</p>
                      <p className="font-medium text-gray-900">{selectedAppointment.appointmentTime || '-'}</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                    {getStatusBadge(selectedAppointment.status)}
                  </div>
                </div>
              </div>

              {/* Lý do khám */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lý do khám / Triệu chứng</h3>
                <div className="flex items-start gap-3">
                  <FileText size={18} className="text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-gray-900">{selectedAppointment.reason || '-'}</p>
                    {selectedAppointment.symptoms && selectedAppointment.symptoms.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">Triệu chứng:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedAppointment.symptoms.map((symptom, idx) => (
                            <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              {selectedAppointment.notes && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ghi chú</h3>
                  <p className="text-gray-900">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>

            {/* Các nút hành động - Footer fixed */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex flex-wrap gap-2 flex-shrink-0 shadow-lg z-20">
              {selectedAppointment.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedAppointment._id, 'confirmed');
                      setSelectedAppointment(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                  >
                    Xác nhận
                  </button>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedAppointment._id, 'cancelled');
                      setSelectedAppointment(null);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                  >
                    Hủy
                  </button>
                </>
              )}
              {selectedAppointment.status === 'confirmed' && (
                <>
                  <button
                    onClick={() => {
                      handleStatusChange(selectedAppointment._id, 'in_progress');
                      setSelectedAppointment(null);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                  >
                    Bắt đầu khám
                  </button>
                </>
              )}
              {selectedAppointment.status === 'in_progress' && (
                <button
                  onClick={() => {
                    handleStatusChange(selectedAppointment._id, 'completed');
                    setSelectedAppointment(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  Hoàn thành
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
