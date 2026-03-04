import React from "react";
import AdminLayout from "../../components/Admin/AdminLayout";

const AdminNurses = () => {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Quản lý Y tá</h1>
      {/* Bảng danh sách y tá, nút thêm/sửa/xóa sẽ bổ sung sau */}
      <div className="bg-white p-6 rounded shadow">
        <p>Chức năng quản lý y tá sẽ được phát triển ở đây.</p>
      </div>
    </AdminLayout>
  );
};

export default AdminNurses;
