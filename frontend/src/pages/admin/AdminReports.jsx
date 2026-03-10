import React, { useState, useMemo } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import { Download, FileText, TrendingUp, Users, FileCheck, Star, Calendar, UserCircle } from "lucide-react";

const AdminReports = () => {
  // ============ SAMPLE DATA ============
  const appointmentsByMonth = [
    { month: "Tháng 1", count: 145 },
    { month: "Tháng 2", count: 168 },
    { month: "Tháng 3", count: 192 },
    { month: "Tháng 4", count: 175 },
    { month: "Tháng 5", count: 210 },
    { month: "Tháng 6", count: 198 },
  ];

  const userRolesData = [
    { role: "Bệnh nhân", count: 450, percentage: 65, color: "#3B82F6" },
    { role: "Bác sĩ", count: 85, percentage: 12, color: "#10B981" },
    { role: "Y tá", count: 95, percentage: 14, color: "#F59E0B" },
    { role: "Admin", count: 25, percentage: 4, color: "#EF4444" },
  ];

  const statisticsData = [
    {
      id: 1,
      title: "Bệnh nhân mới",
      value: 127,
      change: "+12%",
      icon: Users,
      color: "blue",
      trend: "up"
    },
    {
      id: 2,
      title: "Bệnh án",
      value: 543,
      change: "+5%",
      icon: FileCheck,
      color: "green",
      trend: "up"
    },
    {
      id: 3,
      title: "Lịch hẹn",
      value: 298,
      change: "-2%",
      icon: Calendar,
      color: "purple",
      trend: "down"
    },
    {
      id: 4,
      title: "Rating Bác sĩ TB",
      value: "4.8/5",
      change: "↑ 0.2",
      icon: Star,
      color: "yellow",
      trend: "up"
    }
  ];

  const detailedStats = [
    { category: "Bệnh nhân mới tháng này", value: 127, target: 150, percentage: 85 },
    { category: "Bệnh nhân tái khám", value: 89, target: 120, percentage: 74 },
    { category: "Tổng số bệnh án", value: 543, target: 600, percentage: 91 },
    { category: "Bệnh án được cập nhật", value: 98, target: 100, percentage: 98 },
    { category: "Đánh giá bác sĩ TB", value: "4.8", target: "5.0", percentage: 96 },
    { category: "Tỷ lệ hài lòng bệnh nhân", value: "92%", target: "95%", percentage: 97 },
  ];

  // ============ CHART FUNCTIONS ============
  const maxAppointments = Math.max(...appointmentsByMonth.map(d => d.count));

  const handleExportPDF = () => {
    alert("Tính năng xuất PDF đang được phát triển...\nTrong thực tế sẽ sử dụng thư viện như jsPDF hoặc react-pdf");
  };

  const handleExportExcel = () => {
    alert("Tính năng xuất Excel đang được phát triển...\nTrong thực tế sẽ sử dụng thư viện như xlsx hoặc Excel.js");
  };

  const getTrendColor = (trend) => {
    return trend === "up" ? "text-green-600" : "text-red-600";
  };

  const getTrendBg = (trend) => {
    return trend === "up" ? "bg-green-50" : "bg-red-50";
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Báo Cáo & Thống Kê
            </h1>
            <p className="text-gray-600 mt-2">Phân tích và báo cáo hoạt động bệnh viện</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg transition"
            >
              <FileText size={20} />
              Xuất PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg transition"
            >
              <Download size={20} />
              Xuất Excel
            </button>
          </div>
        </div>

        {/* Key Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statisticsData.map((stat) => {
            const Icon = stat.icon;
            const colorMap = {
              blue: "bg-blue-50 text-blue-600",
              green: "bg-green-50 text-green-600",
              purple: "bg-purple-50 text-purple-600",
              yellow: "bg-yellow-50 text-yellow-600"
            };

            return (
              <div key={stat.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${colorMap[stat.color]}`}>
                    <Icon size={24} />
                  </div>
                  <span className={`text-sm font-semibold ${getTrendColor(stat.trend)}`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line Chart - Appointments by Month */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Lịch Hẹn Theo Tháng</h2>
            <div className="space-y-4">
              {appointmentsByMonth.map((data, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{data.month}</span>
                    <span className="text-sm font-bold text-gray-900">{data.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full"
                      style={{ width: `${(data.count / maxAppointments) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Tổng lịch hẹn 6 tháng:</strong> {appointmentsByMonth.reduce((sum, d) => sum + d.count, 0)} cuộc
              </p>
            </div>
          </div>

          {/* Pie Chart - User Roles */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6 text-gray-900">Tỷ Lệ Vai Trò User</h2>
            <div className="space-y-4">
              {userRolesData.map((role, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: role.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{role.role}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{role.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${role.percentage}%`,
                        backgroundColor: role.color
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{role.count} người dùng</p>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <p className="text-sm text-indigo-800">
                <strong>Tổng users:</strong> {userRolesData.reduce((sum, r) => sum + r.count, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Statistics Table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Thống Kê Chi Tiết</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Chỉ Tiêu</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Con Số</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Mục Tiêu</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tiến Độ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tỷ Lệ %</th>
                </tr>
              </thead>
              <tbody>
                {detailedStats.map((stat, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{stat.category}</td>
                    <td className="px-6 py-4 text-sm font-bold text-blue-600">{stat.value}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{stat.target}</td>
                    <td className="px-6 py-4">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            stat.percentage >= 90
                              ? "bg-green-500"
                              : stat.percentage >= 75
                              ? "bg-yellow-500"
                              : "bg-orange-500"
                          }`}
                          style={{ width: `${stat.percentage}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          stat.percentage >= 90
                            ? "bg-green-100 text-green-800"
                            : stat.percentage >= 75
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {stat.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="text-blue-600" size={24} />
              <h3 className="text-gray-900 font-semibold">Tổng Lịch Hẹn</h3>
            </div>
            <p className="text-3xl font-bold text-blue-700">
              {appointmentsByMonth.reduce((sum, d) => sum + d.count, 0)}
            </p>
            <p className="text-sm text-blue-600 mt-2">Trong 6 tháng vừa qua</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Users className="text-green-600" size={24} />
              <h3 className="text-gray-900 font-semibold">Tổng Users</h3>
            </div>
            <p className="text-3xl font-bold text-green-700">
              {userRolesData.reduce((sum, r) => sum + r.count, 0)}
            </p>
            <p className="text-sm text-green-600 mt-2">Tất cả vai trò</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Star className="text-purple-600" size={24} />
              <h3 className="text-gray-900 font-semibold">Rating Bác Sĩ</h3>
            </div>
            <p className="text-3xl font-bold text-purple-700">4.8/5</p>
            <p className="text-sm text-purple-600 mt-2">Dựa trên {85 + 95} nhận xét</p>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-8">
          <div className="max-w-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Xuất Báo Cáo</h3>
            <p className="text-gray-600 mb-6">
              Tải xuống báo cáo thống kê chi tiết dưới dạng PDF hoặc Excel để phân tích sâu hơn.
            </p>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg transition"
              >
                <FileText size={20} />
                Xuất PDF
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg transition"
              >
                <Download size={20} />
                Xuất Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
