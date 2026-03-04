import React from "react";
import AdminLayout from "../../components/Admin/AdminLayout";

const AdminExpenses = () => {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Quản lý Chi tiêu</h1>
      {/* Bảng chi tiêu, thêm/sửa/xóa sẽ bổ sung sau */}
      <div className="bg-white p-6 rounded shadow">
        <p>Chức năng quản lý chi tiêu sẽ được phát triển ở đây.</p>
      </div>
    </AdminLayout>
  );
};

export default AdminExpenses;
