import React, { useState, useEffect } from 'react';
import {
  Eye,
  FilePlus,
  XCircle,
  CalendarDays,
  Clock3,
  History,
  ChevronLeft,
  ChevronRight,
  X,
  Search,
} from 'lucide-react';
import { doctorAPI, appointmentAPI } from '../../services/api';

// Component này được render bên trong `DoctorLayout`,
// vì vậy không cần tự render Sidebar và Header nữa.
const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);

  // Trạng thái lọc theo ngày / tháng / lịch sử
  const [viewMode, setViewMode] = useState('today'); // 'today' | 'date' | 'month' | 'history'
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  // Tìm kiếm
  const [searchQuery, setSearchQuery] = useState('');

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch danh sách bệnh nhân từ API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const data = await doctorAPI.getPatients();
        setPatients(data || []);
        setError(null);
      } catch (err) {
        setError(err.message || 'Không thể tải danh sách bệnh nhân');
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  // Lọc bệnh nhân theo từ khóa tìm kiếm
  const filteredPatients = patients.filter((patient) => {
    const query = searchQuery.toLowerCase();
    return (
      patient.name.toLowerCase().includes(query) ||
      patient.phone.toLowerCase().includes(query) ||
      patient.email.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredPatients.length / pageSize);

  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
  };

  const handleChangePage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'chua_kham':
        return 'Chưa khám';
      case 'dang_kham':
        return 'Đang khám';
      case 'da_kham':
        return 'Đã khám';
      case 'da_huy':
        return 'Đã hủy';
      default:
        return 'Chưa khám';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'chua_kham':
        return 'bg-yellow-100 text-yellow-800';
      case 'dang_kham':
        return 'bg-blue-100 text-blue-800';
      case 'da_kham':
        return 'bg-green-100 text-green-800';
      case 'da_huy':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewInfo = async (patient) => {
    setSelectedPatient(patient);
    setAppointmentsLoading(true);
    try {
      const data = await appointmentAPI.getAppointmentsByPatient(patient._id);
      setAppointments(data || []);
    } catch (err) {
      setAppointments([]);
    } finally {
      setAppointmentsLoading(false);
      setShowModal(true);
    }
  };

  const handleCreateRecord = (id) => {
    alert(`Tạo hồ sơ bệnh lý cho bệnh nhân ${id}`);
  };

  const handleCancelReception = (id) => {
    alert(`Hủy tiếp nhận bệnh nhân ${id}`);
  };

  return (
    <div className="p-6 bg-gray-100 mt-20">
      <div className="flex flex-col gap-2 mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Danh sách bệnh nhân được tiếp nhận</h1>
          <p className="text-sm text-gray-500 mt-1">
            Theo dõi bệnh nhân theo ngày, tháng và xem lịch sử khám.
          </p>
        </div>

        {/* Bộ lọc theo chế độ xem */}
        <div className="flex flex-wrap gap-2">
          <button
            className={`inline-flex items-center px-3 py-2 rounded-md text-xs sm:text-sm border transition-colors ${
              viewMode === 'today'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setViewMode('today')}
          >
            <Clock3 className="h-4 w-4 mr-1.5" />
            Hôm nay
          </button>
          <button
            className={`inline-flex items-center px-3 py-2 rounded-md text-xs sm:text-sm border transition-colors ${
              viewMode === 'date'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setViewMode('date')}
          >
            <CalendarDays className="h-4 w-4 mr-1.5" />
            Theo ngày
          </button>
          <button
            className={`inline-flex items-center px-3 py-2 rounded-md text-xs sm:text-sm border transition-colors ${
              viewMode === 'month'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setViewMode('month')}
          >
            <CalendarDays className="h-4 w-4 mr-1.5" />
            Theo tháng
          </button>
          <button
            className={`inline-flex items-center px-3 py-2 rounded-md text-xs sm:text-sm border transition-colors ${
              viewMode === 'history'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setViewMode('history')}
          >
            <History className="h-4 w-4 mr-1.5" />
            Lịch sử khám
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Thanh tìm kiếm */}
        <div className="mb-6 flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, số điện thoại, email..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Thanh chọn ngày / tháng tuỳ chế độ */}
        {viewMode === 'date' && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              Chọn ngày khám:
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="ml-2 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        )}
        {viewMode === 'month' && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              Chọn tháng:
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="ml-2 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <div className="spinner border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full w-12 h-12 animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Đang tải danh sách bệnh nhân...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-800 font-medium">Lỗi:</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && patients.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Không có bệnh nhân nào</p>
          </div>
        )}

        {!loading && !error && patients.length > 0 && filteredPatients.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Không tìm thấy bệnh nhân phù hợp với từ khóa "{searchQuery}"
            </p>
            <button
              onClick={() => handleSearch('')}
              className="mt-4 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Xóa bộ lọc tìm kiếm
            </button>
          </div>
        )}

        {!loading && patients.length > 0 && filteredPatients.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border px-4 py-2">Tên bệnh nhân</th>
              <th className="border px-4 py-2 text-center">Tuổi</th>
              <th className="border px-4 py-2 text-center">Giới tính</th>
              <th className="border px-4 py-2 text-center">Số điện thoại</th>
              <th className="border px-4 py-2 text-center">Trạng thái</th>
              <th className="border px-4 py-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="border px-4 py-3 font-medium text-gray-800">{patient.name}</td>
                <td className="border px-4 py-3 text-center">{patient.age}</td>
                <td className="border px-4 py-3 text-center">{patient.gender}</td>
                <td className="border px-4 py-3 text-center">{patient.phone}</td>
                <td className="border px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusClass(
                      patient.status
                    )}`}
                  >
                    {getStatusLabel(patient.status)}
                  </span>
                </td>
                <td className="border px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleViewInfo(patient)}
                      className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors text-xs"
                      title="Xem thông tin"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      <span>Xem</span>
                    </button>
                    <button
                      onClick={() => handleCreateRecord(patient.id)}
                      className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors text-xs"
                      title="Tạo hồ sơ"
                    >
                      <FilePlus className="h-4 w-4 mr-1" />
                      <span>Hồ sơ</span>
                    </button>
                    <button
                      onClick={() => handleCancelReception(patient.id)}
                      className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors text-xs"
                      title="Hủy tiếp nhận"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      <span>Hủy</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}

        {/* Phân trang */}
        {!loading && patients.length > 0 && filteredPatients.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Hiển thị{' '}
            <span className="font-semibold">
              {filteredPatients.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, filteredPatients.length)}
            </span>{' '}
            trên tổng số <span className="font-semibold">{filteredPatients.length}</span> bệnh nhân
            {searchQuery && (
              <span className="ml-2 text-blue-600">
                (Tìm kiếm: "{searchQuery}")
              </span>
            )}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleChangePage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`inline-flex items-center px-2.5 py-1.5 rounded-md border text-xs ${
                currentPage === 1
                  ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                  : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => handleChangePage(page)}
                  className={`px-3 py-1.5 rounded-md text-xs border ${
                    currentPage === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handleChangePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`inline-flex items-center px-2.5 py-1.5 rounded-md border text-xs ${
                currentPage === totalPages
                  ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                  : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        )}
      </div>

      {/* Modal Chi tiết lịch hẹn */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pt-20">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">Chi tiết lịch hẹn - {selectedPatient?.name}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto flex-1">
              {/* Thông tin bệnh nhân */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-3">Thông tin bệnh nhân</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Tên:</p>
                    <p className="font-semibold text-gray-800">{selectedPatient?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tuổi:</p>
                    <p className="font-semibold text-gray-800">{selectedPatient?.age}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Giới tính:</p>
                    <p className="font-semibold text-gray-800">{selectedPatient?.gender}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Số điện thoại:</p>
                    <p className="font-semibold text-gray-800">{selectedPatient?.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-600">Email:</p>
                    <p className="font-semibold text-gray-800">{selectedPatient?.email}</p>
                  </div>
                </div>
              </div>

              {/* Danh sách lịch hẹn */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-4">Lịch hẹn</h3>
                
                {appointmentsLoading ? (
                  <div className="text-center py-8">
                    <div className="spinner border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full w-8 h-8 animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500">Đang tải lịch hẹn...</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Chưa có lịch hẹn nào</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.map((appointment) => (
                      <div key={appointment._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-blue-500" />
                            <span className="font-semibold text-gray-800">
                              {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')} {appointment.appointmentTime}
                            </span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            appointment.status === 'pending' || appointment.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                            appointment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status === 'pending' ? 'Chờ xác nhận' :
                             appointment.status === 'confirmed' ? 'Đã xác nhận' :
                             appointment.status === 'in_progress' ? 'Đang khám' :
                             appointment.status === 'completed' ? 'Đã hoàn thành' :
                             appointment.status === 'cancelled' ? 'Đã hủy' :
                             appointment.status === 'no_show' ? 'Không đến' : appointment.status}
                          </span>
                        </div>
                        <div className="ml-7 space-y-2 text-sm text-gray-700">
                          <p><span className="font-semibold">Lý do:</span> {appointment.reason}</p>
                          {appointment.symptoms && appointment.symptoms.length > 0 && (
                            <p><span className="font-semibold">Triệu chứng:</span> {appointment.symptoms.join(', ')}</p>
                          )}
                          {appointment.notes && (
                            <p><span className="font-semibold">Ghi chú:</span> {appointment.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-2 flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;