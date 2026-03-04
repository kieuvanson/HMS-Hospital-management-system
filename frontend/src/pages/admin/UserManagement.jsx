import React from "react";
import AdminLayout from "../../components/Admin/AdminLayout";

const UserManagement = () => {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Quản lý người dùng & phân quyền</h1>
      {/* Danh sách tài khoản, phân quyền, tạo/sửa/xóa, khóa/mở khóa, reset mật khẩu sẽ được phát triển ở đây */}
      <div className="bg-white p-6 rounded shadow">
        <p>Chức năng quản lý tài khoản nhân viên, phân quyền truy cập sẽ được phát triển tại đây.</p>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
