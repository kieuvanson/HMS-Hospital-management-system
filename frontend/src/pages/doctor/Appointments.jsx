import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { appointmentAPI } from '../../services/api';
import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle, XCircle, AlertCircle, ChevronRight, X } from 'lucide-react';

const DoctorAppointments = () => {
  const { doctor } = useOutletContext() || {};
  const [allAppointments, setAllAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Trạng thái cho lịch làm việc hôm nay
  const [timeSlots] = useState([
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ]);

  useEffect(() => {
    fetchAllAppointments();
    setCurrentPage(1); // Reset pagination when filter changes
  }, [filter]);

  const fetchAllAppointments = async () => {
    try {
      setLoading(true);
      // Gọi API lấy tất cả lịch hẹn từ hôm nay trở đi
      const data = await appointmentAPI.getAppointmentsByDoctor({
        status: filter === 'all' ? null : filter
      });
      console.log('📅 Appointments data received:', data);
      setAllAppointments(data || []);

      // Lọc lịch hẹn của hôm nay
      const today = new Date().toISOString().split('T')[0];
      const todayAppts = (data || []).filter(apt => 
        new Date(apt.appointmentDate).toISOString().split('T')[0] === today
      );
      setTodayAppointments(todayAppts);
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
      fetchAllAppointments();
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
    }
  };

  // Hàm lấy các ngày trong tuần hiện tại
  const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Thứ 2
    const monday = new Date(today.setDate(diff));
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      week.push(date);
    }
    return week;
  };

  const weekDates = getWeekDates();
  const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  // Hàm lấy lịch hẹn theo ngày và giờ
  const getAppointmentByDateAndTime = (date, time) => {
    const dateStr = date.toISOString().split('T')[0];
    const timeHour = time.split(':')[0];
    return allAppointments.find(apt => {
      const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
      const aptHour = apt.appointmentTime ? apt.appointmentTime.split(':')[0] : null;
      return aptDate === dateStr && aptHour === timeHour;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý lịch hẹn</h1>
        <p className="text-gray-600 mt-2">Xem lịch làm việc hôm nay và tất cả lịch hẹn tương lai</p>
      </div>

      {/* PHẦN 1: LỊCH LÀM VIỆC TUẦN NÀY */}
      <div className="bg-white rounded-lg shadow-md p-6 overflow-x-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📅 Lịch làm việc tuần này</h2>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : (
          <div className="min-w-max">
            {/* Bảng lịch biểu */}
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="w-14 px-1 py-1 text-center text-xs font-semibold text-gray-700 border border-gray-300 bg-gray-100">GIỜ</th>
                  {weekDates.map((date, idx) => (
                    <th
                      key={idx}
                      className={`w-24 px-1 py-1 text-center text-xs font-semibold border border-gray-300 ${
                        date.toDateString() === new Date().toDateString()
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="font-bold text-sm">{date.getDate()}</div>
                      <div className="text-xs">{dayNames[idx]}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => {
                  const hour = parseInt(time.split(':')[0]);
                  const isBusinessHour = hour >= 6 && hour <= 18;

                  return (
                    <tr key={time} className="hover:bg-gray-50">
                      <td className={`px-1 py-0.5 text-center text-xs font-medium border border-gray-300 ${
                        isBusinessHour ? 'bg-white' : 'bg-gray-50'
                      }`}>
                        {time}
                      </td>
                      {weekDates.map((date, idx) => {
                        const appointment = getAppointmentByDateAndTime(date, time);
                        const isToday = date.toDateString() === new Date().toDateString();

                        return (
                          <td
                            key={idx}
                            className={`w-24 h-12 p-0.5 border border-gray-300 align-top ${
                              isToday ? 'bg-blue-50' : 'bg-white'
                            }`}
                          >
                            {appointment ? (
                              <div
                                onClick={() => setSelectedAppointment(appointment)}
                                className="w-full h-full bg-gradient-to-r from-blue-400 to-cyan-400 text-white rounded px-1 py-0.5 text-xs cursor-pointer hover:shadow-md transition overflow-hidden flex flex-col justify-between"
                              >
                                <div>
                                  <p className="font-bold line-clamp-1 leading-tight text-xs">{appointment.patientInfo?.name}</p>
                                </div>
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PHẦN 2: DANH SÁCH LỊCH HẸN TƯƠNG LAI */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Danh sách lịch hẹn tương lai</h2>
        
        {/* Filter trạng thái */}
        <div className="mb-6">
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

        {/* Danh sách */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">Đang tải...</div>
        ) : allAppointments.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Không có lịch hẹn nào</p>
          </div>
        ) : (
          <>
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
                  {allAppointments
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((appointment) => (
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

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs text-gray-600">
                Hiển thị <span className="font-semibold">{(currentPage - 1) * pageSize + 1}</span> - <span className="font-semibold">{Math.min(currentPage * pageSize, allAppointments.length)}</span> trên tổng số <span className="font-semibold">{allAppointments.length}</span> lịch hẹn
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.ceil(allAppointments.length / pageSize) }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(allAppointments.length / pageSize)))}
                  disabled={currentPage === Math.ceil(allAppointments.length / pageSize)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          </>
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
