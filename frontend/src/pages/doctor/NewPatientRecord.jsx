import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicalAPI } from '../../services/api';
import { toast } from 'react-toastify';

const initialState = {
  patientId: '',
  visitDate: '',
  chiefComplaint: '',
  diagnosis: '',
  symptoms: '',
  vitalSigns: '',
  notes: '',
};

const NewPatientRecord = () => {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // required fields per backend: patientId, visitDate, chiefComplaint, diagnosis
      await medicalAPI.createRecord({
        ...form,
      });
      toast.success('Tạo hồ sơ y tế thành công');
      navigate('/doctor/patients');
    } catch (error) {
      toast.error(error.message || 'Tạo hồ sơ thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16 bg-white shadow rounded-lg p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Tạo hồ sơ bệnh nhân</h2>
        <p className="text-sm text-gray-500 mt-1">
          Nhập thông tin khám để lưu hồ sơ y tế. Các trường bắt buộc đã được đánh dấu.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mã bệnh nhân *
            </label>
            <input
              required
              name="patientId"
              value={form.patientId}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="VD: PAT-00123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày khám *
            </label>
            <input
              required
              type="date"
              name="visitDate"
              value={form.visitDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Triệu chứng chính *
            </label>
            <input
              required
              name="chiefComplaint"
              value={form.chiefComplaint}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: Đau ngực, khó thở..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chẩn đoán *
            </label>
            <input
              required
              name="diagnosis"
              value={form.diagnosis}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: Viêm phổi, tăng huyết áp..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Triệu chứng</label>
            <textarea
              name="symptoms"
              rows={3}
              value={form.symptoms}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả chi tiết triệu chứng"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dấu hiệu sinh tồn</label>
            <textarea
              name="vitalSigns"
              rows={3}
              value={form.vitalSigns}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Huyết áp, mạch, nhiệt độ..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
          <textarea
            name="notes"
            rows={3}
            value={form.notes}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ghi chú thêm cho lần khám này"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {submitting ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPatientRecord;
