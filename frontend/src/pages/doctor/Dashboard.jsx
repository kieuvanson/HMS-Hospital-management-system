import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Users, Calendar, UserPlus, DollarSign, FileText, Stethoscope } from 'lucide-react';
import StatsCard from '../../components/Doctor/StatsCard';
import PatientTable from '../../components/Doctor/PatientTable';
import Chart from 'react-apexcharts';

const chartOptions = {
  chart: {
    type: 'bar',
  },
  xaxis: {
    categories: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5'],
  },
};

const chartSeries = [
  {
    name: 'Số bệnh nhân',
    data: [30, 40, 45, 50, 49],
  },
];

const DoctorDashboard = () => {
  const { doctor } = useOutletContext() || {};
  const doctorName = doctor?.name || 'Bác sĩ';

  return (
    <div className="space-y-6">
      <div className="pb-5 border-b border-gray-200 pt-20 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-bold">Chào mừng BS. {doctorName} đã trở lại!</h3>
        <p className="text-sm mt-2">Chúc bạn một ngày làm việc hiệu quả và thành công!</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Bệnh nhân hôm nay" 
          value="24" 
          change="+12%" 
          icon={<Users className="h-8 w-8 text-blue-600" />} 
          color="bg-blue-100" 
        />
        <StatsCard 
          title="Lịch hẹn đang chờ" 
          value="18" 
          change="+5%" 
          icon={<Calendar className="h-8 w-8 text-orange-600" />} 
          color="bg-orange-100" 
        />
        <StatsCard 
          title="Đơn thuốc đã kê" 
          value="42" 
          change="+8%" 
          icon={<FileText className="h-8 w-8 text-purple-600" />} 
          color="bg-purple-100" 
        />
        <StatsCard 
          title="Xét nghiệm chờ kết quả" 
          value="15" 
          change="-3%" 
          icon={<Stethoscope className="h-8 w-8 text-green-600" />} 
          color="bg-green-100" 
        />
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-6">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Thao tác nhanh</h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            <Link
              to="/doctor/patients/new"
              className="relative bg-white p-6 border border-gray-200 rounded-lg shadow-sm flex flex-col items-center text-center hover:bg-gray-50"
            >
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <UserPlus className="h-6 w-6" />
              </div>
              <span className="mt-4 font-medium text-gray-900">Thêm bệnh nhân</span>
              <span className="mt-1 text-sm text-gray-500">Tạo hồ sơ bệnh nhân mới</span>
            </Link>
            <Link
              to="/doctor/appointments/new"
              className="relative bg-white p-6 border border-gray-200 rounded-lg shadow-sm flex flex-col items-center text-center hover:bg-gray-50"
            >
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Calendar className="h-6 w-6" />
              </div>
              <span className="mt-4 font-medium text-gray-900">Đặt lịch hẹn</span>
              <span className="mt-1 text-sm text-gray-500">Tạo lịch hẹn khám bệnh</span>
            </Link>
            <Link
              to="/doctor/prescriptions/new"
              className="relative bg-white p-6 border border-gray-200 rounded-lg shadow-sm flex flex-col items-center text-center hover:bg-gray-50"
            >
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FileText className="h-6 w-6" />
              </div>
              <span className="mt-4 font-medium text-gray-900">Kê đơn thuốc</span>
              <span className="mt-1 text-sm text-gray-500">Tạo đơn thuốc mới</span>
            </Link>
            <Link
              to="/doctor/examinations"
              className="relative bg-white p-6 border border-gray-200 rounded-lg shadow-sm flex flex-col items-center text-center hover:bg-gray-50"
            >
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Stethoscope className="h-6 w-6" />
              </div>
              <span className="mt-4 font-medium text-gray-900">Khám bệnh</span>
              <span className="mt-1 text-sm text-gray-500">Tiếp nhận bệnh nhân</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Bệnh nhân gần đây</h2>
          <Link to="/doctor/patients" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Xem tất cả
          </Link>
        </div>
        <PatientTable />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lịch hẹn hôm nay */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Lịch hẹn hôm nay</h3>
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2">Thời gian</th>
                <th scope="col" className="px-4 py-2">Tên BN</th>
                <th scope="col" className="px-4 py-2">Lý do khám</th>
                <th scope="col" className="px-4 py-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white border-b">
                <td className="px-4 py-2">08:00</td>
                <td className="px-4 py-2">Nguyễn Văn A</td>
                <td className="px-4 py-2">Khám tổng quát</td>
                <td className="px-4 py-2 text-green-600">Đã xác nhận</td>
              </tr>
              <tr className="bg-gray-50 border-b">
                <td className="px-4 py-2">09:30</td>
                <td className="px-4 py-2">Trần Thị B</td>
                <td className="px-4 py-2">Khám tim mạch</td>
                <td className="px-4 py-2 text-yellow-600">Chờ xác nhận</td>
              </tr>
            </tbody>
          </table>
          <button className="mt-4 text-blue-600 hover:underline">Xem tất cả</button>
        </div>

        {/* Biểu đồ */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Số lượng bệnh nhân 7 ngày qua</h3>
          <div className="h-64">
            {/* Placeholder for chart */}
            <div className="flex items-center justify-center h-full text-gray-400">Biểu đồ sẽ hiển thị ở đây</div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê bệnh nhân theo tháng</h3>
        <Chart options={chartOptions} series={chartSeries} type="bar" height={350} />
      </div>
    </div>
  );
};

export default DoctorDashboard;
