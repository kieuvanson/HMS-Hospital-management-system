import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import {
  Search, Stethoscope, Clock, FileText, ChevronRight, ChevronDown,
  AlertCircle, CheckCircle, XCircle, Filter, ClipboardList, RefreshCw,
  X, Plus, Trash2, User, Activity, Pill, StickyNote, Calendar,
  Heart, Thermometer, Weight, Ruler, Save, FlaskConical, ArrowLeft,
  Eye, Edit3, Lock,
} from 'lucide-react';
import { appointmentAPI } from '../../services/api.js';

// ─────────────────────────────────────────
//  Cấu hình trạng thái
// ─────────────────────────────────────────
const statusConfig = {
  confirmed:    { label: 'Chờ khám',    bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertCircle },
  in_progress:  { label: 'Đang khám',   bg: 'bg-blue-100',   text: 'text-blue-800',   icon: Stethoscope },
  completed:    { label: 'Hoàn thành',  bg: 'bg-green-100',  text: 'text-green-800',  icon: CheckCircle },
  cancelled:    { label: 'Đã hủy',      bg: 'bg-red-100',    text: 'text-red-800',    icon: XCircle },
};

// ─────────────────────────────────────────
//  Panel Khám bệnh (slide-in từ phải)
// ─────────────────────────────────────────
const ExaminationPanel = ({ appointment, onClose, onCompleted }) => {
  const [activeTab, setActiveTab] = useState('vitals');
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [vitals, setVitals] = useState({
    bloodPressure: '', heartRate: '', temperature: '', weight: '', height: '', spO2: '',
  });
  const [diagnosis, setDiagnosis] = useState('');
  const [icdCode, setIcdCode] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [anamnesis, setAnamnesis] = useState(''); // tiền sử bệnh
  const [allergies, setAllergies] = useState('');
  const [medications, setMedications] = useState([
    { medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' },
  ]);
  const [labOrders, setLabOrders] = useState([]); // chỉ định xét nghiệm
  const [doctorNotes, setDoctorNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpInstructions, setFollowUpInstructions] = useState('');

  const patient = appointment.patient || {};

  // ── Tabs ──
  const tabs = [
    { id: 'vitals',      label: 'Sinh hiệu',    icon: Activity },
    { id: 'diagnosis',   label: 'Chẩn đoán',    icon: Stethoscope },
    { id: 'prescription',label: 'Đơn thuốc',    icon: Pill },
    { id: 'labs',        label: 'Xét nghiệm',   icon: FlaskConical },
    { id: 'notes',       label: 'Ghi chú',      icon: StickyNote },
    { id: 'followup',    label: 'Tái khám',      icon: Calendar },
  ];

  // ── Medication helpers ──
  const addMed = () => setMedications(p => [...p, { medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const removeMed = (i) => setMedications(p => p.filter((_, idx) => idx !== i));
  const updateMed = (i, f, v) => setMedications(p => p.map((m, idx) => idx === i ? { ...m, [f]: v } : m));

  // ── Lab helpers ──
  const LAB_OPTIONS = [
    'Xét nghiệm máu tổng quát', 'Sinh hóa máu', 'Đường huyết',
    'Chức năng gan (AST/ALT)', 'Chức năng thận (Creatinine/Urea)',
    'Tổng phân tích nước tiểu', 'X-quang phổi', 'Siêu âm bụng',
    'Điện tim (ECG)', 'Đo mật độ xương', 'Xét nghiệm COVID-19',
    'HbA1c', 'Lipid máu (Cholesterol/Triglyceride)',
  ];
  const toggleLab = (lab) =>
    setLabOrders(p => p.includes(lab) ? p.filter(l => l !== lab) : [...p, lab]);

  // ── Hoàn thành khám ──
  const handleComplete = async () => {
    if (!diagnosis.trim()) {
      setActiveTab('diagnosis');
      setError('Vui lòng nhập chẩn đoán trước khi hoàn thành');
      return;
    }
    setCompleting(true);
    setError('');
    try {
      await appointmentAPI.completeExamination(appointment._id, {
        diagnosis,
        icdCode,
        doctorNotes,
        followUpDate: followUpDate || undefined,
        followUpInstructions,
        symptoms: symptoms ? symptoms.split(',').map(s => s.trim()).filter(Boolean) : [],
        prescription: medications.filter(m => m.medicationName.trim()),
        vitalSigns: {
          bloodPressure: vitals.bloodPressure
            ? { systolic: parseInt(vitals.bloodPressure.split('/')[0]) || 0, diastolic: parseInt(vitals.bloodPressure.split('/')[1]) || 0 }
            : undefined,
          heartRate: vitals.heartRate ? Number(vitals.heartRate) : undefined,
          temperature: vitals.temperature ? Number(vitals.temperature) : undefined,
          weight: vitals.weight ? Number(vitals.weight) : undefined,
          height: vitals.height ? Number(vitals.height) : undefined,
        },
      });
      onCompleted();
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi hoàn thành khám');
      setCompleting(false);
    }
  };

  // ── Lưu nháp (cập nhật notes tạm) ──
  const handleSaveDraft = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-3xl bg-white shadow-2xl flex flex-col h-full overflow-hidden animate-slide-in">
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-none">Phiếu khám bệnh</h2>
              <p className="text-blue-100 text-sm mt-0.5">{appointment.appointmentTime} — {new Date().toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Patient info bar ── */}
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center gap-6 text-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{patient.name || '—'}</p>
              <p className="text-xs text-gray-500">{patient.gender}, {patient.age ? `${patient.age} tuổi` : '—'}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-blue-200" />
          <div className="text-gray-600"><span className="text-gray-400 text-xs">SĐT</span><br />{patient.phone || '—'}</div>
          <div className="h-8 w-px bg-blue-200" />
          <div className="text-gray-600"><span className="text-gray-400 text-xs">Lý do khám</span><br />
            <span className="text-gray-800 font-medium">{appointment.reason}</span>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-200 text-blue-800 text-xs font-semibold rounded-full">
              <Stethoscope className="w-3 h-3" /> Đang khám
            </span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b bg-gray-50 flex-shrink-0 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError(''); }}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white'}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
            <button onClick={() => setError('')} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* ── Tab Content ── */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* TAB: Sinh hiệu */}
          {activeTab === 'vitals' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" /> Đo dấu hiệu sinh tồn
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* Huyết áp */}
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-gray-700">Huyết áp (mmHg)</span>
                    </div>
                    <input
                      type="text"
                      placeholder="VD: 120/80"
                      value={vitals.bloodPressure}
                      onChange={e => setVitals(p => ({ ...p, bloodPressure: e.target.value }))}
                      className="w-full text-lg font-semibold text-gray-900 bg-transparent border-0 border-b border-red-200 focus:outline-none focus:border-red-400 pb-1"
                    />
                  </div>
                  {/* Nhịp tim */}
                  <div className="bg-pink-50 border border-pink-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-pink-500" />
                      <span className="text-sm font-medium text-gray-700">Nhịp tim (bpm)</span>
                    </div>
                    <input
                      type="number"
                      placeholder="VD: 78"
                      value={vitals.heartRate}
                      onChange={e => setVitals(p => ({ ...p, heartRate: e.target.value }))}
                      className="w-full text-lg font-semibold text-gray-900 bg-transparent border-0 border-b border-pink-200 focus:outline-none focus:border-pink-400 pb-1"
                    />
                  </div>
                  {/* Nhiệt độ */}
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-700">Nhiệt độ (°C)</span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="VD: 37.2"
                      value={vitals.temperature}
                      onChange={e => setVitals(p => ({ ...p, temperature: e.target.value }))}
                      className="w-full text-lg font-semibold text-gray-900 bg-transparent border-0 border-b border-orange-200 focus:outline-none focus:border-orange-400 pb-1"
                    />
                  </div>
                  {/* SpO2 */}
                  <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-sky-500" />
                      <span className="text-sm font-medium text-gray-700">SpO₂ (%)</span>
                    </div>
                    <input
                      type="number"
                      placeholder="VD: 98"
                      value={vitals.spO2}
                      onChange={e => setVitals(p => ({ ...p, spO2: e.target.value }))}
                      className="w-full text-lg font-semibold text-gray-900 bg-transparent border-0 border-b border-sky-200 focus:outline-none focus:border-sky-400 pb-1"
                    />
                  </div>
                  {/* Cân nặng */}
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Weight className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">Cân nặng (kg)</span>
                    </div>
                    <input
                      type="number"
                      placeholder="VD: 65"
                      value={vitals.weight}
                      onChange={e => setVitals(p => ({ ...p, weight: e.target.value }))}
                      className="w-full text-lg font-semibold text-gray-900 bg-transparent border-0 border-b border-green-200 focus:outline-none focus:border-green-400 pb-1"
                    />
                  </div>
                  {/* Chiều cao */}
                  <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Ruler className="w-4 h-4 text-teal-500" />
                      <span className="text-sm font-medium text-gray-700">Chiều cao (cm)</span>
                    </div>
                    <input
                      type="number"
                      placeholder="VD: 165"
                      value={vitals.height}
                      onChange={e => setVitals(p => ({ ...p, height: e.target.value }))}
                      className="w-full text-lg font-semibold text-gray-900 bg-transparent border-0 border-b border-teal-200 focus:outline-none focus:border-teal-400 pb-1"
                    />
                  </div>
                </div>

                {/* BMI tự tính */}
                {vitals.weight && vitals.height && (
                  <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-600">Chỉ số BMI</span>
                    <span className={`text-xl font-bold ${(() => {
                      const bmi = (Number(vitals.weight) / Math.pow(Number(vitals.height) / 100, 2));
                      return bmi < 18.5 ? 'text-blue-600' : bmi < 25 ? 'text-green-600' : bmi < 30 ? 'text-yellow-600' : 'text-red-600';
                    })()}`}>
                      {(Number(vitals.weight) / Math.pow(Number(vitals.height) / 100, 2)).toFixed(1)}
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        {(() => {
                          const bmi = Number(vitals.weight) / Math.pow(Number(vitals.height) / 100, 2);
                          if (bmi < 18.5) return '(Thiếu cân)';
                          if (bmi < 25) return '(Bình thường)';
                          if (bmi < 30) return '(Thừa cân)';
                          return '(Béo phì)';
                        })()}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: Chẩn đoán */}
          {activeTab === 'diagnosis' && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" /> Thông tin chẩn đoán
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Triệu chứng hiện tại
                </label>
                <input
                  type="text"
                  placeholder="VD: Đau đầu, sốt, buồn nôn (phân cách bằng dấu phẩy)"
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tiền sử bệnh / dị ứng thuốc
                </label>
                <textarea
                  rows={2}
                  placeholder="VD: Tăng huyết áp, tiểu đường type 2. Dị ứng Penicillin."
                  value={anamnesis}
                  onChange={e => setAnamnesis(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Chẩn đoán <span className="text-red-500 font-bold">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Nhập chẩn đoán chính..."
                  value={diagnosis}
                  onChange={e => setDiagnosis(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mã ICD-10
                  <span className="ml-1 text-xs text-gray-400">(tùy chọn)</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: K29.7 — Viêm dạ dày mãn tính"
                  value={icdCode}
                  onChange={e => setIcdCode(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Dị ứng thuốc</label>
                <input
                  type="text"
                  placeholder="VD: Penicillin, Aspirin"
                  value={allergies}
                  onChange={e => setAllergies(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB: Đơn thuốc */}
          {activeTab === 'prescription' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-blue-600" /> Kê đơn thuốc
                </h3>
                <button
                  onClick={addMed}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Thêm thuốc
                </button>
              </div>

              {medications.map((med, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50 relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                      Thuốc #{idx + 1}
                    </span>
                    {medications.length > 1 && (
                      <button onClick={() => removeMed(idx)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Tên thuốc <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        placeholder="VD: Omeprazole"
                        value={med.medicationName}
                        onChange={e => updateMed(idx, 'medicationName', e.target.value)}
                        className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Liều dùng</label>
                      <input
                        type="text"
                        placeholder="VD: 20mg"
                        value={med.dosage}
                        onChange={e => updateMed(idx, 'dosage', e.target.value)}
                        className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tần suất</label>
                      <select
                        value={med.frequency}
                        onChange={e => updateMed(idx, 'frequency', e.target.value)}
                        className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Chọn --</option>
                        <option>1 lần/ngày</option>
                        <option>2 lần/ngày</option>
                        <option>3 lần/ngày</option>
                        <option>4 lần/ngày</option>
                        <option>Khi cần</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Thời gian dùng</label>
                      <select
                        value={med.duration}
                        onChange={e => updateMed(idx, 'duration', e.target.value)}
                        className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">-- Chọn --</option>
                        <option>3 ngày</option>
                        <option>5 ngày</option>
                        <option>7 ngày</option>
                        <option>10 ngày</option>
                        <option>14 ngày</option>
                        <option>1 tháng</option>
                        <option>Liên tục</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Hướng dẫn dùng</label>
                      <input
                        type="text"
                        placeholder="VD: Uống sau ăn 30 phút"
                        value={med.instructions}
                        onChange={e => updateMed(idx, 'instructions', e.target.value)}
                        className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: Xét nghiệm */}
          {activeTab === 'labs' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-blue-600" /> Chỉ định xét nghiệm / CĐHA
              </h3>
              <p className="text-sm text-gray-500">Chọn các xét nghiệm cần thực hiện:</p>
              <div className="grid grid-cols-2 gap-2">
                {LAB_OPTIONS.map(lab => (
                  <label
                    key={lab}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                      ${labOrders.includes(lab)
                        ? 'bg-blue-50 border-blue-400 text-blue-800'
                        : 'bg-white border-gray-200 hover:border-blue-300'}`}
                  >
                    <input
                      type="checkbox"
                      checked={labOrders.includes(lab)}
                      onChange={() => toggleLab(lab)}
                      className="accent-blue-600 w-4 h-4"
                    />
                    <span className="text-sm">{lab}</span>
                  </label>
                ))}
              </div>
              {labOrders.length > 0 && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-sm font-semibold text-blue-700 mb-2">Đã chọn {labOrders.length} xét nghiệm:</p>
                  <ul className="space-y-1">
                    {labOrders.map(l => (
                      <li key={l} className="text-sm text-blue-800 flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5" /> {l}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB: Ghi chú */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-blue-600" /> Ghi chú & nhận xét
              </h3>
              <textarea
                rows={10}
                placeholder="Nhập ghi chú của bác sĩ, nhận xét lâm sàng, hướng dẫn chăm sóc cho bệnh nhân..."
                value={doctorNotes}
                onChange={e => setDoctorNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-400 text-right">{doctorNotes.length} ký tự</p>
            </div>
          )}

          {/* TAB: Tái khám */}
          {activeTab === 'followup' && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" /> Lên lịch tái khám
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày tái khám</label>
                <input
                  type="date"
                  value={followUpDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setFollowUpDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Hướng dẫn tái khám</label>
                <textarea
                  rows={4}
                  placeholder="VD: Tái khám sau 2 tuần, mang kết quả xét nghiệm theo..."
                  value={followUpInstructions}
                  onChange={e => setFollowUpInstructions(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              {followUpDate && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">
                      Ngày tái khám: {new Date(followUpDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                    {followUpInstructions && <p className="text-sm text-green-700 mt-0.5">{followUpInstructions}</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer Actions ── */}
        <div className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                saved
                  ? 'border-green-300 bg-green-50 text-green-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Đã lưu!' : 'Lưu nháp'}
            </button>
            <button
              onClick={handleComplete}
              disabled={completing}
              className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 shadow-sm"
            >
              {completing
                ? <><RefreshCw className="w-4 h-4 animate-spin" /> Đang lưu...</>
                : <><CheckCircle className="w-4 h-4" /> Hoàn thành khám</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
//  Panel Xem & Chỉnh sửa Hồ sơ Khám Bệnh (completed)
// ─────────────────────────────────────────
const MedicalRecordViewPanel = ({ appointment, onClose, onSaved }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('diagnosis');

  // Dữ liệu hiển thị
  const [diagnosis, setDiagnosis] = useState('');
  const [icdCode, setIcdCode] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpInstructions, setFollowUpInstructions] = useState('');
  const [medications, setMedications] = useState([]);
  const [vitalSigns, setVitalSigns] = useState({});
  const [completedAt, setCompletedAt] = useState(null);

  const patient = appointment.patient || {};

  // Load chi tiết từ server
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await appointmentAPI.getExaminationDetail(appointment._id);
        const apt = res.data || {};
        setDiagnosis(apt.diagnosis || '');
        setIcdCode(apt.icdCode || '');
        setDoctorNotes(apt.doctorNotes || '');
        setFollowUpDate(apt.followUpDate ? apt.followUpDate.split('T')[0] : '');
        setFollowUpInstructions(apt.followUpInstructions || '');
        setCompletedAt(apt.completedAt || null);
        // Parse prescription string thành mảng thuốc
        if (apt.prescription && typeof apt.prescription === 'string' && apt.prescription.trim()) {
          const meds = apt.prescription.split(';').map(s => {
            const parts = s.trim().split(' - ');
            return {
              medicationName: parts[0] || '',
              dosage: parts[1] || '',
              frequency: parts[2] || '',
              duration: parts[3] || '',
              instructions: parts[4] || '',
            };
          }).filter(m => m.medicationName);
          setMedications(meds.length > 0 ? meds : [
            { medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }
          ]);
        } else {
          setMedications([{ medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
        }
        // Vital signs
        setVitalSigns(apt.vitalSigns || {});
        if (apt.symptoms && Array.isArray(apt.symptoms)) {
          setSymptoms(apt.symptoms.join(', '));
        }
      } catch (err) {
        setError('Không thể tải dữ liệu hồ sơ khám');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [appointment._id]);

  const addMed = () => setMedications(p => [...p, { medicationName: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const removeMed = (i) => setMedications(p => p.filter((_, idx) => idx !== i));
  const updateMed = (i, f, v) => setMedications(p => p.map((m, idx) => idx === i ? { ...m, [f]: v } : m));

  const handleSave = async () => {
    if (!diagnosis.trim()) {
      setError('Vui lòng nhập chẩn đoán');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await appointmentAPI.updateMedicalRecord(appointment._id, {
        diagnosis,
        icdCode,
        doctorNotes,
        followUpDate: followUpDate || undefined,
        followUpInstructions,
        symptoms: symptoms ? symptoms.split(',').map(s => s.trim()).filter(Boolean) : [],
        prescription: medications.filter(m => m.medicationName.trim()),
        vitalSigns,
      });
      setSuccessMsg('Cập nhật hồ sơ thành công!');
      setIsEditing(false);
      setTimeout(() => setSuccessMsg(''), 3000);
      if (onSaved) onSaved(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'diagnosis',    label: 'Chẩn đoán', icon: Stethoscope },
    { id: 'prescription', label: 'Đơn thuốc',  icon: Pill },
    { id: 'notes',        label: 'Ghi chú',    icon: StickyNote },
    { id: 'followup',     label: 'Tái khám',    icon: Calendar },
  ];

  const Field = ({ label, value, children }) => (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      {children || <p className="text-sm text-gray-800 font-medium">{value || <span className="text-gray-400 italic">Chưa có</span>}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-3xl bg-white shadow-2xl flex flex-col h-full overflow-hidden animate-slide-in">

        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between flex-shrink-0 ${isEditing ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-green-600 to-green-700'}`}>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              {isEditing ? <Edit3 className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-none">
                {isEditing ? 'Chỉnh sửa hồ sơ khám' : 'Hồ sơ khám bệnh'}
              </h2>
              <p className="text-white/80 text-sm mt-0.5">
                {completedAt
                  ? `Hoàn thành: ${new Date(completedAt).toLocaleString('vi-VN')}`
                  : appointment.appointmentTime + ' — ' + new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient info bar */}
        <div className="bg-green-50 border-b border-green-100 px-6 py-3 flex items-center gap-6 text-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-200 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{patient.name || '—'}</p>
              <p className="text-xs text-gray-500">{patient.gender}, {patient.age ? `${patient.age} tuổi` : '—'}</p>
            </div>
          </div>
          <div className="h-8 w-px bg-green-200" />
          <div className="text-gray-600"><span className="text-gray-400 text-xs">Điện thoại</span><br />{patient.phone || '—'}</div>
          <div className="h-8 w-px bg-green-200" />
          <div className="text-gray-600"><span className="text-gray-400 text-xs">Lý do khám</span><br />
            <span className="text-gray-800 font-medium">{appointment.reason}</span>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-200 text-green-800 text-xs font-semibold rounded-full">
              <CheckCircle className="w-3 h-3" /> Hoàn thành
            </span>
          </div>
        </div>

        {/* Edit toggle banner */}
        {!isEditing && !loading && (
          <div className="mx-6 mt-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2 text-amber-800 text-sm">
              <Lock className="w-4 h-4" />
              <span>Đang xem — nhấn <strong>Chỉnh sửa</strong> để cập nhật hồ sơ</span>
            </div>
            <button
              onClick={() => { setIsEditing(true); setError(''); setSuccessMsg(''); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
            </button>
          </div>
        )}

        {/* Success banner */}
        {successMsg && (
          <div className="mx-6 mt-3 bg-green-50 border border-green-300 text-green-800 text-sm rounded-lg px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
            <CheckCircle className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="mx-6 mt-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5 flex items-center gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            <button onClick={() => setError('')} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b bg-gray-50 flex-shrink-0 overflow-x-auto mt-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-green-600 text-green-700 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white'}`}
              >
                <Icon className="w-4 h-4" />{tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <>
              {/* TAB: Chẩn đoán */}
              {activeTab === 'diagnosis' && (
                <div className="space-y-5">
                  <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-green-600" /> Thông tin chẩn đoán
                  </h3>

                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Triệu chứng</label>
                        <input type="text" value={symptoms} onChange={e => setSymptoms(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="VD: Đau đầu, sốt, buồn nôn (phân cách bằng dấu phẩy)" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Chẩn đoán <span className="text-red-500">*</span></label>
                        <textarea rows={3} value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                          placeholder="Nhập chẩn đoán chính..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Mã ICD-10 (tùy chọn)</label>
                        <input type="text" value={icdCode} onChange={e => setIcdCode(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="VD: K29.7" />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <Field label="Chẩn đoán" value={diagnosis} />
                      </div>
                      {icdCode && <Field label="Mã ICD-10" value={icdCode} />}
                      {symptoms && <Field label="Triệu chứng" value={symptoms} />}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Đơn thuốc */}
              {activeTab === 'prescription' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                      <Pill className="w-5 h-5 text-green-600" /> Đơn thuốc
                    </h3>
                    {isEditing && (
                      <button onClick={addMed}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                        <Plus className="w-4 h-4" /> Thêm thuốc
                      </button>
                    )}
                  </div>

                  {medications.filter(m => m.medicationName || isEditing).length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Được chỉ định không có thuốc.</p>
                  ) : medications.map((med, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50 relative">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-md">Thuốc #{idx + 1}</span>
                        {isEditing && medications.length > 1 && (
                          <button onClick={() => removeMed(idx)} className="text-red-400 hover:text-red-600 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">Tên thuốc</label>
                            <input type="text" value={med.medicationName} onChange={e => updateMed(idx, 'medicationName', e.target.value)}
                              className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Liều dùng</label>
                            <input type="text" value={med.dosage} onChange={e => updateMed(idx, 'dosage', e.target.value)}
                              className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Tần suất</label>
                            <select value={med.frequency} onChange={e => updateMed(idx, 'frequency', e.target.value)}
                              className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                              <option value="">-- Chọn --</option>
                              <option>1 lần/ngày</option>
                              <option>2 lần/ngày</option>
                              <option>3 lần/ngày</option>
                              <option>4 lần/ngày</option>
                              <option>Khi cần</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Thời gian</label>
                            <select value={med.duration} onChange={e => updateMed(idx, 'duration', e.target.value)}
                              className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
                              <option value="">-- Chọn --</option>
                              <option>3 ngày</option><option>5 ngày</option><option>7 ngày</option>
                              <option>10 ngày</option><option>14 ngày</option><option>1 tháng</option><option>Liên tục</option>
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-500 mb-1">Hướng dẫn</label>
                            <input type="text" value={med.instructions} onChange={e => updateMed(idx, 'instructions', e.target.value)}
                              className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="col-span-2"><span className="text-gray-400 text-xs">Tên thuốc</span><p className="font-semibold text-gray-800">{med.medicationName || '—'}</p></div>
                          {med.dosage && <div><span className="text-gray-400 text-xs">Liều dùng</span><p className="text-gray-700">{med.dosage}</p></div>}
                          {med.frequency && <div><span className="text-gray-400 text-xs">Tần suất</span><p className="text-gray-700">{med.frequency}</p></div>}
                          {med.duration && <div><span className="text-gray-400 text-xs">Thời gian</span><p className="text-gray-700">{med.duration}</p></div>}
                          {med.instructions && <div className="col-span-2"><span className="text-gray-400 text-xs">Hướng dẫn</span><p className="text-gray-700">{med.instructions}</p></div>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB: Ghi chú */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <StickyNote className="w-5 h-5 text-green-600" /> Ghi chú bác sĩ
                  </h3>
                  {isEditing ? (
                    <textarea rows={10} value={doctorNotes} onChange={e => setDoctorNotes(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      placeholder="Nhập ghi chú..." />
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      {doctorNotes
                        ? <p className="text-sm text-gray-800 whitespace-pre-wrap">{doctorNotes}</p>
                        : <p className="text-sm text-gray-400 italic">Không có ghi chú.</p>}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: Tái khám */}
              {activeTab === 'followup' && (
                <div className="space-y-5">
                  <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" /> Lịch tái khám
                  </h3>
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngày tái khám</label>
                        <input type="date" value={followUpDate}
                          onChange={e => setFollowUpDate(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Hướng dẫn tái khám</label>
                        <textarea rows={4} value={followUpInstructions}
                          onChange={e => setFollowUpInstructions(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                          placeholder="VD: Tái khám sau 2 tuần..." />
                      </div>
                    </>
                  ) : (
                    followUpDate ? (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-green-800">
                            Ngày tái khám: {new Date(followUpDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </p>
                          {followUpInstructions && <p className="text-sm text-green-700 mt-1">{followUpInstructions}</p>}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Không có lịch tái khám.</p>
                    )
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button onClick={onClose}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 font-medium">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => { setIsEditing(false); setError(''); }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Huỷ chỉnh sửa
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 shadow-sm"
                >
                  {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Đang lưu...</> : <><Save className="w-4 h-4" /> Lưu thay đổi</>}
                </button>
              </>
            ) : (
              <button
                onClick={() => { setIsEditing(true); setError(''); }}
                className="flex items-center gap-2 px-5 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
              >
                <Edit3 className="w-4 h-4" /> Chỉnh sửa hồ sơ
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
//  Trang Khám bệnh chính
// ─────────────────────────────────────────
const Examinations = () => {
  const location = useLocation();
  const navigate = useNavigate();
  useOutletContext() || {};
  const [examinations, setExaminations] = useState([]);
  const [stats, setStats] = useState({ waiting: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [examPanel, setExamPanel] = useState(null);   // appointment đang mở panel
  const [viewPanel, setViewPanel] = useState(null);   // appointment đang xem hs
  const [actionLoading, setActionLoading] = useState(null);
  const [pendingFocus, setPendingFocus] = useState(() => ({
    id: location.state?.focusAppointmentId || null,
    appointment: location.state?.focusAppointment || null,
  }));

  const isSameDay = (a, b) => (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  );

  // ── Fetch data ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await appointmentAPI.getTodayExaminations({
        status: filterStatus !== 'all' ? filterStatus : undefined,
      });
      setExaminations(res.data || []);
      setStats(res.stats || { waiting: 0, inProgress: 0, completed: 0 });
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Bạn không có quyền truy cập. Chỉ bác sĩ mới xem được trang này.');
      } else {
        setError(err.response?.data?.message || 'Không thể tải dữ liệu. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const focusId = location.state?.focusAppointmentId;
    if (focusId) {
      setPendingFocus({
        id: focusId,
        appointment: location.state?.focusAppointment || null,
      });
    }
  }, [location.state]);

  // ── Bắt đầu khám → gọi API rồi mở panel ──
  const handleStart = useCallback(async (apt) => {
    setActionLoading(apt._id);
    try {
      await appointmentAPI.startExamination(apt._id);
      // Cập nhật local state
      let foundInTodayList = false;
      setExaminations(prev =>
        prev.map(e => {
          if (e._id === apt._id) {
            foundInTodayList = true;
            return { ...e, status: 'in_progress' };
          }
          return e;
        })
      );
      if (foundInTodayList) {
        setStats(prev => ({ ...prev, waiting: Math.max(0, prev.waiting - 1), inProgress: prev.inProgress + 1 }));
      }
      // Mở panel khám với appointment cập nhật status
      setExamPanel({ ...apt, status: 'in_progress' });
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể bắt đầu khám');
    } finally {
      setActionLoading(null);
    }
  }, []);

  useEffect(() => {
    if (!pendingFocus?.id || loading) return;

    const clearNavigationState = () => {
      navigate('/doctor/examinations', { replace: true, state: null });
    };

    const openTarget = async () => {
      let target = examinations.find((item) => item._id === pendingFocus.id)
        || pendingFocus.appointment;

      if (!target) {
        try {
          target = await appointmentAPI.getAppointmentById(pendingFocus.id);
        } catch (err) {
          setError('Không thể tải chi tiết lịch hẹn cần mở.');
          setPendingFocus({ id: null, appointment: null });
          clearNavigationState();
          return;
        }
      }

      if (!target) {
        setError('Không tìm thấy lịch hẹn cần mở.');
        setPendingFocus({ id: null, appointment: null });
        clearNavigationState();
        return;
      }

      const appointmentDate = target.appointmentDate ? new Date(target.appointmentDate) : null;
      const notToday = appointmentDate && !isSameDay(appointmentDate, new Date());

      if (notToday) {
        const ok = window.confirm('Lịch khám này không phải ngày hôm nay. Bạn có muốn tiếp tục khám không?');
        if (!ok) {
          setPendingFocus({ id: null, appointment: null });
          clearNavigationState();
          return;
        }
      }

      setExpandedId(target._id);

      if (target.status === 'confirmed') {
        await handleStart(target);
      } else if (target.status === 'in_progress') {
        setExamPanel(target);
      } else if (target.status === 'completed') {
        setViewPanel(target);
      }

      setPendingFocus({ id: null, appointment: null });
      clearNavigationState();
    };

    openTarget();
  }, [pendingFocus, loading, examinations, handleStart, navigate]);

  // ── Mở panel từ row đang in_progress ──
  const handleOpenPanel = (apt) => {
    setExamPanel(apt);
  };

  // ── Sau khi complete ──
  const handleCompleted = async () => {
    setExamPanel(null);
    await fetchData();
  };

  // ── Filter client-side ──
  const filtered = examinations.filter(exam => {
    if (!searchTerm.trim()) return true;
    const kw = searchTerm.toLowerCase();
    return (
      (exam.patient?.name || '').toLowerCase().includes(kw) ||
      (exam.patient?.phone || '').includes(kw) ||
      (exam.reason || '').toLowerCase().includes(kw)
    );
  });

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Khám bệnh</h1>
              <p className="text-gray-600 mt-2">Danh sách bệnh nhân cần khám hôm nay — {today}</p>
            </div>
            <button onClick={fetchData} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { count: stats.waiting,    label: 'Chờ khám',   color: 'yellow', Icon: AlertCircle },
            { count: stats.inProgress, label: 'Đang khám',  color: 'blue',   Icon: Stethoscope },
            { count: stats.completed,  label: 'Hoàn thành', color: 'green',  Icon: CheckCircle },
          ].map(({ count, label, color, Icon }) => (
            <div key={label} className="bg-white rounded-lg shadow-md p-5 flex items-center gap-4">
              <div className={`p-3 rounded-full bg-${color}-100`}>
                <Icon className={`h-6 w-6 text-${color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên bệnh nhân, SĐT, lý do khám..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="waiting">Chờ khám</option>
                <option value="in_progress">Đang khám</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse flex gap-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-8" />
                  <div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded w-40" /><div className="h-3 bg-gray-100 rounded w-24" /></div>
                  <div className="h-4 bg-gray-200 rounded w-16" />
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-6 bg-gray-200 rounded-full w-24" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">{examinations.length === 0 ? 'Không có lịch khám nào hôm nay.' : 'Không tìm thấy bệnh nhân phù hợp.'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['STT','Bệnh nhân','Giờ khám','Lý do','Trạng thái',''].map(th => (
                      <th key={th} className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">{th}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((exam, idx) => {
                    const sc = statusConfig[exam.status] || statusConfig.confirmed;
                    const StatusIcon = sc.icon;
                    const isExpanded = expandedId === exam._id;
                    const isActioning = actionLoading === exam._id;

                    return (
                      <React.Fragment key={exam._id}>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900">{exam.patient?.name}</p>
                            <p className="text-xs text-gray-500">{exam.patient?.gender}, {exam.patient?.age ? `${exam.patient.age} tuổi` : '—'} · {exam.patient?.phone}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-sm text-gray-700">
                              <Clock className="w-4 h-4 text-gray-400" />{exam.appointmentTime}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{exam.reason}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                              <StatusIcon size={14} />{sc.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : exam._id)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="px-4 py-4 bg-gray-50">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-600" /> Kết quả khám
                                  </h4>
                                  {exam.diagnosis ? (
                                    <div className="space-y-2 text-sm">
                                      <div><p className="text-xs text-gray-400">Chẩn đoán</p><p className="font-medium text-gray-800">{exam.diagnosis}</p></div>
                                      {exam.prescription && <div><p className="text-xs text-gray-400">Đơn thuốc</p><p className="text-gray-700">{exam.prescription}</p></div>}
                                      {exam.doctorNotes && <div><p className="text-xs text-gray-400">Ghi chú</p><p className="text-gray-700">{exam.doctorNotes}</p></div>}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-400 italic">Chưa có kết quả — bệnh nhân chưa được khám.</p>
                                  )}
                                </div>
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-blue-600" /> Thông tin bệnh nhân
                                  </h4>
                                  <div className="space-y-2 text-sm">
                                    {[['Họ tên', exam.patient?.name],['SĐT', exam.patient?.phone],['Giới tính', exam.patient?.gender],['Tuổi', exam.patient?.age ? `${exam.patient.age} tuổi` : '—']].map(([k,v]) => (
                                      <div key={k} className="flex justify-between">
                                        <span className="text-gray-400">{k}</span>
                                        <span className="text-gray-800 font-medium">{v || '—'}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Action buttons */}
                              <div className="flex gap-3 mt-4">
                                {exam.status === 'confirmed' && (
                                  <button
                                    onClick={() => handleStart(exam)}
                                    disabled={isActioning}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-sm"
                                  >
                                    {isActioning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />}
                                    Bắt đầu khám
                                  </button>
                                )}
                                {exam.status === 'in_progress' && (
                                  <button
                                    onClick={() => handleOpenPanel(exam)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                  >
                                    <ClipboardList className="w-4 h-4" />
                                    Mở phiếu khám
                                  </button>
                                )}
                                {exam.status === 'completed' && (
                                  <button
                                    onClick={() => setViewPanel(exam)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Xem chi tiết hồ sơ
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Examination Panel (slide-in) */}
      {examPanel && (
        <ExaminationPanel
          appointment={examPanel}
          onClose={() => setExamPanel(null)}
          onCompleted={handleCompleted}
        />
      )}

      {/* Medical Record View Panel (slide-in) */}
      {viewPanel && (
        <MedicalRecordViewPanel
          appointment={viewPanel}
          onClose={() => setViewPanel(null)}
          onSaved={fetchData}
        />
      )}

      {/* Animation style */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </>
  );
};

export default Examinations;
