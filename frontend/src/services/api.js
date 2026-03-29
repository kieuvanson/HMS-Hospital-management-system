import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies/sessions
});

// Đính kèm access token cho mọi request nếu có
api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
  
  if (accessToken && accessToken.trim()) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post('/auth/refresh_token');
        const { accessToken } = res.data;
        localStorage.setItem('accessToken', accessToken);
        api.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('accessToken');
        window.location.href = '/auth/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    const serverMessage = error?.response?.data?.message;
    if (serverMessage) {
      error.message = serverMessage;
    }
    return Promise.reject(error);
  }
);

export const userAPI = {
  getProfile: async () => {
    const { data } = await api.get('/user/profile');
    return data.user;
  },
  updateProfile: async (payload) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'avatarFile' && value) {
        formData.append('avatar', value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    const { data } = await api.put('/user/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data.user;
  },
};

export const authAPI = {
  signUp: async (userData) => {
    const normalizedEmail = String(userData.email || '').trim().toLowerCase();
    const normalizedName = String(userData.fullName || '').trim();

    const { data } = await api.post('/auth/Sign_up', {
      email: normalizedEmail,
      password: userData.password,
      name: normalizedName,
    });
    return data;
  },

  signIn: async (credentials) => {
    const { data } = await api.post('/auth/Sign_in', {
      email: credentials.email,
      password: credentials.password,
    });
    return data;
  },

  createDoctorAccount: async (doctorData) => {
    const { data } = await api.post('/auth/admin/create-doctor', {
      name: doctorData.name,
      email: doctorData.email,
      password: doctorData.password,
      age: doctorData.age,
      gender: doctorData.gender,
      specialty: doctorData.specialty,
      department: doctorData.department,
      phone: doctorData.phone,
    });
    return data;
  },
};

export const medicalAPI = {
  createRecord: async (payload) => {
    const { data } = await api.post('/medical', payload);
    return data;
  },
};

export const specialtyAPI = {
  getAll: async () => {
    const { data } = await api.get('/specialty');
    return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
  }
};

export const doctorAPI = {
  getBySpecialty: async (specialtyId) => {
    const { data } = await api.get(`/doctor/by-specialty?specialtyId=${specialtyId}`);
    return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
  },

  // Lấy danh sách bệnh nhân của bác sĩ
  getPatients: async (params) => {
    const { data } = await api.get('/doctor/patients', { params });
    return Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
  },

  getWorkSchedule: async () => {
    const { data } = await api.get('/doctor/work-schedule');
    return data;
  },

  updateWorkSchedule: async (payload) => {
    const { data } = await api.put('/doctor/work-schedule', payload);
    return data;
  },

  getMonthlyLeaves: async (month) => {
    const { data } = await api.get('/doctor/monthly-leaves', {
      params: { month }
    });
    return data;
  },

  registerMonthlyLeave: async (payload) => {
    const { data } = await api.post('/doctor/monthly-leaves', payload);
    return data;
  },

  deleteMonthlyLeave: async (leaveId) => {
    const { data } = await api.delete(`/doctor/monthly-leaves/${leaveId}`);
    return data;
  },

  getWorkCalendar: async (month) => {
    const { data } = await api.get('/doctor/work-calendar', {
      params: { month }
    });
    return data;
  },

  getSalaryOverview: async (month) => {
    const { data } = await api.get('/doctor/salary-overview', {
      params: { month }
    });
    return data;
  },

  getYearlySalaryOverview: async (year) => {
    const { data } = await api.get('/doctor/salary-overview-yearly', {
      params: { year }
    });
    return data;
  },

  updateSalaryAccount: async (payload) => {
    const { data } = await api.put('/doctor/salary-account', payload);
    return data;
  },

  getAdministrativeTemplates: async () => {
    const { data } = await api.get('/doctor/administrative-templates');
    return data;
  },

  getAdministrativeRequests: async (status = 'all') => {
    const { data } = await api.get('/doctor/administrative-requests', {
      params: { status }
    });
    return data;
  },

  createAdministrativeRequest: async (payload) => {
    const { data } = await api.post('/doctor/administrative-requests', payload);
    return data;
  },

  updateAdministrativeRequest: async (requestId, payload) => {
    const { data } = await api.put(`/doctor/administrative-requests/${requestId}`, payload);
    return data;
  }
};

export const appointmentAPI = {
  // API tương thích cho form đặt lịch hiện tại (trả cả message + data)
  bookAppointment: async (payload) => {
    const { data } = await api.post('/appointment/book', payload);
    return data;
  },

  // Lấy danh sách giờ đã được đặt của bác sĩ theo ngày
  getByDoctorAndDate: async (doctorProfileId, date) => {
    const { data } = await api.get('/appointment/available-slots', {
      params: { doctorProfileId, date },
    });
    return data;
  },

  // Lấy lịch hẹn của bác sĩ
  getAppointmentsByDoctor: async (params) => {
    const { data } = await api.get('/appointment/my-appointments', { params });
    return Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
  },

  // Lấy lịch hẹn của bệnh nhân cụ thể
  getAppointmentsByPatient: async (patientId) => {
    const { data } = await api.get(`/appointment/patient/${patientId}`);
    return Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
  },

  // Lấy lịch hẹn của bệnh nhân
  getPatientAppointments: async (params) => {
    const { data } = await api.get('/appointment/list', { params });
    return Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
  },

  // Lấy chi tiết lịch hẹn
  getAppointmentById: async (appointmentId) => {
    const { data } = await api.get(`/appointment/${appointmentId}`);
    return data.data || data;
  },

  // Đặt lịch hẹn mới
  createAppointment: async (payload) => {
    const { data } = await api.post('/appointment/book', payload);
    return data.data || data;
  },

  // Cập nhật trạng thái lịch hẹn
  updateAppointmentStatus: async (appointmentId, status) => {
    const { data } = await api.put(`/appointment/${appointmentId}`, { status });
    return data.data || data;
  },

  // Hủy lịch hẹn
  cancelAppointment: async (appointmentId) => {
    const { data } = await api.delete(`/appointment/${appointmentId}`);
    return data.data || data;
  },

  // ===== EXAMINATION APIs =====
  // Lấy danh sách khám hôm nay (confirmed + in_progress + completed)
  getTodayExaminations: async (params) => {
    const { data } = await api.get('/appointment/examinations/today', { params });
    return data; // { data: [...], stats: { waiting, inProgress, completed } }
  },

  // Bắt đầu khám (confirmed → in_progress)
  startExamination: async (appointmentId) => {
    const { data } = await api.put(`/appointment/${appointmentId}/start`);
    return data;
  },

  // Hoàn thành khám (in_progress → completed) + tạo MedicalRecord
  completeExamination: async (appointmentId, payload) => {
    const { data } = await api.put(`/appointment/${appointmentId}/complete`, payload);
    return data;
  },

  // Chi tiết appointment kèm lịch sử khám
  getExaminationDetail: async (appointmentId) => {
    const { data } = await api.get(`/appointment/${appointmentId}/detail`);
    return data; // { data: appointment, history: [...] }
  },

  // Cập nhật hồ sơ khám bệnh đã hoàn thành
  updateMedicalRecord: async (appointmentId, payload) => {
    const { data } = await api.put(`/appointment/${appointmentId}/medical-record`, payload);
    return data;
  },
};

export const prescriptionAPI = {
  // Lấy danh sách appointment hoàn thành để kê đơn
  getCompletedAppointments: async () => {
    const { data } = await api.get('/prescription/doctor/completed-appointments');
    return Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
  },

  // Lấy danh sách đơn thuốc của bác sĩ
  getDoctorPrescriptions: async (params) => {
    const { data } = await api.get('/prescription/doctor/prescriptions', { params });
    return Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
  },

  // Tạo đơn thuốc mới
  createPrescription: async (payload) => {
    const { data } = await api.post('/prescription/doctor/create', payload);
    return data.data || data;
  },

  // Lấy chi tiết đơn thuốc
  getPrescriptionById: async (prescriptionId) => {
    const { data } = await api.get(`/prescription/${prescriptionId}`);
    return data.data || data;
  },

  // Cập nhật đơn thuốc
  updatePrescription: async (prescriptionId, payload) => {
    const { data } = await api.put(`/prescription/${prescriptionId}`, payload);
    return data.data || data;
  },

  // Xóa đơn thuốc
  deletePrescription: async (prescriptionId) => {
    const { data } = await api.delete(`/prescription/${prescriptionId}`);
    return data.data || data;
  },

  // Lấy danh sách đơn thuốc của bệnh nhân
  getPatientPrescriptions: async () => {
    const { data } = await api.get('/prescription/patient/my-prescriptions');
    return Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
  }
};

export const departmentAPI = {
  // Lấy danh sách tất cả phòng/khoa
  getAll: async () => {
    const { data } = await api.get('/department');
    return Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []);
  },

  // Lấy chi tiết một phòng/khoa
  getById: async (departmentId) => {
    const { data } = await api.get(`/department/${departmentId}`);
    return data.data || data;
  },

  // Tạo phòng/khoa mới
  create: async (payload) => {
    const { data } = await api.post('/department', payload);
    return data.data || data;
  },

  // Cập nhật phòng/khoa
  update: async (departmentId, payload) => {
    const { data } = await api.put(`/department/${departmentId}`, payload);
    return data.data || data;
  },

  // Xóa phòng/khoa
  delete: async (departmentId) => {
    const { data } = await api.delete(`/department/${departmentId}`);
    return data.data || data;
  }

};


export default api;