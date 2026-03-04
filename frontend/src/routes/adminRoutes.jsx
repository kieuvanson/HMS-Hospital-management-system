import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminDoctors from "../pages/admin/AdminDoctors";
import AdminNurses from "../pages/admin/AdminNurses";
import AdminExpenses from "../pages/admin/AdminExpenses";
import UserManagement from "../pages/admin/UserManagement";
// ...existing code...

const adminRoutes = [
  { path: "/admin/dashboard", element: <AdminDashboard /> },
  { path: "/admin/doctors", element: <AdminDoctors /> },
  { path: "/admin/nurses", element: <AdminNurses /> },
  { path: "/admin/expenses", element: <AdminExpenses /> },
  { path: "/admin/users", element: <UserManagement /> },
];

export default adminRoutes;
