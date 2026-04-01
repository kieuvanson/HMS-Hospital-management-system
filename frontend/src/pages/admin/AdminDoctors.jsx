import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import { Plus, Edit, Trash2, Search, X, Eye } from "lucide-react";
import { authAPI, specialtyAPI, departmentAPI, doctorAPI } from "../../services/api.js";

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [specialties, setSpecialties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedFormDepartment, setSelectedFormDepartment] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
    specialty: "",
    department: "",
    phone: ""
  });
  const [errors, setErrors] = useState({});

  // Giả lập dữ liệu bác sĩ từ database + fetch danh sách chuyên môn
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch danh sách bác sĩ từ database
        const doctorsData = await doctorAPI.getAll();
        setDoctors(doctorsData || []);
        setFilteredDoctors(doctorsData || []);

        // Fetch danh sách chuyên môn (Specialty)
        const specialtiesData = await specialtyAPI.getAll();
        setSpecialties(specialtiesData.data || specialtiesData);

        // Fetch danh sách khoa
        const departmentsData = await departmentAPI.getAll();
        setDepartments(departmentsData);
      } catch (error) {
        console.error("Lỗi fetch dữ liệu:", error);
        setErrorMessage("Lỗi khi tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter dữ liệu
  useEffect(() => {
    let filtered = doctors;

    if (selectedDepartment !== "all") {
      filtered = filtered.filter(d => d.department === selectedDepartment);
    }

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.email.toLowerCase().includes(searchTerm.toLowerCase())||
        d.phone.includes(searchTerm)
      );
    }

    setFilteredDoctors(filtered);
  }, [doctors, searchTerm, selectedDepartment]);

  // Validate form - chỉ check mật khẩu không khớp
  const validateForm = () => {
    const newErrors = {};
    
    // Chỉ validate mật khẩu không khớp
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Gọi API để tạo tài khoản bác sĩ
    handleCreateDoctor();
  };

  // Create doctor via API
  const handleCreateDoctor = async () => {
    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await authAPI.createDoctorAccount({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        age: formData.age,
        gender: formData.gender,
        specialty: formData.specialty,
        department: formData.department,
        phone: formData.phone,
      });

      // Fetch lại danh sách bác sĩ từ database
      const updatedDoctors = await doctorAPI.getAll();
      setDoctors(updatedDoctors || []);
      setFilteredDoctors(updatedDoctors || []);
      
      setSuccessMessage(response.message);

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        age: "",
        gender: "",
        specialty: "",
        department: "",
        phone: ""
      });
      setErrors({});

      // Close modal sau 2 giây
      setTimeout(() => {
        setShowModal(false);
        setSuccessMessage("");
      }, 2000);

    } catch (error) {
      const errorMsg = error.message || error.response?.data?.message || "Lỗi tạo tài khoản bác sĩ";
      setErrorMessage(errorMsg);
      console.error("Lỗi:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      age: "",
      gender: "",
      specialty: "",
      department: "",
      phone: ""
    });
    setErrors({});
  };

  // Nhóm bác sĩ theo chuyên môn
  const doctorsBySpecialty = {};
  filteredDoctors.forEach(doctor => {
    if (!doctorsBySpecialty[doctor.specialty]) {
      doctorsBySpecialty[doctor.specialty] = [];
    }
    doctorsBySpecialty[doctor.specialty].push(doctor);
  });

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý Bác sĩ</h1>
            <p className="text-gray-600 text-sm">Chức năng quản lý bác sĩ sẽ được phát triển ở đây.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
            <Plus className="w-5 h-5" />
            Thêm bác sĩ
          </button>
        </div>

        {/* Bộ lọc */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tìm kiếm */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, email, điện thoại..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Lọc theo chuyên môn */}
            <div>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="all">Tất cả khoa</option>
                {departments
                  .map(dept => ({
                    ...dept,
                    count: doctors.filter(doc => doc.department === dept.name).length
                  }))
                  .sort((a, b) => b.count - a.count)
                  .map(dept => (
                    <option key={dept._id} value={dept.name}>
                      {dept.name} ({dept.count})
                    </option>
                  ))}
              </select>
            </div>

            {/* Thống kê */}
            <div className="text-right pt-2">
              <p className="text-gray-700 font-semibold">
                Tổng: <span className="text-blue-600">{filteredDoctors.length}</span> bác sĩ
              </p>
            </div>
          </div>
        </div>

        {/* Sort departments theo số lượng bác sĩ (nhiều nhất lên đầu) */}
        {departments
          .map(department => ({
            department,
            count: filteredDoctors.filter(d => d.department === department.name).length
          }))
          .sort((a, b) => b.count - a.count)
          .map(({ department }) => {
            const deptDoctors = filteredDoctors.filter(d => d.department === department.name);
            const deptSpecialties = specialties.filter(spec => spec.departmentId?._id === department._id);
            
            return (
              <div key={department._id} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b-2 border-blue-600">
                  {department.name} <span className="text-sm font-normal text-gray-500">({deptDoctors.length})</span>
                </h2>

                {deptDoctors.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <p className="text-gray-500">Chưa có bác sĩ</p>
                  </div>
                ) : (
                  deptSpecialties
                    .map(specialty => ({
                      specialty,
                      count: deptDoctors.filter(d => d.specialty === specialty.name).length
                    }))
                    .sort((a, b) => b.count - a.count)
                    .map(({ specialty }) => {
                      const specialtyDoctors = deptDoctors.filter(d => d.specialty === specialty.name);
                      
                      if (specialtyDoctors.length === 0) return null;

                      return (
                        <div key={specialty._id} className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-700 mb-3 pl-4 border-l-4 border-blue-500">
                            {specialty.name} <span className="text-sm font-normal text-gray-500">({specialtyDoctors.length})</span>
                          </h3>

                          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Tên bác sĩ</th>
                                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Chuyên môn</th>
                                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Email</th>
                                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Điện thoại</th>
                                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Kinh nghiệm</th>
                                  <th className="px-6 py-4 text-center font-semibold text-gray-700">Hành động</th>
                                </tr>
                              </thead>
                              <tbody>
                                {specialtyDoctors.map((doctor) => (
                                  <tr key={doctor._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-medium text-gray-800">{doctor.name}</td>
                                    <td className="px-6 py-4 text-gray-600">{doctor.specialty}</td>
                                    <td className="px-6 py-4 text-gray-600">{doctor.email}</td>
                                    <td className="px-6 py-4 text-gray-600">{doctor.phone}</td>
                                    <td className="px-6 py-4 text-gray-600">{doctor.experience} năm</td>
                                    <td className="px-6 py-4 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <button className="p-2 hover:bg-blue-100 rounded-lg transition" title="Xem chi tiết">
                                          <Eye className="w-4 h-4 text-blue-600" />
                                        </button>
                                        <button className="p-2 hover:bg-green-100 rounded-lg transition" title="Sửa">
                                          <Edit className="w-4 h-4 text-green-600" />
                                        </button>
                                        <button className="p-2 hover:bg-red-100 rounded-lg transition" title="Xóa">
                                          <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            );
          })}

        {filteredDoctors.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Không tìm thấy bác sĩ nào</p>
          </div>
        )}

        {/* Modal Thêm Bác sĩ */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Thêm Bác sĩ Mới</h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Success Message */}
                {successMessage && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    {successMessage}
                  </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {errorMessage}
                  </div>
                )}
                {/* Thông tin cá nhân */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Thông Tin Cá Nhân
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tên */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tên bác sĩ <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.name
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                        placeholder="Nguyễn Văn A"
                      />
                      {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.email
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                        placeholder="nva@hospital.com"
                      />
                      {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Mật khẩu */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Mật khẩu <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.password
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                        placeholder="••••••••"
                      />
                      {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
                    </div>

                    {/* Xác nhận mật khẩu */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Xác nhận mật khẩu <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.confirmPassword
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                        placeholder="••••••••"
                      />
                      {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>

                    {/* Tuổi */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tuổi <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.age
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                        placeholder="30"
                        min="18"
                        max="100"
                      />
                      {errors.age && <p className="text-red-600 text-xs mt-1">{errors.age}</p>}
                    </div>

                    {/* Giới tính */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Giới tính <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.gender
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                      >
                        <option value="">-- Chọn giới tính --</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                      {errors.gender && <p className="text-red-600 text-xs mt-1">{errors.gender}</p>}
                    </div>
                  </div>
                </div>

                {/* Thông tin chuyên môn */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Thông Tin Chuyên Môn
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Khoa */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Khoa <span className="text-red-600">*</span>
                      </label>
                      <select
                        value={selectedFormDepartment}
                        onChange={(e) => {
                          setSelectedFormDepartment(e.target.value);
                          setFormData(prev => ({ ...prev, department: e.target.value }));
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.department
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                      >
                        <option value="">-- Chọn khoa --</option>
                        {departments.map(dept => (
                          <option key={dept._id} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                      {errors.department && <p className="text-red-600 text-xs mt-1">{errors.department}</p>}
                    </div>

                    {/* Chuyên môn */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Chuyên môn <span className="text-red-600">*</span>
                      </label>
                      <select
                        name="specialty"
                        value={formData.specialty}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.specialty
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-blue-500"
                        }`}
                      >
                        <option value="">-- Chọn chuyên môn --</option>
                        {(() => {
                          const selectedDeptObj = departments.find(dept => dept.name === selectedFormDepartment);
                          const selectedDeptId = selectedDeptObj?._id;
                          return specialties
                            .filter(spec => !selectedFormDepartment || spec.departmentId?._id === selectedDeptId)
                            .map(specialty => (
                              <option key={specialty._id} value={specialty.name}>
                                {specialty.name}
                              </option>
                            ));
                        })()}
                      </select>
                      {errors.specialty && <p className="text-red-600 text-xs mt-1">{errors.specialty}</p>}
                    </div>
                  </div>
                </div>

                {/* Thông tin liên hệ (tùy chọn) */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                    Thông Tin Liên Hệ (Tùy chọn)
                  </h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0901000000"
                    />
                    <p className="text-gray-500 text-xs mt-1">Bác sĩ có thể cập nhật thông tin khác sau</p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Đang tạo..." : "Tạo Tài Khoản"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDoctors;
