import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { specialtyAPI } from '../../services/api';
import { Stethoscope, Building2, Search, ArrowRight } from 'lucide-react';

const cardThemes = [
  {
    shell: 'from-sky-50 to-cyan-50 border-sky-100',
    icon: 'from-sky-500 to-cyan-500',
    pill: 'bg-sky-100 text-sky-700',
  },
  {
    shell: 'from-emerald-50 to-teal-50 border-emerald-100',
    icon: 'from-emerald-500 to-teal-500',
    pill: 'bg-emerald-100 text-emerald-700',
  },
  {
    shell: 'from-indigo-50 to-blue-50 border-indigo-100',
    icon: 'from-indigo-500 to-blue-500',
    pill: 'bg-indigo-100 text-indigo-700',
  },
  {
    shell: 'from-amber-50 to-orange-50 border-amber-100',
    icon: 'from-amber-500 to-orange-500',
    pill: 'bg-amber-100 text-amber-700',
  },
];

const SpecialtyCard = ({ specialty, index }) => {
  const theme = cardThemes[index % cardThemes.length];
  const departmentName =
    typeof specialty?.departmentId === 'object'
      ? specialty.departmentId?.name
      : specialty?.department;

  return (
    <article className={`rounded-2xl border p-5 shadow-sm hover:shadow-lg transition-all bg-gradient-to-br ${theme.shell}`}>
      <div className="flex items-center justify-between gap-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.icon} text-white flex items-center justify-center shadow-sm`}>
          <Stethoscope className="w-5 h-5" />
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${theme.pill}`}>
          Chuyên khoa
        </span>
      </div>

      <h3 className="mt-4 text-xl font-black text-slate-800">{specialty?.name || 'Chuyên khoa'}</h3>

      <p className="mt-2 text-sm text-slate-600 min-h-[68px] leading-6">
        {specialty?.description || 'Thông tin chuyên khoa đang được cập nhật.'}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm text-slate-500">
          <Building2 className="w-4 h-4" />
          {departmentName || 'Khoa liên quan đang cập nhật'}
        </div>
        <Link
          to="/patient/appointments"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-sky-700"
        >
          Đặt lịch <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
};

const PatientSpecialties = () => {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const data = await specialtyAPI.getAll();
        setSpecialties(Array.isArray(data) ? data : []);
      } catch (error) {
        setSpecialties([]);
      } finally {
        setLoading(false);
      }
    };

    loadSpecialties();
  }, []);

  const totalSpecialties = useMemo(() => specialties.length, [specialties]);
  const departments = useMemo(() => {
    const names = specialties
      .map((item) =>
        typeof item?.departmentId === 'object' ? item?.departmentId?.name : item?.department
      )
      .filter(Boolean);
    return Array.from(new Set(names));
  }, [specialties]);

  const filteredSpecialties = useMemo(() => {
    const key = keyword.trim().toLowerCase();
    return specialties.filter((item) => {
      const departmentName =
        typeof item?.departmentId === 'object' ? item?.departmentId?.name : item?.department;
      const matchDepartment = selectedDepartment === 'all' || departmentName === selectedDepartment;
      const matchKeyword =
        !key ||
        String(item?.name || '').toLowerCase().includes(key) ||
        String(item?.description || '').toLowerCase().includes(key);
      return matchDepartment && matchKeyword;
    });
  }, [specialties, keyword, selectedDepartment]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        <header className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 lg:p-10 shadow-sm mb-8">
          <div className="absolute -top-12 -right-8 w-40 h-40 bg-sky-100 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-8 w-44 h-44 bg-emerald-100 rounded-full blur-3xl" />
          <div className="relative">
            <p className="inline-flex items-center px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold">
              Danh mục chuyên khoa
            </p>
            <h1 className="mt-3 text-4xl lg:text-5xl font-black text-slate-800">Khám phá chuyên khoa phù hợp với bạn</h1>
            <p className="mt-3 text-slate-600 max-w-3xl text-base leading-7">
              Danh sách dưới đây được lấy trực tiếp từ dữ liệu hệ thống HSM. Bạn có thể tìm kiếm nhanh và lọc theo khoa để chọn đúng chuyên khoa trước khi đặt lịch.
            </p>
            <div className="mt-5 inline-flex items-center px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-semibold text-sm">
              Tổng số chuyên khoa hiện có: {totalSpecialties}
            </div>
          </div>
        </header>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 lg:p-5 mb-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-center">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo tên chuyên khoa hoặc mô tả..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedDepartment('all')}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${
                  selectedDepartment === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả khoa
              </button>
              {departments.map((department) => (
                <button
                  key={department}
                  onClick={() => setSelectedDepartment(department)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ${
                    selectedDepartment === department
                      ? 'bg-sky-700 text-white'
                      : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                  }`}
                >
                  {department}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="h-64 rounded-2xl border border-slate-200 bg-white animate-pulse" />
            ))}
          </div>
        ) : filteredSpecialties.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-600">
            Không tìm thấy chuyên khoa phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpecialties.map((specialty, index) => (
              <SpecialtyCard key={specialty?._id || specialty?.name} specialty={specialty} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientSpecialties;
