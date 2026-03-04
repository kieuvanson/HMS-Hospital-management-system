import React, { useState, useEffect } from 'react';
import { Edit2, Loader, X, Camera } from 'lucide-react';
import Header from '../../components/Doctor/Header';
import api from '../../services/api';

const BACKEND_URL = 'http://localhost:5000';

// Hàm chuyển đổi avatar URL
const getAvatarUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${BACKEND_URL}${url}`;
  return url;
};

const DoctorProfile = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    fetchDoctorProfile();
  }, []);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy hồ sơ bác sĩ từ backend (sẽ lấy profile của user hiện tại)
      const response = await api.get(`/doctor/profile/current`);
      
      if (response.data?.data) {
        setDoctorData(response.data.data);
      }
    } catch (err) {
      console.error("Lỗi lấy hồ sơ bác sĩ:", err);
      setError(err.response?.data?.message || "Không thể tải hồ sơ bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setFormData({
      name: doctorData?.userId?.name || '',
      dateOfBirth: doctorData?.userId?.dateOfBirth ? new Date(doctorData.userId.dateOfBirth).toISOString().split('T')[0] : '',
      gender: doctorData?.userId?.gender || 'male',
      phone: doctorData?.userId?.phone || '',
      email: doctorData?.userId?.email || '',
      address: doctorData?.userId?.address || '',
      experienceYears: doctorData?.experienceYears || 0,
      licenseNumber: doctorData?.licenseNumber || '',
      consultationFee: doctorData?.consultationFee || 0,
      bio: doctorData?.bio || ''
    });
    setAvatarPreview(doctorData?.userId?.avatarUrl || null);
    setAvatarFile(null);
    setIsEditMode(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Tạo FormData để gửi file
      const updateFormData = new FormData();
      updateFormData.append('name', formData.name);
      updateFormData.append('dateOfBirth', formData.dateOfBirth);
      updateFormData.append('gender', formData.gender);
      updateFormData.append('phone', formData.phone);
      updateFormData.append('address', formData.address);
      
      // Thêm file avatar nếu có
      if (avatarFile) {
        updateFormData.append('avatar', avatarFile);
      }

      // Cập nhật thông tin user (kèm avatar)
      await api.put(`/user/profile`, updateFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Cập nhật thông tin bác sĩ
      await api.put(`/doctor/profile`, {
        experienceYears: parseInt(formData.experienceYears),
        licenseNumber: formData.licenseNumber,
        consultationFee: parseInt(formData.consultationFee),
        bio: formData.bio
      });

      // Tái tải dữ liệu
      await fetchDoctorProfile();
      
      // Cập nhật localStorage với avatar URL mới
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (doctorData?.userId) {
        currentUser.avatarUrl = doctorData.userId.avatarUrl;
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
      
      // Trigger event để các component khác (Header, Sidebar) cập nhật avatar
      window.dispatchEvent(new Event('profileUpdated'));
      
      setIsEditMode(false);
      setAvatarFile(null);
      alert('Cập nhật hồ sơ thành công!');
    } catch (err) {
      console.error("Lỗi cập nhật hồ sơ:", err);
      alert(err.response?.data?.message || 'Lỗi cập nhật hồ sơ');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader className="animate-spin h-8 w-8 text-blue-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  const userData = doctorData?.userId;
  const specialty = doctorData?.specialtyId;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="mt-16 p-6 bg-gray-100 flex flex-col gap-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 bg-blue-500 text-white flex items-center justify-center rounded-lg text-3xl font-bold overflow-hidden">
              {userData?.avatarUrl ? (
                <img src={getAvatarUrl(userData.avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                userData?.name?.substring(0, 2).toUpperCase() || 'BS'
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">BS. {userData?.name || 'N/A'}</h2>
              <p className="text-lg text-gray-600">
                Bác sĩ chuyên khoa {specialty?.name || 'N/A'}
              </p>
            </div>
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Edit2 className="h-5 w-5" />
              Chỉnh sửa
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-xl font-semibold">Thông tin cá nhân</h3>
              <ul className="text-lg text-gray-600">
                <li>Họ và tên: {userData?.name || 'N/A'}</li>
                <li>Ngày sinh: {userData?.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}</li>
                <li>Giới tính: {userData?.gender === 'male' ? 'Nam' : userData?.gender === 'female' ? 'Nữ' : 'N/A'}</li>
                <li>Số điện thoại: {userData?.phone || 'N/A'}</li>
                <li>Email: {userData?.email || 'N/A'}</li>
                <li>Địa chỉ: {userData?.address || 'N/A'}</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Thông tin chuyên môn</h3>
              <ul className="text-lg text-gray-600">
                <li>Chuyên khoa: {specialty?.name || 'N/A'}</li>
                <li>Năm kinh nghiệm: {doctorData?.experienceYears || 0} năm</li>
                <li>Số chứng chỉ: {doctorData?.licenseNumber || 'N/A'}</li>
                <li>
                  Trình độ: {doctorData?.education?.[0]?.degree || 'N/A'} -{' '}
                  {doctorData?.education?.[0]?.university || 'N/A'}
                </li>
                <li>Năm tốt nghiệp: {doctorData?.education?.[0]?.graduationYear || 'N/A'}</li>
                <li>Phí khám: {doctorData?.consultationFee || 0} VNĐ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b p-6">
              <h2 className="text-2xl font-bold">Chỉnh sửa hồ sơ</h2>
              <button
                onClick={() => setIsEditMode(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Avatar Upload */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Ảnh đại diện</h3>
                <div className="flex items-center gap-6">
                  <div className="relative w-32 h-32 bg-blue-500 text-white flex items-center justify-center rounded-lg text-3xl font-bold overflow-hidden">
                    {avatarPreview ? (
                      <img src={getAvatarUrl(avatarPreview)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      userData?.name?.substring(0, 2).toUpperCase() || 'BS'
                    )}
                    <label htmlFor="avatar-input" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition">
                      <Camera className="h-6 w-6 text-white" />
                    </label>
                  </div>
                  <div>
                    <input
                      id="avatar-input"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <label htmlFor="avatar-input" className="block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer text-center">
                      Chọn ảnh
                    </label>
                    <p className="text-sm text-gray-500 mt-2">JPG, PNG (tối đa 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Thông tin cá nhân */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Thông tin cá nhân</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Thông tin chuyên môn */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Thông tin chuyên môn</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Năm kinh nghiệm</label>
                    <input
                      type="number"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số chứng chỉ</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phí khám (VNĐ)</label>
                    <input
                      type="number"
                      name="consultationFee"
                      value={formData.consultationFee}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu</label>
                    <input
                      type="text"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-6 flex gap-4 justify-end">
              <button
                onClick={() => setIsEditMode(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving && <Loader className="h-4 w-4 animate-spin" />}
                {isSaving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;