import React, { useState, useEffect } from 'react';
import { userAPI, toBackendAssetUrl } from '../../services/api';
import { Pencil, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  });
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    cccd: user.cccd || '',
    gender: user.gender || '',
    address: user.address || '',
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
    avatarUrl: user.avatarUrl || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();
  const [avatarFile, setAvatarFile] = useState(null);
  const [showAvatarEdit, setShowAvatarEdit] = useState(false);

  useEffect(() => {
    if (message) {
      setShowMessage(true);
      const timer = setTimeout(() => setShowMessage(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setEditMode(true);
    setMessage('');
    setShowAvatarEdit(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      cccd: user.cccd || '',
      gender: user.gender || '',
      address: user.address || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
      avatarUrl: user.avatarUrl || '',
    });
    setMessage('');
    setAvatarFile(null);
    setShowAvatarEdit(false);
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      // Hiển thị ảnh tạm để xem trước khi lưu
      setForm(f => ({ ...f, avatarUrl: URL.createObjectURL(e.target.files[0]) }));
    }
  };

  const handleAvatarEditClick = () => {
    document.getElementById('avatarInput').click();
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      let dataToSend;
      let isFormData = false;
      if (avatarFile) {
        dataToSend = new FormData();
        dataToSend.append('avatar', avatarFile); // Đúng tên trường backend yêu cầu
        Object.entries(form).forEach(([key, value]) => {
          if (key !== 'avatarUrl') dataToSend.append(key, value);
        });
        isFormData = true;
      } else {
        dataToSend = { ...form };
      }
      const updated = await userAPI.updateProfile(dataToSend, isFormData);
      setUser(updated);
      setForm(f => ({ ...f, avatarUrl: updated.avatarUrl || '' }));
      localStorage.setItem('user', JSON.stringify(updated));
      setEditMode(false);
      setMessage('Cập nhật thành công!');
      setAvatarFile(null);
      setShowAvatarEdit(false);
      window.location.reload(); // Reload để header/avatar cập nhật ngay
    } catch (err) {
      setMessage(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  // Helper để lấy link avatar đầy đủ
  // Ưu tiên user.avatarUrl nếu không ở chế độ edit hoặc không có avatarFile
  const getAvatarSrc = () => {
    if (editMode && avatarFile && form.avatarUrl && form.avatarUrl.startsWith('blob:')) {
      return form.avatarUrl;
    }
    // Nếu user.avatarUrl là link thực từ backend
    if (user.avatarUrl) {
      return toBackendAssetUrl(user.avatarUrl);
    }
    return '';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
      {/* Nút quay về */}
      <button
        className="flex items-center gap-2 text-primary-700 hover:text-primary-900 font-medium mb-2 transition-colors"
        onClick={() => navigate('/patient/home')}
      >
        <ArrowLeft className="w-5 h-5" />
        Quay về
      </button>
      <h1 className="text-2xl font-semibold text-secondary-900 mb-4">Thông tin cá nhân</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6 relative">
        {/* Nút chỉnh sửa ở góc phải */}
        <div className="absolute top-4 right-4 z-10">
          {!editMode && (
            <button className="btn btn-primary flex items-center gap-2" onClick={handleEdit}>
              <Pencil className="w-4 h-4" />
              Chỉnh sửa hồ sơ
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-xl overflow-hidden">
            {(editMode && avatarFile && form.avatarUrl && form.avatarUrl.startsWith('blob:')) || user.avatarUrl ? (
              <img src={getAvatarSrc()} alt="avatar" className="w-full h-full object-cover rounded-full" />
            ) : (
              (user?.name || 'BN')
                .split(' ')
                .filter(Boolean)
                .map((p) => p[0]?.toUpperCase())
                .join('')
                .slice(0, 2)
            )}
            {editMode && showAvatarEdit && (
              <>
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center cursor-pointer rounded-full" onClick={handleAvatarEditClick}>
                  <span className="bg-white p-2 rounded-full shadow-md">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.293-6.293a1 1 0 011.414 0l1.586 1.586a1 1 0 010 1.414L11 15H9v-2z" /></svg>
                  </span>
                </div>
                <input id="avatarInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </>
            )}
          </div>
          <div>
            <p className="text-lg font-semibold text-secondary-900">{user?.name || 'Bệnh nhân'}</p>
            <p className="text-sm text-secondary-500">{user?.email || 'Chưa có email'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-secondary-500">Họ và tên</p>
            {editMode ? (
              <input name="name" value={form.name} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary-500" />
            ) : (
              <p className="font-medium text-secondary-900">{user?.name || 'Chưa cập nhật'}</p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-secondary-500">Email</p>
            <p className="font-medium text-secondary-900">{user?.email || 'Chưa cập nhật'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-secondary-500">Số điện thoại</p>
            {editMode ? (
              <input name="phone" value={form.phone} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary-500" />
            ) : (
              <p className="font-medium text-secondary-900">{user?.phone || 'Chưa cập nhật'}</p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-secondary-500">CCCD</p>
            {editMode ? (
              <input name="cccd" value={form.cccd} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary-500" />
            ) : (
              <p className="font-medium text-secondary-900">{user?.cccd || 'Chưa cập nhật'}</p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-secondary-500">Giới tính</p>
            {editMode ? (
              <select name="gender" value={form.gender} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            ) : (
              <p className="font-medium text-secondary-900">{user?.gender || 'Chưa cập nhật'}</p>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-secondary-500">Ngày sinh</p>
            {editMode ? (
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary-500" />
            ) : (
              <p className="font-medium text-secondary-900">{user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Chưa cập nhật'}</p>
            )}
          </div>
          <div className="space-y-1 md:col-span-2">
            <p className="text-secondary-500">Địa chỉ</p>
            {editMode ? (
              <input name="address" value={form.address} onChange={handleChange} className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary-500" />
            ) : (
              <p className="font-medium text-secondary-900">{user?.address || 'Chưa cập nhật'}</p>
            )}
          </div>
        </div>
        {/* Nút Lưu và Hủy ở dưới cùng, căn phải */}
        {editMode && (
          <div className="flex justify-end gap-2 pt-6">
            <button className="px-4 py-2 rounded font-semibold flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors border border-blue-200" onClick={handleSave} disabled={loading}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button className="px-4 py-2 rounded font-semibold flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 transition-colors border border-red-200" onClick={handleCancel} disabled={loading}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Hủy
            </button>
          </div>
        )}
        {/* Thông báo cập nhật thành công */}
        {showMessage && message && (
          <div className="transition-opacity duration-500 text-green-600 font-medium mt-2 animate-fadeOut">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

