import React, { useState } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import { TrendingUp, DollarSign, Users, AlertCircle, CheckCircle, LogOut, CreditCard, Activity, Heart, Stethoscope } from "lucide-react";
import Chart from "react-apexcharts";

// Mock data - Patient Trend
const patientTrendData = {
  series: [
    {
      name: "Bệnh nhân nhập viện",
      data: [25, 28, 32, 30, 35, 40, 42],
    },
    {
      name: "Bệnh nhân xuất viện",
      data: [18, 22, 24, 26, 28, 32, 35],
    },
  ],
  categories: ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"],
};

// Department Distribution
const departmentDistribution = {
  series: [32, 25, 18, 15, 10],
  labels: ["Khoa Nội", "Khoa Ngoại", "Khoa Nhi", "Khoa Mắt", "Khoa Răng"],
};

// Revenue by month
const revenueData = {
  series: [
    {
      name: "Doanh thu",
      data: [450, 520, 490, 580, 620, 700, 750],
    },
  ],
  categories: ["T1", "T2", "T3", "T4", "T5", "T6", "T7"],
};

// Recent Admissions
const recentAdmissions = [
  { id: 1, name: "Nguyễn Văn A", age: 45, date: "10/02/2026", reason: "Viêm phổi", department: "Khoa Nội" },
  { id: 2, name: "Trần Thị B", age: 32, date: "10/02/2026", reason: "Chấn thương chân", department: "Khoa Ngoại" },
  { id: 3, name: "Lê Văn C", age: 58, date: "09/02/2026", reason: "Bệnh tim mạch", department: "Khoa Tim" },
];

// Recent Discharges
const recentDischarges = [
  { id: 1, name: "Phạm Thị Hoa", age: 52, date: "10/02/2026", days: 5, condition: "Khỏi" },
  { id: 2, name: "Đỗ Văn Dũng", age: 41, date: "10/02/2026", days: 3, condition: "Khỏi" },
  { id: 3, name: "Vũ Thị Lan", age: 29, date: "09/02/2026", days: 2, condition: "Tốt hơn" },
];

// Recent Transactions
const recentTransactions = [
  { id: 1, patient: "Nguyễn Văn A", amount: "5.2 triệu", date: "10/02/2026", time: "14:30", status: "Thành công", method: "Thẻ tín dụng" },
  { id: 2, patient: "Trần Thị B", amount: "2.8 triệu", date: "10/02/2026", time: "09:15", status: "Thành công", method: "Ví điện tử" },
  { id: 3, patient: "Lê Văn C", amount: "3.5 triệu", date: "09/02/2026", time: "16:45", status: "Thành công", method: "Chuyển khoản" },
  { id: 4, patient: "Phạm Thị Hoa", amount: "4.1 triệu", date: "09/02/2026", time: "11:20", status: "Đang xử lý", method: "Thẻ tín dụng" },
];

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, subtitle, trend, color }) => (
  <div className={`bg-white rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group`}>
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
          trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
    <h3 className="text-4xl font-bold text-gray-900 mb-1">{value}</h3>
    <p className="text-xs text-gray-500">{subtitle}</p>
  </div>
);

// Activity Badge Component
const ActivityBadge = ({ type, text }) => {
  const badgeConfig = {
    admission: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '→' },
    discharge: { bg: 'bg-green-100', text: 'text-green-700', icon: '←' },
    payment: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '✓' },
  };
  const config = badgeConfig[type] || badgeConfig.admission;
  return (
    <span className={`inline-block ${config.bg} ${config.text} px-3 py-1 rounded-full text-xs font-semibold`}>
      {config.icon} {text}
    </span>
  );
};

const AdminDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [timeRange, setTimeRange] = useState('week');

  // Chart configurations
  const patientTrendChartOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      sparkline: { enabled: false },
      fontFamily: '"Inter", sans-serif',
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    grid: {
      borderColor: '#e5e7eb',
      xaxis: {
        lines: { show: false }
      }
    },
    xaxis: {
      categories: patientTrendData.categories,
      labels: {
        style: {
          colors: '#9ca3af',
          fontSize: '12px',
          fontFamily: '"Inter", sans-serif',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#9ca3af',
          fontSize: '12px',
        },
      },
    },
    colors: ['#3b82f6', '#10b981'],
    dataLabels: { enabled: false },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: {
        colors: '#666',
      }
    }
  };

  const departmentChartOptions = {
    chart: {
      type: 'donut',
      toolbar: { show: false },
      fontFamily: '"Inter", sans-serif',
    },
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
    dataLabels: {
      enabled: true,
      formatter: (val) => val.toFixed(0) + '%',
    },
    legend: {
      position: 'bottom',
      labels: {
        colors: '#666',
      },
    },
    stroke: {
      show: false,
    }
  };

  const revenueChartOptions = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      fontFamily: '"Inter", sans-serif',
    },
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.45,
        opacityTo: 0.05,
      },
    },
    grid: {
      borderColor: '#e5e7eb',
      xaxis: {
        lines: { show: false }
      }
    },
    xaxis: {
      categories: revenueData.categories,
      labels: {
        style: {
          colors: '#9ca3af',
          fontSize: '12px',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#9ca3af',
          fontSize: '12px',
        },
      },
    },
    colors: ['#10b981'],
    dataLabels: { enabled: false },
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 lg:p-8">
        {/* Welcome Banner - Minimal & Clean */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Chào mừng, {user?.name || 'Admin'}!
              </h1>
              <p className="text-gray-600 text-sm lg:text-base">
                Hôm nay là 10/02/2026 • Bạn có <span className="font-semibold">5 cuộc hẹn</span> chờ xử lý
              </p>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                📊 Báo cáo
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors">
                📅 Lịch
              </button>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Bệnh nhân điều trị"
            value="128"
            subtitle="Đang nằm viện"
            trend={12}
            color="bg-blue-500"
          />
          <StatCard
            icon={Heart}
            title="Bệnh nhân mới"
            value="24"
            subtitle="Trong tuần này"
            trend={8}
            color="bg-green-500"
          />
          <StatCard
            icon={Stethoscope}
            title="Ca phẫu thuật"
            value="5"
            subtitle="Hôm nay"
            trend={-2}
            color="bg-orange-500"
          />
          <StatCard
            icon={DollarSign}
            title="Doanh thu hôm nay"
            value="245M"
            subtitle="Tăng 15% vs hôm qua"
            trend={15}
            color="bg-purple-500"
          />
          <StatCard
            icon={Users}
            title="Nhân viên làm việc"
            value="87"
            subtitle="Có 2 người absent"
            trend={-1}
            color="bg-pink-500"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Patient Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">📊 Xu hướng bệnh nhân</h2>
              <p className="text-sm text-gray-500 mt-1">Nhập viện vs xuất viện theo tuần</p>
            </div>
            {patientTrendData.series && (
              <Chart
                options={patientTrendChartOptions}
                series={patientTrendData.series}
                type="line"
                height={320}
              />
            )}
          </div>

          {/* Department Distribution */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">🏥 Phân bố theo khoa</h2>
              <p className="text-sm text-gray-500 mt-1">Số lượng bệnh nhân</p>
            </div>
            {departmentDistribution.series && (
              <Chart
                options={departmentChartOptions}
                series={departmentDistribution.series}
                type="donut"
                height={280}
              />
            )}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">💰 Doanh thu theo tháng</h2>
            <p className="text-sm text-gray-500 mt-1">Xu hướng doanh thu 7 tháng gần nhất</p>
          </div>
          {revenueData.series && (
            <Chart
              options={revenueChartOptions}
              series={revenueData.series}
              type="area"
              height={300}
            />
          )}
        </div>

        {/* Recent Activities - 3 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Admissions */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6 flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-xl">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Bệnh nhân mới nhập viện</h3>
            </div>
            <div className="space-y-4">
              {recentAdmissions.map((patient) => (
                <div key={patient.id} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{patient.name}</p>
                      <p className="text-xs text-gray-500">{patient.age} tuổi • {patient.date}</p>
                    </div>
                    <ActivityBadge type="admission" text="Nhập" />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">{patient.reason}</p>
                  <p className="text-xs text-blue-600 font-medium mt-1">{patient.department}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Discharges */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6 flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Bệnh nhân xuất viện</h3>
            </div>
            <div className="space-y-4">
              {recentDischarges.map((patient) => (
                <div key={patient.id} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{patient.name}</p>
                      <p className="text-xs text-gray-500">{patient.age} tuổi • {patient.date}</p>
                    </div>
                    <ActivityBadge type="discharge" text="Xuất" />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-gray-600">Nằm {patient.days} ngày</span>
                    <span className={`px-2 py-1 rounded-full font-medium ${
                      patient.condition === 'Khỏi' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {patient.condition}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6 flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-xl">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Giao dịch thanh toán</h3>
            </div>
            <div className="space-y-4">
              {recentTransactions.slice(0, 4).map((txn) => (
                <div key={txn.id} className="p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{txn.patient}</p>
                      <p className="text-xs text-gray-500">{txn.date} • {txn.time}</p>
                    </div>
                    <ActivityBadge type="payment" text="Thanh toán" />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-gray-700 font-bold">{txn.amount}</span>
                    <span className={`px-2 py-1 rounded-full font-medium ${ txn.status === 'Thành công' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {txn.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
