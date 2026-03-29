import AdministrativeRequest from '../models/AdministrativeRequest.js';

const ADMINISTRATIVE_TEMPLATES = [
  {
    key: 'annual_leave',
    title: 'Đơn xin nghỉ phép',
    description: 'Dùng để đăng ký nghỉ phép theo quy định.',
    fields: [
      { key: 'leaveFrom', label: 'Từ ngày', type: 'date', required: true },
      { key: 'leaveTo', label: 'Đến ngày', type: 'date', required: true },
      { key: 'reason', label: 'Lý do', type: 'textarea', required: true },
      { key: 'handoverTo', label: 'Bàn giao cho', type: 'text', required: true }
    ]
  },
  {
    key: 'schedule_change',
    title: 'Đơn đề nghị đổi lịch làm việc',
    description: 'Dùng khi cần đổi ca hoặc điều chỉnh lịch trực.',
    fields: [
      { key: 'currentSchedule', label: 'Lịch hiện tại', type: 'text', required: true },
      { key: 'requestedSchedule', label: 'Lịch đề xuất', type: 'text', required: true },
      { key: 'effectiveDate', label: 'Ngày áp dụng', type: 'date', required: true },
      { key: 'reason', label: 'Lý do', type: 'textarea', required: true }
    ]
  },
  {
    key: 'certificate_request',
    title: 'Đơn xin xác nhận công tác',
    description: 'Yêu cầu xác nhận quá trình công tác phục vụ hồ sơ cá nhân.',
    fields: [
      { key: 'purpose', label: 'Mục đích sử dụng', type: 'text', required: true },
      { key: 'recipient', label: 'Nơi nhận', type: 'text', required: true },
      { key: 'note', label: 'Ghi chú thêm', type: 'textarea', required: false }
    ]
  },
  {
    key: 'overtime_registration',
    title: 'Đơn đăng ký làm thêm giờ',
    description: 'Đăng ký lịch làm thêm ngoài giờ hành chính.',
    fields: [
      { key: 'overtimeDate', label: 'Ngày làm thêm', type: 'date', required: true },
      { key: 'timeRange', label: 'Khung giờ làm thêm', type: 'text', required: true },
      { key: 'departmentSupport', label: 'Khoa/đơn vị hỗ trợ', type: 'text', required: true },
      { key: 'reason', label: 'Lý do', type: 'textarea', required: true }
    ]
  },
  {
    key: 'equipment_request',
    title: 'Phiếu đề nghị cấp thiết bị y tế',
    description: 'Đề xuất cấp mới hoặc bổ sung thiết bị phục vụ khám chữa bệnh.',
    fields: [
      { key: 'equipmentName', label: 'Tên thiết bị', type: 'text', required: true },
      { key: 'quantity', label: 'Số lượng', type: 'number', required: true },
      { key: 'purpose', label: 'Mục đích sử dụng', type: 'textarea', required: true },
      { key: 'priorityLevel', label: 'Mức độ ưu tiên', type: 'text', required: true }
    ]
  },
  {
    key: 'training_registration',
    title: 'Đơn đăng ký đào tạo/chuyên đề',
    description: 'Đăng ký tham gia đào tạo chuyên môn, hội thảo hoặc CME.',
    fields: [
      { key: 'courseName', label: 'Tên khóa/chuyên đề', type: 'text', required: true },
      { key: 'organization', label: 'Đơn vị tổ chức', type: 'text', required: true },
      { key: 'fromDate', label: 'Từ ngày', type: 'date', required: true },
      { key: 'toDate', label: 'Đến ngày', type: 'date', required: true },
      { key: 'commitment', label: 'Cam kết sau đào tạo', type: 'textarea', required: false }
    ]
  },
  {
    key: 'business_trip',
    title: 'Đơn đề nghị công tác',
    description: 'Xin phê duyệt đi công tác/hội chẩn ngoài bệnh viện.',
    fields: [
      { key: 'destination', label: 'Địa điểm công tác', type: 'text', required: true },
      { key: 'fromDate', label: 'Từ ngày', type: 'date', required: true },
      { key: 'toDate', label: 'Đến ngày', type: 'date', required: true },
      { key: 'taskContent', label: 'Nội dung công tác', type: 'textarea', required: true },
      { key: 'estimatedCost', label: 'Chi phí dự kiến', type: 'number', required: false }
    ]
  },
  {
    key: 'shift_swap',
    title: 'Đơn xin đổi ca trực',
    description: 'Đề nghị đổi ca trực với bác sĩ khác.',
    fields: [
      { key: 'currentShift', label: 'Ca trực hiện tại', type: 'text', required: true },
      { key: 'desiredShift', label: 'Ca trực muốn đổi', type: 'text', required: true },
      { key: 'swapWithDoctor', label: 'Bác sĩ đổi cùng', type: 'text', required: true },
      { key: 'reason', label: 'Lý do đổi ca', type: 'textarea', required: true }
    ]
  },
  {
    key: 'document_certification',
    title: 'Đơn đề nghị sao y/chứng thực hồ sơ',
    description: 'Yêu cầu sao y, chứng thực hồ sơ chuyên môn hoặc giấy tờ công tác.',
    fields: [
      { key: 'documentType', label: 'Loại hồ sơ', type: 'text', required: true },
      { key: 'copies', label: 'Số bản', type: 'number', required: true },
      { key: 'usagePurpose', label: 'Mục đích sử dụng', type: 'text', required: true },
      { key: 'note', label: 'Ghi chú', type: 'textarea', required: false }
    ]
  },
  {
    key: 'payment_advance',
    title: 'Đơn xin tạm ứng công tác phí',
    description: 'Xin tạm ứng chi phí phục vụ công tác hoặc đào tạo.',
    fields: [
      { key: 'purpose', label: 'Mục đích tạm ứng', type: 'text', required: true },
      { key: 'amount', label: 'Số tiền tạm ứng (VND)', type: 'number', required: true },
      { key: 'expectedSettlementDate', label: 'Ngày dự kiến quyết toán', type: 'date', required: true },
      { key: 'note', label: 'Ghi chú', type: 'textarea', required: false }
    ]
  },
  {
    key: 'expense_reimbursement',
    title: 'Đơn đề nghị thanh toán chi phí',
    description: 'Đề nghị hoàn/chi trả các khoản chi phí phát sinh hợp lệ.',
    fields: [
      { key: 'expenseType', label: 'Loại chi phí', type: 'text', required: true },
      { key: 'expenseDate', label: 'Ngày chi', type: 'date', required: true },
      { key: 'amount', label: 'Số tiền (VND)', type: 'number', required: true },
      { key: 'description', label: 'Diễn giải', type: 'textarea', required: true }
    ]
  },
  {
    key: 'asset_handover',
    title: 'Biên bản bàn giao tài sản',
    description: 'Xác nhận bàn giao/nhận bàn giao tài sản, thiết bị y tế.',
    fields: [
      { key: 'assetName', label: 'Tên tài sản', type: 'text', required: true },
      { key: 'assetCode', label: 'Mã tài sản', type: 'text', required: true },
      { key: 'handoverDate', label: 'Ngày bàn giao', type: 'date', required: true },
      { key: 'receiver', label: 'Người nhận', type: 'text', required: true },
      { key: 'condition', label: 'Tình trạng tài sản', type: 'textarea', required: true }
    ]
  },
  {
    key: 'medical_supply_request',
    title: 'Phiếu đề nghị cấp vật tư y tế',
    description: 'Đề nghị cấp bổ sung vật tư tiêu hao cho khoa/phòng.',
    fields: [
      { key: 'supplyName', label: 'Tên vật tư', type: 'text', required: true },
      { key: 'unit', label: 'Đơn vị tính', type: 'text', required: true },
      { key: 'quantity', label: 'Số lượng', type: 'number', required: true },
      { key: 'reason', label: 'Lý do cấp', type: 'textarea', required: true }
    ]
  },
  {
    key: 'repair_request',
    title: 'Phiếu yêu cầu sửa chữa thiết bị',
    description: 'Yêu cầu sửa chữa hoặc bảo trì thiết bị hỏng.',
    fields: [
      { key: 'deviceName', label: 'Tên thiết bị', type: 'text', required: true },
      { key: 'deviceCode', label: 'Mã thiết bị', type: 'text', required: false },
      { key: 'issueDescription', label: 'Mô tả lỗi', type: 'textarea', required: true },
      { key: 'impactLevel', label: 'Mức ảnh hưởng', type: 'text', required: true }
    ]
  },
  {
    key: 'it_support_request',
    title: 'Phiếu yêu cầu hỗ trợ CNTT',
    description: 'Yêu cầu hỗ trợ phần mềm, tài khoản hoặc máy tính.',
    fields: [
      { key: 'issueType', label: 'Loại sự cố', type: 'text', required: true },
      { key: 'device', label: 'Thiết bị/hệ thống liên quan', type: 'text', required: true },
      { key: 'issueDetail', label: 'Chi tiết sự cố', type: 'textarea', required: true },
      { key: 'urgentLevel', label: 'Mức độ khẩn', type: 'text', required: true }
    ]
  },
  {
    key: 'password_reset_request',
    title: 'Đơn yêu cầu cấp lại tài khoản/mật khẩu',
    description: 'Dùng khi quên mật khẩu hoặc khóa tài khoản hệ thống.',
    fields: [
      { key: 'systemName', label: 'Hệ thống sử dụng', type: 'text', required: true },
      { key: 'accountName', label: 'Tên tài khoản', type: 'text', required: true },
      { key: 'reason', label: 'Lý do yêu cầu', type: 'textarea', required: true }
    ]
  },
  {
    key: 'internal_transfer',
    title: 'Đơn đề nghị điều chuyển nội bộ',
    description: 'Đề nghị điều chuyển tạm thời hoặc chính thức giữa khoa/phòng.',
    fields: [
      { key: 'currentDepartment', label: 'Khoa/phòng hiện tại', type: 'text', required: true },
      { key: 'targetDepartment', label: 'Khoa/phòng đề nghị', type: 'text', required: true },
      { key: 'effectiveDate', label: 'Ngày hiệu lực', type: 'date', required: true },
      { key: 'reason', label: 'Lý do điều chuyển', type: 'textarea', required: true }
    ]
  },
  {
    key: 'resignation_notice',
    title: 'Đơn xin nghỉ việc',
    description: 'Thông báo nghỉ việc theo quy định nội bộ.',
    fields: [
      { key: 'lastWorkingDate', label: 'Ngày làm việc cuối', type: 'date', required: true },
      { key: 'reason', label: 'Lý do nghỉ việc', type: 'textarea', required: true },
      { key: 'handoverPlan', label: 'Kế hoạch bàn giao', type: 'textarea', required: true }
    ]
  },
  {
    key: 'maternity_leave',
    title: 'Đơn đề nghị nghỉ thai sản',
    description: 'Đề nghị nghỉ thai sản theo chế độ lao động hiện hành.',
    fields: [
      { key: 'startDate', label: 'Ngày bắt đầu nghỉ', type: 'date', required: true },
      { key: 'expectedReturnDate', label: 'Ngày dự kiến quay lại', type: 'date', required: true },
      { key: 'medicalDocument', label: 'Thông tin giấy tờ y tế', type: 'textarea', required: true },
      { key: 'handoverTo', label: 'Người nhận bàn giao', type: 'text', required: true }
    ]
  },
  {
    key: 'conference_attendance',
    title: 'Đơn tham dự hội nghị/hội thảo',
    description: 'Xin phép tham dự hội nghị khoa học, hội thảo chuyên môn.',
    fields: [
      { key: 'eventName', label: 'Tên hội nghị/hội thảo', type: 'text', required: true },
      { key: 'organizer', label: 'Đơn vị tổ chức', type: 'text', required: true },
      { key: 'fromDate', label: 'Từ ngày', type: 'date', required: true },
      { key: 'toDate', label: 'Đến ngày', type: 'date', required: true },
      { key: 'benefit', label: 'Lợi ích cho công việc', type: 'textarea', required: true }
    ]
  },
  {
    key: 'research_approval',
    title: 'Đơn xin phê duyệt nghiên cứu khoa học',
    description: 'Đề nghị phê duyệt đề tài nghiên cứu/chuyên đề.',
    fields: [
      { key: 'topicName', label: 'Tên đề tài', type: 'text', required: true },
      { key: 'duration', label: 'Thời gian thực hiện', type: 'text', required: true },
      { key: 'teamMembers', label: 'Thành viên tham gia', type: 'textarea', required: true },
      { key: 'expectedOutcome', label: 'Kết quả dự kiến', type: 'textarea', required: true }
    ]
  },
  {
    key: 'intern_supervision',
    title: 'Đơn đăng ký hướng dẫn thực tập',
    description: 'Đăng ký hướng dẫn bác sĩ nội trú/sinh viên thực tập.',
    fields: [
      { key: 'programName', label: 'Chương trình thực tập', type: 'text', required: true },
      { key: 'internCount', label: 'Số lượng thực tập sinh', type: 'number', required: true },
      { key: 'period', label: 'Thời gian hướng dẫn', type: 'text', required: true },
      { key: 'plan', label: 'Kế hoạch hướng dẫn', type: 'textarea', required: true }
    ]
  },
  {
    key: 'quality_incident_report',
    title: 'Biểu mẫu báo cáo sự cố chất lượng',
    description: 'Báo cáo sự cố chuyên môn/chất lượng để xử lý nội bộ.',
    fields: [
      { key: 'incidentDate', label: 'Ngày xảy ra', type: 'date', required: true },
      { key: 'incidentLocation', label: 'Địa điểm', type: 'text', required: true },
      { key: 'incidentDetail', label: 'Nội dung sự cố', type: 'textarea', required: true },
      { key: 'immediateAction', label: 'Biện pháp xử lý ban đầu', type: 'textarea', required: true }
    ]
  },
  {
    key: 'professional_license_update',
    title: 'Đơn cập nhật chứng chỉ hành nghề',
    description: 'Đề nghị cập nhật, gia hạn hoặc điều chỉnh thông tin chứng chỉ hành nghề.',
    fields: [
      { key: 'licenseNumber', label: 'Số chứng chỉ', type: 'text', required: true },
      { key: 'updateType', label: 'Loại cập nhật', type: 'text', required: true },
      { key: 'effectiveDate', label: 'Ngày hiệu lực', type: 'date', required: true },
      { key: 'note', label: 'Ghi chú', type: 'textarea', required: false }
    ]
  }
];

const TEMPLATE_CATEGORY_MAP = {
  annual_leave: 'Nghi phep',
  maternity_leave: 'Nghi phep',
  schedule_change: 'Nhan su',
  shift_swap: 'Nhan su',
  internal_transfer: 'Nhan su',
  resignation_notice: 'Nhan su',
  certificate_request: 'Hanh chinh',
  document_certification: 'Hanh chinh',
  password_reset_request: 'Hanh chinh',
  overtime_registration: 'Nhan su',
  equipment_request: 'Thiet bi',
  medical_supply_request: 'Thiet bi',
  repair_request: 'Thiet bi',
  asset_handover: 'Thiet bi',
  payment_advance: 'Tai chinh',
  expense_reimbursement: 'Tai chinh',
  training_registration: 'Dao tao',
  conference_attendance: 'Dao tao',
  intern_supervision: 'Dao tao',
  business_trip: 'Cong tac',
  research_approval: 'Chuyen mon',
  quality_incident_report: 'Chuyen mon',
  professional_license_update: 'Chuyen mon',
  it_support_request: 'Cong nghe'
};

const withTemplateCategory = (template) => ({
  ...template,
  category: TEMPLATE_CATEGORY_MAP[template.key] || 'Khac'
});

const getTemplateByKey = (templateKey) => {
  return ADMINISTRATIVE_TEMPLATES.find((item) => item.key === templateKey);
};

const validateRequiredFields = (template, formData) => {
  const missingFields = template.fields
    .filter((field) => field.required)
    .filter((field) => {
      const value = formData?.[field.key];
      return value === undefined || value === null || String(value).trim() === '';
    })
    .map((field) => field.label);

  return missingFields;
};

export const getAdministrativeTemplates = async (req, res) => {
  return res.status(200).json({
    message: 'Lấy danh sách mẫu thủ tục thành công',
    data: ADMINISTRATIVE_TEMPLATES.map(withTemplateCategory)
  });
};

export const getMyAdministrativeRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const query = {
      doctorId: req.user._id
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    const requests = await AdministrativeRequest.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    return res.status(200).json({
      message: 'Lấy danh sách đơn thành công',
      data: requests
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách đơn hành chính:', error);
    return res.status(500).json({
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      error: error.message
    });
  }
};

export const createAdministrativeRequest = async (req, res) => {
  try {
    const { templateKey, formData, submitNow } = req.body;
    const template = getTemplateByKey(templateKey);

    if (!template) {
      return res.status(400).json({ message: 'Mẫu đơn không hợp lệ' });
    }

    const missingFields = validateRequiredFields(template, formData || {});
    if (submitNow && missingFields.length > 0) {
      return res.status(400).json({
        message: `Vui lòng điền đầy đủ: ${missingFields.join(', ')}`
      });
    }

    const request = await AdministrativeRequest.create({
      doctorId: req.user._id,
      templateKey: template.key,
      templateTitle: template.title,
      formData: formData || {},
      status: submitNow ? 'pending_approval' : 'draft',
      submittedAt: submitNow ? new Date() : null
    });

    return res.status(201).json({
      message: submitNow ? 'Đã nộp đơn chờ phê duyệt' : 'Đã lưu đơn nháp',
      data: request
    });
  } catch (error) {
    console.error('Lỗi tạo đơn hành chính:', error);
    return res.status(500).json({
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      error: error.message
    });
  }
};

export const updateAdministrativeRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { formData, submitNow } = req.body;

    const request = await AdministrativeRequest.findOne({
      _id: requestId,
      doctorId: req.user._id
    });

    if (!request) {
      return res.status(404).json({ message: 'Không tìm thấy đơn cần cập nhật' });
    }

    if (request.status !== 'draft') {
      return res.status(400).json({ message: 'Chỉ đơn nháp mới được chỉnh sửa' });
    }

    const template = getTemplateByKey(request.templateKey);
    const mergedFormData = {
      ...(request.formData || {}),
      ...(formData || {})
    };

    const missingFields = validateRequiredFields(template, mergedFormData);
    if (submitNow && missingFields.length > 0) {
      return res.status(400).json({
        message: `Vui lòng điền đầy đủ: ${missingFields.join(', ')}`
      });
    }

    request.formData = mergedFormData;
    request.status = submitNow ? 'pending_approval' : 'draft';
    if (submitNow) {
      request.submittedAt = new Date();
    }

    await request.save();

    return res.status(200).json({
      message: submitNow ? 'Đã nộp đơn chờ phê duyệt' : 'Đã cập nhật đơn nháp',
      data: request
    });
  } catch (error) {
    console.error('Lỗi cập nhật đơn hành chính:', error);
    return res.status(500).json({
      message: 'Lỗi máy chủ, vui lòng thử lại sau',
      error: error.message
    });
  }
};
