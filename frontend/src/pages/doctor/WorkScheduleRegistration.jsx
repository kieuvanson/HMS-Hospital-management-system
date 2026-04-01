import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { doctorAPI } from '../../services/api';

const DAY_LABELS = [
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' },
  { value: 7, label: 'Chủ nhật' }
];

const DEFAULT_SLOTS = [
  { startTime: '08:00', endTime: '12:00' },
  { startTime: '13:00', endTime: '17:00' }
];

const toMonthValue = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const toDateValue = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const WorkScheduleRegistration = () => {
  const [loading, setLoading] = useState(true);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [registeringLeave, setRegisteringLeave] = useState(false);
  const [month, setMonth] = useState(toMonthValue());
  const [selectedLeaveDate, setSelectedLeaveDate] = useState(toDateValue());
  const [leaveReason, setLeaveReason] = useState('Nghỉ cá nhân');

  const [workDays, setWorkDays] = useState([1, 2, 3, 4, 5, 6]);
  const [slotDuration, setSlotDuration] = useState(30);
  const [monthlyLeaves, setMonthlyLeaves] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [leaveMeta, setLeaveMeta] = useState({
    monthlyPaidOffLimit: 2,
    usedPaidOffDays: 0,
    remainingPaidOffDays: 2
  });

  const fetchWorkSchedule = async () => {
    const response = await doctorAPI.getWorkSchedule();
    const schedule = Array.isArray(response?.data?.workingSchedule) ? response.data.workingSchedule : [];
    const mappedDays = schedule
      .map((item) => Number(item.dayOfWeek))
      .filter((value) => Number.isInteger(value) && value >= 1 && value <= 7)
      .sort((a, b) => a - b);

    setWorkDays(mappedDays.length ? mappedDays : [1, 2, 3, 4, 5, 6]);
    setSlotDuration(response?.data?.slotDuration || 30);
  };

  const fetchMonthlyData = async (targetMonth) => {
    const [leavesResponse, calendarResponse] = await Promise.all([
      doctorAPI.getMonthlyLeaves(targetMonth),
      doctorAPI.getWorkCalendar(targetMonth)
    ]);

    setMonthlyLeaves(Array.isArray(leavesResponse?.data) ? leavesResponse.data : []);
    setCalendar(Array.isArray(calendarResponse?.data) ? calendarResponse.data : []);

    const meta = leavesResponse?.meta || calendarResponse?.meta || {};
    setLeaveMeta({
      monthlyPaidOffLimit: meta.monthlyPaidOffLimit ?? 2,
      usedPaidOffDays: meta.usedPaidOffDays ?? 0,
      remainingPaidOffDays: meta.remainingPaidOffDays ?? 2
    });
  };

  const loadData = async (targetMonth = month) => {
    try {
      setLoading(true);
      await Promise.all([fetchWorkSchedule(), fetchMonthlyData(targetMonth)]);
    } catch (error) {
      toast.error(error.message || 'Không tải được lịch làm việc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(month);
  }, []);

  const handleMonthChange = async (event) => {
    const nextMonth = event.target.value;
    setMonth(nextMonth);
    try {
      await fetchMonthlyData(nextMonth);
    } catch (error) {
      toast.error(error.message || 'Không tải được dữ liệu tháng đã chọn');
    }
  };

  const handleToggleWorkDay = (dayOfWeek) => {
    setWorkDays((prev) => {
      const exists = prev.includes(dayOfWeek);
      if (exists) {
        return prev.filter((item) => item !== dayOfWeek);
      }
      return [...prev, dayOfWeek].sort((a, b) => a - b);
    });
  };

  const handleSaveSchedule = async () => {
    if (workDays.length === 0) {
      toast.error('Cần chọn ít nhất 1 ngày làm việc trong tuần');
      return;
    }

    const payload = {
      slotDuration,
      workingSchedule: workDays.map((dayOfWeek) => ({
        dayOfWeek,
        timeSlots: DEFAULT_SLOTS
      }))
    };

    try {
      setSavingSchedule(true);
      await doctorAPI.updateWorkSchedule(payload);
      toast.success('Đã lưu lịch làm việc tuần');
      await fetchMonthlyData(month);
    } catch (error) {
      toast.error(error.message || 'Không lưu được lịch làm việc');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleRegisterLeave = async () => {
    if (!selectedLeaveDate) {
      toast.error('Vui lòng chọn ngày nghỉ');
      return;
    }

    try {
      setRegisteringLeave(true);
      const selectedMonth = selectedLeaveDate.slice(0, 7);
      await doctorAPI.registerMonthlyLeave({
        date: selectedLeaveDate,
        reason: leaveReason
      });
      toast.success('Đăng ký ngày nghỉ thành công');
      setMonth(selectedMonth);
      await fetchMonthlyData(selectedMonth);
    } catch (error) {
      toast.error(error.message || 'Không đăng ký được ngày nghỉ');
    } finally {
      setRegisteringLeave(false);
    }
  };

  const handleDeleteLeave = async (leaveId) => {
    try {
      await doctorAPI.deleteMonthlyLeave(leaveId);
      toast.success('Đã xóa ngày nghỉ');
      await fetchMonthlyData(month);
    } catch (error) {
      toast.error(error.message || 'Không xóa được ngày nghỉ');
    }
  };

  const calendarStats = useMemo(() => {
    return calendar.reduce(
      (acc, item) => {
        if (item.status === 'working') acc.workingDays += 1;
        if (item.status === 'weekly_off') acc.weeklyOffDays += 1;
        if (item.status === 'paid_off') acc.paidOffDays += 1;
        return acc;
      },
      { workingDays: 0, weeklyOffDays: 0, paidOffDays: 0 }
    );
  }, [calendar]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Đang tải lịch làm việc...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Đăng ký lịch làm việc</h1>
        <p className="mt-2 text-gray-600">
          Mặc định bác sĩ làm việc Thứ 2 đến Thứ 7 và được nghỉ 2 ngày bất kỳ trong tháng không trừ lương.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">1. Lịch làm việc theo tuần</h2>

          <div>
            <p className="text-sm text-gray-600 mb-3">Chọn các ngày làm việc:</p>
            <div className="grid grid-cols-2 gap-2">
              {DAY_LABELS.map((day) => (
                <label
                  key={day.value}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${
                    workDays.includes(day.value)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-blue-600"
                    checked={workDays.includes(day.value)}
                    onChange={() => handleToggleWorkDay(day.value)}
                  />
                  <span className="text-sm font-medium">{day.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Độ dài mỗi slot khám</label>
            <select
              value={slotDuration}
              onChange={(e) => setSlotDuration(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15 phút</option>
              <option value={20}>20 phút</option>
              <option value={30}>30 phút</option>
              <option value={45}>45 phút</option>
              <option value={60}>60 phút</option>
            </select>
          </div>

          <button
            onClick={handleSaveSchedule}
            disabled={savingSchedule}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-60"
          >
            {savingSchedule ? 'Đang lưu...' : 'Lưu lịch làm việc tuần'}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">2. Đăng ký ngày nghỉ trong tháng</h2>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700">
            Đã dùng {leaveMeta.usedPaidOffDays}/{leaveMeta.monthlyPaidOffLimit} ngày nghỉ có lương.
            Còn lại: <span className="font-semibold">{leaveMeta.remainingPaidOffDays}</span> ngày.
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tháng áp dụng</label>
            <input
              type="month"
              value={month}
              onChange={handleMonthChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn ngày nghỉ</label>
            <input
              type="date"
              value={selectedLeaveDate}
              onChange={(e) => setSelectedLeaveDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lý do (không bắt buộc)</label>
            <input
              type="text"
              value={leaveReason}
              onChange={(e) => setLeaveReason(e.target.value)}
              placeholder="Ví dụ: Nghỉ việc gia đình"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleRegisterLeave}
            disabled={registeringLeave || leaveMeta.remainingPaidOffDays <= 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-60"
          >
            {registeringLeave ? 'Đang đăng ký...' : 'Đăng ký ngày nghỉ có lương'}
          </button>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Ngày nghỉ đã đăng ký</p>
            {monthlyLeaves.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có ngày nghỉ nào trong tháng này.</p>
            ) : (
              <div className="space-y-2">
                {monthlyLeaves.map((leave) => (
                  <div
                    key={leave._id}
                    className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{leave.date}</p>
                      <p className="text-xs text-gray-500">{leave.reason || 'Nghỉ cá nhân'}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteLeave(leave._id)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">3. Tổng quan lịch tháng</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs text-blue-600">Ngày làm việc</p>
            <p className="text-xl font-semibold text-blue-800">{calendarStats.workingDays}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-600">Ngày nghỉ cố định</p>
            <p className="text-xl font-semibold text-slate-800">{calendarStats.weeklyOffDays}</p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs text-emerald-600">Ngày nghỉ có lương</p>
            <p className="text-xl font-semibold text-emerald-800">{calendarStats.paidOffDays}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2">Ngày</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2">Trạng thái</th>
                <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2">Khung giờ</th>
              </tr>
            </thead>
            <tbody>
              {calendar.map((item) => (
                <tr key={item.date} className="border-t border-gray-100">
                  <td className="px-3 py-2 text-sm text-gray-800">{item.date}</td>
                  <td className="px-3 py-2 text-sm">
                    {item.status === 'working' && <span className="text-blue-700">Làm việc</span>}
                    {item.status === 'weekly_off' && <span className="text-slate-600">Nghỉ cố định</span>}
                    {item.status === 'paid_off' && <span className="text-emerald-700">Nghỉ có lương</span>}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">
                    {Array.isArray(item.timeSlots) && item.timeSlots.length > 0
                      ? item.timeSlots.map((slot) => `${slot.startTime} - ${slot.endTime}`).join(', ')
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WorkScheduleRegistration;
