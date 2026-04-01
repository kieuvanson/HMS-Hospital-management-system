import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { doctorAPI } from '../../services/api';

const toMonthValue = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const formatMoney = (value) => {
  const number = Number(value || 0);
  return `${number.toLocaleString('vi-VN')} VND`;
};

const VIETNAM_BANK_OPTIONS = [
  'Vietcombank',
  'VietinBank',
  'BIDV',
  'Agribank',
  'MB Bank',
  'Techcombank',
  'ACB',
  'VPBank',
  'TPBank',
  'Sacombank',
  'HDBank',
  'SHB',
  'VIB',
  'SeABank',
  'Eximbank',
  'MSB',
  'OCB',
  'Nam A Bank',
  'PVcomBank',
  'LPBank',
  'ABBANK',
  'Bac A Bank',
  'NCB',
  'VietBank',
  'BaoViet Bank',
  'KienlongBank',
  'CBBank',
  'OceanBank',
  'GPBank',
  'Woori Bank Vietnam',
  'Shinhan Bank Vietnam',
  'UOB Vietnam',
  'Standard Chartered Vietnam',
  'HSBC Vietnam',
  'Public Bank Vietnam',
  'Hong Leong Bank Vietnam'
];

const SalaryTracking = () => {
  const [month, setMonth] = useState(toMonthValue());
  const [year, setYear] = useState(new Date().getFullYear());
  const [loadingMonthly, setLoadingMonthly] = useState(true);
  const [loadingYearly, setLoadingYearly] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);

  const [monthlyData, setMonthlyData] = useState(null);
  const [yearlyData, setYearlyData] = useState(null);

  const [salaryAccountForm, setSalaryAccountForm] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: ''
  });

  const loadMonthly = async (targetMonth) => {
    try {
      setLoadingMonthly(true);
      const response = await doctorAPI.getSalaryOverview(targetMonth);
      const payload = response?.data || null;
      setMonthlyData(payload);

      if (payload?.salaryAccount) {
        setSalaryAccountForm({
          bankName: payload.salaryAccount.bankName || '',
          accountNumber: payload.salaryAccount.accountNumber || '',
          accountHolder: payload.salaryAccount.accountHolder || ''
        });
      }

    } catch (error) {
      toast.error(error.message || 'Không tải được bảng lương tháng');
    } finally {
      setLoadingMonthly(false);
    }
  };

  const loadYearly = async (targetYear) => {
    try {
      setLoadingYearly(true);
      const response = await doctorAPI.getYearlySalaryOverview(targetYear);
      setYearlyData(response?.data || null);
    } catch (error) {
      toast.error(error.message || 'Không tải được tổng hợp lương năm');
    } finally {
      setLoadingYearly(false);
    }
  };

  useEffect(() => {
    loadMonthly(month);
  }, [month]);

  useEffect(() => {
    loadYearly(year);
  }, [year]);

  const handleSaveAccount = async () => {
    if (!salaryAccountForm.bankName || !salaryAccountForm.accountNumber || !salaryAccountForm.accountHolder) {
      toast.error('Vui lòng nhập đủ thông tin tài khoản nhận lương');
      return;
    }

    try {
      setSavingAccount(true);
      await doctorAPI.updateSalaryAccount(salaryAccountForm);
      toast.success('Đã lưu tài khoản nhận lương');
      await loadMonthly(month);
    } catch (error) {
      toast.error(error.message || 'Không lưu được tài khoản nhận lương');
    } finally {
      setSavingAccount(false);
    }
  };

  const monthlySummaryCards = useMemo(() => {
    const calculation = monthlyData?.calculation || {};
    const stats = monthlyData?.stats || {};
    return [
      {
        title: 'Lương thực nhận tháng',
        value: formatMoney(calculation.netSalary || 0),
        style: 'border-emerald-200 bg-emerald-50 text-emerald-800'
      },
      {
        title: 'Lương cơ bản',
        value: formatMoney(calculation.baseMonthlySalary || 0),
        style: 'border-blue-200 bg-blue-50 text-blue-800'
      },
      {
        title: 'Hoa hồng lịch khám',
        value: formatMoney(calculation.appointmentCommissionAmount || 0),
        style: 'border-indigo-200 bg-indigo-50 text-indigo-800'
      },
      {
        title: 'Khấu trừ',
        value: formatMoney(calculation.deductionAmount || 0),
        style: 'border-rose-200 bg-rose-50 text-rose-800'
      },
      {
        title: 'Lịch khám hoàn thành',
        value: `${stats.completedAppointments || 0}`,
        style: 'border-slate-200 bg-slate-50 text-slate-800'
      },
      {
        title: 'Lịch khám đã thanh toán',
        value: `${stats.paidCompletedAppointments || 0}`,
        style: 'border-cyan-200 bg-cyan-50 text-cyan-800'
      }
    ];
  }, [monthlyData]);

  const monthlyChartItems = useMemo(() => {
    const calculation = monthlyData?.calculation || {};
    return [
      { key: 'base', label: 'Lương cơ bản', value: Number(calculation.baseMonthlySalary || 0), color: 'bg-blue-500' },
      { key: 'commission', label: 'Hoa hồng', value: Number(calculation.appointmentCommissionAmount || 0), color: 'bg-indigo-500' },
      { key: 'deduction', label: 'Khấu trừ', value: Number(calculation.deductionAmount || 0), color: 'bg-rose-500' },
      { key: 'net', label: 'Thực nhận', value: Number(calculation.netSalary || 0), color: 'bg-emerald-500' }
    ];
  }, [monthlyData]);

  const monthlyChartMax = useMemo(() => {
    const max = Math.max(...monthlyChartItems.map((item) => item.value), 1);
    return max;
  }, [monthlyChartItems]);

  const yearlyChartData = useMemo(() => {
    const monthly = Array.isArray(yearlyData?.monthly) ? yearlyData.monthly : [];
    return monthly.map((item) => ({
      month: item.month,
      shortMonth: item.month?.split('-')?.[1] || item.month,
      netSalary: Number(item.netSalary || 0),
      commission: Number(item.appointmentCommissionAmount || 0)
    }));
  }, [yearlyData]);

  const yearlyMaxNetSalary = useMemo(() => {
    return Math.max(...yearlyChartData.map((item) => item.netSalary), 1);
  }, [yearlyChartData]);

  const yearlyAverageNetSalary = useMemo(() => {
    if (yearlyChartData.length === 0) return 0;
    const total = yearlyChartData.reduce((sum, item) => sum + item.netSalary, 0);
    return total / yearlyChartData.length;
  }, [yearlyChartData]);

  const selectedMonthIndex = useMemo(() => {
    return yearlyChartData.findIndex((item) => item.month === month);
  }, [yearlyChartData, month]);

  return (
    <div className="space-y-6 mt-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Theo dõi mức lương</h1>
        <p className="mt-2 text-gray-600">
          Theo dõi lương theo tháng, năm, công thức tính lương và quản lý tài khoản nhận lương.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Chọn tháng</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Chọn năm</label>
          <input
            type="number"
            min="2000"
            max="3000"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Bảng lương theo tháng</h2>
        {loadingMonthly ? (
          <p className="text-gray-600">Đang tải dữ liệu lương tháng...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {monthlySummaryCards.map((card) => (
                <div key={card.title} className={`rounded-lg border p-3 ${card.style}`}>
                  <p className="text-xs">{card.title}</p>
                  <p className="text-lg font-semibold">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 space-y-1">
              <p className="font-semibold text-gray-900">Công thức tính lương tháng</p>
              <p>Lương thực nhận = Lương cơ bản + Hoa hồng lịch khám đã thanh toán - Khấu trừ ngày nghỉ không lương</p>
              <p>Hoa hồng = Tổng phí khám đã thanh toán × Tỉ lệ hoa hồng</p>
              <p>
                Tỉ lệ hiện tại: {(Number(monthlyData?.calculation?.appointmentCommissionRate || 0) * 100).toFixed(0)}%
              </p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Tài khoản nhận lương</h2>
          <input
            type="text"
            list="vietnam-bank-options"
            value={salaryAccountForm.bankName}
            onChange={(e) => setSalaryAccountForm((prev) => ({ ...prev, bankName: e.target.value }))}
            placeholder="Gõ để chọn ngân hàng"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
          <datalist id="vietnam-bank-options">
            {VIETNAM_BANK_OPTIONS.map((bank) => (
              <option key={bank} value={bank} />
            ))}
          </datalist>
          <input
            type="text"
            value={salaryAccountForm.accountNumber}
            onChange={(e) => setSalaryAccountForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
            placeholder="Số tài khoản"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="text"
            value={salaryAccountForm.accountHolder}
            onChange={(e) => setSalaryAccountForm((prev) => ({ ...prev, accountHolder: e.target.value }))}
            placeholder="Chủ tài khoản"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
          <button
            onClick={handleSaveAccount}
            disabled={savingAccount}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-60"
          >
            {savingAccount ? 'Đang lưu...' : 'Lưu tài khoản nhận lương'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Biểu đồ lương theo tháng</h2>
          <p className="text-sm text-gray-600">So sánh các thành phần lương trong tháng đã chọn.</p>

          <div className="grid grid-cols-2 gap-3">
            {monthlyChartItems.map((item) => {
              const heightPercent = Math.max(6, Math.round((item.value / monthlyChartMax) * 100));
              return (
                <div key={item.key} className="border border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800">{formatMoney(item.value)}</p>
                  <div className="mt-3 h-24 bg-gray-100 rounded-md flex items-end p-2">
                    <div className={`${item.color} w-full rounded-sm`} style={{ height: `${heightPercent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-xs text-gray-500">
            Biểu đồ hiển thị: Lương cơ bản, Hoa hồng, Khấu trừ và Lương thực nhận của tháng {month}.
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Biểu đồ lương theo năm</h2>
        <p className="text-sm text-gray-600 mb-4">Xu hướng lương thực nhận từng tháng trong năm {year}.</p>

        {loadingYearly ? (
          <p className="text-gray-600">Đang tải biểu đồ lương năm...</p>
        ) : (
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="h-72 w-full overflow-x-auto">
              <svg viewBox="0 0 920 280" className="min-w-[720px] w-full h-full">
                <defs>
                  <linearGradient id="salaryAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity="0.06" />
                  </linearGradient>
                </defs>

                {Array.from({ length: 5 }).map((_, idx) => {
                  const y = 20 + idx * 50;
                  const labelValue = Math.round(((4 - idx) / 4) * yearlyMaxNetSalary);
                  return (
                    <g key={`grid-${idx}`}>
                      <line x1="50" y1={y} x2="890" y2={y} stroke="#E5E7EB" strokeDasharray="4 4" />
                      <text x="6" y={y + 4} fontSize="10" fill="#6B7280">{(labelValue / 1000000).toFixed(1)}M</text>
                    </g>
                  );
                })}

                {yearlyChartData.length > 0 && (() => {
                  const baseY = 220;
                  const leftX = 50;
                  const rightX = 890;
                  const chartWidth = rightX - leftX;
                  const stepX = yearlyChartData.length > 1 ? chartWidth / (yearlyChartData.length - 1) : 0;

                  const points = yearlyChartData.map((item, index) => {
                    const x = leftX + index * stepX;
                    const y = baseY - (item.netSalary / yearlyMaxNetSalary) * 200;
                    return { x, y, ...item };
                  });

                  const areaPath = [
                    `M ${points[0].x} ${baseY}`,
                    ...points.map((p) => `L ${p.x} ${p.y}`),
                    `L ${points[points.length - 1].x} ${baseY}`,
                    'Z'
                  ].join(' ');

                  const linePath = points
                    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                    .join(' ');

                  const avgY = baseY - (yearlyAverageNetSalary / yearlyMaxNetSalary) * 200;

                  return (
                    <>
                      <path d={areaPath} fill="url(#salaryAreaGradient)" />
                      <path d={linePath} fill="none" stroke="#16A34A" strokeWidth="3" />

                      <line x1="50" y1={avgY} x2="890" y2={avgY} stroke="#2563EB" strokeDasharray="6 4" strokeWidth="1.5" />
                      <text x="56" y={avgY - 6} fontSize="10" fill="#1D4ED8">
                        Trung bình năm: {formatMoney(yearlyAverageNetSalary)}
                      </text>

                      {points.map((p, idx) => {
                        const isSelected = idx === selectedMonthIndex;
                        return (
                          <g key={p.month}>
                            <circle cx={p.x} cy={p.y} r={isSelected ? 5.5 : 4} fill={isSelected ? '#0F766E' : '#15803D'} />
                            <text x={p.x} y="244" textAnchor="middle" fontSize="10" fill="#374151">{p.shortMonth}</text>
                            {isSelected && (
                              <>
                                <rect x={p.x - 58} y={p.y - 36} width="116" height="22" rx="6" fill="#111827" />
                                <text x={p.x} y={p.y - 21} textAnchor="middle" fontSize="10" fill="#F9FAFB">
                                  {formatMoney(p.netSalary)}
                                </text>
                              </>
                            )}
                          </g>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>

            <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-600" /> Đường: Lương tổng (thực nhận)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-green-300" /> Vùng: Phân bố mức lương theo tháng
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-0.5 bg-blue-600" /> So sánh với mức trung bình năm
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tổng hợp lương theo năm</h2>
        {loadingYearly ? (
          <p className="text-gray-600">Đang tải dữ liệu lương năm...</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs text-emerald-700">Tổng lương thực nhận</p>
                <p className="text-lg font-semibold text-emerald-900">{formatMoney(yearlyData?.totals?.netSalary || 0)}</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-xs text-blue-700">Tổng lương cơ bản</p>
                <p className="text-lg font-semibold text-blue-900">{formatMoney(yearlyData?.totals?.baseMonthlySalary || 0)}</p>
              </div>
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
                <p className="text-xs text-indigo-700">Tổng hoa hồng</p>
                <p className="text-lg font-semibold text-indigo-900">{formatMoney(yearlyData?.totals?.appointmentCommissionAmount || 0)}</p>
              </div>
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                <p className="text-xs text-rose-700">Tổng khấu trừ</p>
                <p className="text-lg font-semibold text-rose-900">{formatMoney(yearlyData?.totals?.deductionAmount || 0)}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-600">Tháng</th>
                    <th className="px-3 py-2 text-left text-gray-600">Lương thực nhận</th>
                    <th className="px-3 py-2 text-left text-gray-600">Hoa hồng</th>
                    <th className="px-3 py-2 text-left text-gray-600">Khấu trừ</th>
                    <th className="px-3 py-2 text-left text-gray-600">Lịch khám hoàn thành</th>
                  </tr>
                </thead>
                <tbody>
                  {(yearlyData?.monthly || []).map((item) => (
                    <tr key={item.month} className="border-t border-gray-100">
                      <td className="px-3 py-2">{item.month}</td>
                      <td className="px-3 py-2">{formatMoney(item.netSalary)}</td>
                      <td className="px-3 py-2">{formatMoney(item.appointmentCommissionAmount)}</td>
                      <td className="px-3 py-2">{formatMoney(item.deductionAmount)}</td>
                      <td className="px-3 py-2">{item.completedAppointments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalaryTracking;
