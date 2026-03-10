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
} from 'lucide-react';
import { doctorAPI } from '../../services/api';

// Component này được render bên trong `DoctorLayout`,
// vì vậy không cần tự render Sidebar và Header nữa.
const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Trạng thái lọc theo ngày / tháng / lịch sử
  const [viewMode, setViewMode] = useState('today'); // 'today' | 'date' | 'month' | 'history'
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

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

  const totalPages = Math.ceil(patients.length / pageSize);

  const paginatedPatients = patients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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

  const handleViewInfo = (id) => {
    alert(`Xem thông tin bệnh nhân ${id}`);
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

        {!loading && patients.length > 0 && (
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
                      onClick={() => handleViewInfo(patient.id)}
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
        {!loading && patients.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Hiển thị{' '}
            <span className="font-semibold">
              {(currentPage - 1) * pageSize + 1} -{' '}
              {Math.min(currentPage * pageSize, patients.length)}
            </span>{' '}
            trên tổng số <span className="font-semibold">{patients.length}</span> bệnh nhân
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
    </div>
  );
};

export default Patients;