import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { doctorAPI, userAPI } from '../../services/api';

const STATUS_OPTIONS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'draft', label: 'Đang làm' },
  { key: 'pending_approval', label: 'Chờ phê duyệt' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'rejected', label: 'Từ chối' }
];

const STATUS_STYLES = {
  draft: 'bg-amber-50 text-amber-700 border-amber-200',
  pending_approval: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200'
};

const STATUS_LABELS = {
  draft: 'Đang làm',
  pending_approval: 'Chờ phê duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối'
};

const COMMON_FORM_FIELDS = [
  { key: 'applicantName', label: 'Họ và tên người làm đơn', type: 'text', required: true },
  { key: 'department', label: 'Khoa/Phòng', type: 'text', required: true },
  { key: 'contactPhone', label: 'Số điện thoại liên hệ', type: 'text', required: true },
  { key: 'requestDate', label: 'Ngày lập đơn', type: 'date', required: true }
];

const TEMPLATE_LAYOUT_MAP = {
  annual_leave: [
    ['leaveFrom', 'leaveTo'],
    ['reason'],
    ['handoverTo']
  ],
  schedule_change: [
    ['currentSchedule', 'requestedSchedule'],
    ['effectiveDate'],
    ['reason']
  ],
  business_trip: [
    ['destination'],
    ['fromDate', 'toDate'],
    ['taskContent'],
    ['estimatedCost']
  ],
  training_registration: [
    ['courseName', 'organization'],
    ['fromDate', 'toDate'],
    ['commitment']
  ]
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return date.toLocaleString('vi-VN');
};

const getDefaultCommonFormValues = (doctorProfile) => {
  const today = new Date().toISOString().slice(0, 10);
  return {
    applicantName: doctorProfile?.name || '',
    department: doctorProfile?.department || '',
    contactPhone: doctorProfile?.phone || '',
    requestDate: today
  };
};

const AdministrativeProcedures = () => {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [requests, setRequests] = useState([]);
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [templateKeyword, setTemplateKeyword] = useState('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('all');
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('');
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState(null);

  const selectedTemplate = useMemo(() => {
    return templates.find((item) => item.key === selectedTemplateKey) || null;
  }, [templates, selectedTemplateKey]);

  const filteredRequests = useMemo(() => {
    if (requestStatusFilter === 'all') return requests;
    return requests.filter((item) => item.status === requestStatusFilter);
  }, [requests, requestStatusFilter]);

  const filteredTemplates = useMemo(() => {
    const keyword = templateKeyword.trim().toLowerCase();
    return templates.filter((item) => {
      if (templateCategoryFilter !== 'all' && item.category !== templateCategoryFilter) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const title = String(item.title || '').toLowerCase();
      const description = String(item.description || '').toLowerCase();
      return title.includes(keyword) || description.includes(keyword);
    });
  }, [templates, templateKeyword, templateCategoryFilter]);

  const templateCategories = useMemo(() => {
    const categories = Array.from(new Set(templates.map((item) => item.category).filter(Boolean)));
    return categories.sort((a, b) => a.localeCompare(b));
  }, [templates]);

  const groupedTemplates = useMemo(() => {
    const grouped = {};

    filteredTemplates.forEach((template) => {
      const category = template.category || 'Khac';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(template);
    });

    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredTemplates]);

  const draftCount = useMemo(() => {
    return requests.filter((item) => item.status === 'draft').length;
  }, [requests]);

  const fillEmptyFormByTemplate = (template) => {
    const nextForm = {
      ...getDefaultCommonFormValues(doctorProfile)
    };

    (template?.fields || []).forEach((field) => {
      nextForm[field.key] = '';
    });
    setFormData(nextForm);
  };

  const loadTemplatesAndRequests = async () => {
    try {
      setLoading(true);
      const [templatesResponse, requestsResponse, profile] = await Promise.all([
        doctorAPI.getAdministrativeTemplates(),
        doctorAPI.getAdministrativeRequests('all'),
        userAPI.getProfile()
      ]);

      const templateList = Array.isArray(templatesResponse?.data) ? templatesResponse.data : [];
      const requestList = Array.isArray(requestsResponse?.data) ? requestsResponse.data : [];

      setDoctorProfile(profile || null);

      setTemplates(templateList);
      setRequests(requestList);

      if (templateList.length > 0 && !selectedTemplateKey) {
        setSelectedTemplateKey(templateList[0].key);
        const nextForm = {
          ...getDefaultCommonFormValues(profile || null)
        };
        (templateList[0].fields || []).forEach((field) => {
          nextForm[field.key] = '';
        });
        setFormData(nextForm);
      }
    } catch (error) {
      toast.error(error.message || 'Không tải được dữ liệu thủ tục hành chính');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplatesAndRequests();
  }, []);

  const handleSelectTemplate = (template) => {
    setSelectedTemplateKey(template.key);
    setEditingRequestId(null);
    fillEmptyFormByTemplate(template);
  };

  const handleSelectRequest = (request) => {
    setSelectedTemplateKey(request.templateKey);
    setEditingRequestId(request._id);
    setFormData({
      ...getDefaultCommonFormValues(doctorProfile),
      ...(request.formData || {})
    });
  };

  const handleFieldChange = (fieldKey, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldKey]: value
    }));
  };

  const handleSaveOrSubmit = async (submitNow) => {
    if (!selectedTemplate) {
      toast.error('Vui lòng chọn mẫu đơn');
      return;
    }

    try {
      setSubmitting(true);

      if (submitNow) {
        const missingCommon = COMMON_FORM_FIELDS
          .filter((field) => field.required)
          .filter((field) => {
            const value = formData[field.key];
            return value === undefined || value === null || String(value).trim() === '';
          })
          .map((field) => field.label);

        if (missingCommon.length > 0) {
          toast.error(`Vui lòng điền đầy đủ thông tin chung: ${missingCommon.join(', ')}`);
          setSubmitting(false);
          return;
        }
      }

      if (editingRequestId) {
        await doctorAPI.updateAdministrativeRequest(editingRequestId, {
          formData,
          submitNow
        });
      } else {
        await doctorAPI.createAdministrativeRequest({
          templateKey: selectedTemplate.key,
          formData,
          submitNow
        });
      }

      toast.success(submitNow ? 'Đã nộp đơn chờ phê duyệt' : 'Đã lưu đơn nháp');
      setEditingRequestId(null);
      fillEmptyFormByTemplate(selectedTemplate);
      await loadTemplatesAndRequests();
    } catch (error) {
      toast.error(error.message || 'Không thực hiện được thao tác với đơn');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <p className="text-gray-600">Đang tải thủ tục hành chính...</p>
      </div>
    );
  }

  const renderField = (field) => {
    const isTextArea = field.type === 'textarea';
    const inputClassName = 'w-full border border-gray-300 rounded-lg px-3 py-2';

    if (isTextArea) {
      return (
        <textarea
          rows={4}
          value={formData[field.key] || ''}
          onChange={(e) => handleFieldChange(field.key, e.target.value)}
          className={inputClassName}
          placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}`}
        />
      );
    }

    return (
      <input
        type={field.type || 'text'}
        value={formData[field.key] || ''}
        onChange={(e) => handleFieldChange(field.key, e.target.value)}
        className={inputClassName}
        placeholder={field.placeholder || `Nhập ${field.label.toLowerCase()}`}
      />
    );
  };

  const getTemplateFieldRows = (template) => {
    if (!template) return [];
    const layoutRows = TEMPLATE_LAYOUT_MAP[template.key];
    if (layoutRows && layoutRows.length > 0) {
      return layoutRows
        .map((rowKeys) => rowKeys
          .map((key) => template.fields.find((field) => field.key === key))
          .filter(Boolean))
        .filter((row) => row.length > 0);
    }

    return template.fields.map((field) => [field]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Thủ tục hành chính</h1>
        <p className="mt-2 text-gray-600">
          Chọn mẫu đơn, điền thông tin và nộp để chờ phê duyệt. Bạn có <span className="font-semibold text-amber-700">{draftCount}</span> đơn đang làm.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 xl:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mẫu thủ tục</h2>
          <input
            type="text"
            value={templateKeyword}
            onChange={(e) => setTemplateKeyword(e.target.value)}
            placeholder="Tìm mẫu đơn..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3"
          />
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => setTemplateCategoryFilter('all')}
              className={`px-2.5 py-1 text-xs rounded-md border ${
                templateCategoryFilter === 'all'
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              Tat ca
            </button>
            {templateCategories.map((category) => (
              <button
                key={category}
                onClick={() => setTemplateCategoryFilter(category)}
                className={`px-2.5 py-1 text-xs rounded-md border ${
                  templateCategoryFilter === category
                    ? 'border-blue-300 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
            {groupedTemplates.map(([category, items]) => (
              <div key={category}>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">{category}</p>
                <div className="space-y-2">
                  {items.map((template) => (
                    <button
                      key={template.key}
                      onClick={() => handleSelectTemplate(template)}
                      className={`w-full text-left rounded-lg border p-3 transition ${
                        selectedTemplateKey === template.key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900">{template.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {groupedTemplates.length === 0 && (
              <p className="text-sm text-gray-500">Không tìm thấy mẫu phù hợp.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingRequestId ? 'Chỉnh sửa đơn nháp' : 'Điền mẫu đơn'}
            </h2>
            {editingRequestId && (
              <span className="text-xs px-2 py-1 rounded-md border border-amber-200 bg-amber-50 text-amber-700">
                Đang chỉnh đơn nháp
              </span>
            )}
          </div>

          {selectedTemplate ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">{selectedTemplate.description}</p>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800 mb-3">Thong tin chung</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {COMMON_FORM_FIELDS.map((field) => (
                    <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-rose-600"> *</span>}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Noi dung theo mau don</p>

                {getTemplateFieldRows(selectedTemplate).map((rowFields, rowIndex) => (
                  <div
                    key={`${selectedTemplate.key}-row-${rowIndex}`}
                    className={`grid grid-cols-1 ${rowFields.length > 1 ? 'md:grid-cols-2' : ''} gap-3 mb-3`}
                  >
                    {rowFields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.label}
                          {field.required && <span className="text-rose-600"> *</span>}
                        </label>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => handleSaveOrSubmit(false)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium disabled:opacity-60"
                >
                  {submitting ? 'Đang xử lý...' : 'Lưu đơn nháp'}
                </button>
                <button
                  onClick={() => handleSaveOrSubmit(true)}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-60"
                >
                  {submitting ? 'Đang xử lý...' : 'Nộp chờ phê duyệt'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Chưa có mẫu đơn nào.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Các đơn của bạn</h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.key}
              onClick={() => setRequestStatusFilter(option.key)}
              className={`px-3 py-1.5 rounded-md text-sm border ${
                requestStatusFilter === option.key
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {filteredRequests.length === 0 ? (
          <p className="text-sm text-gray-500">Chưa có đơn nào trong nhóm này.</p>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <button
                key={request._id}
                onClick={() => handleSelectRequest(request)}
                className="w-full text-left rounded-lg border border-gray-200 p-4 hover:border-gray-300"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">{request.templateTitle}</p>
                  <span className={`text-xs px-2 py-1 rounded-md border ${STATUS_STYLES[request.status] || 'border-gray-200 bg-gray-50 text-gray-700'}`}>
                    {STATUS_LABELS[request.status] || request.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Cập nhật: {formatDateTime(request.updatedAt)}</p>
                <p className="text-xs text-gray-500">Nộp: {formatDateTime(request.submittedAt)}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdministrativeProcedures;
