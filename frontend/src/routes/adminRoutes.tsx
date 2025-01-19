import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUserManagement from '../pages/admin/AdminUserManagement';
import AdminAddUser from '../pages/admin/AdminAddUser';
import AdminVolunteerManagement from '../pages/admin/AdminVolunteerManagement';
import AdminAddVolunteer from '../pages/admin/AdminAddVolunteer';
import Admin404 from '../pages/admin/Admin404';
import AdminUserDetails from '../pages/AdminUserDetails';

const adminRoutes = [
  { path: "/admin/dashboard", element: <AdminUserDetails /> },
  { path: "/admin/userManagement", element: <AdminUserManagement /> },
  { path: "/admin/addUser",element: <AdminAddUser /> },
  { path: "/admin/volunteerManagement",element: <AdminVolunteerManagement /> },
  { path: "/admin/addVolunteer", element: <AdminAddVolunteer /> },
  { path: "/admin/404", element: <Admin404 /> },
  { path: "/admin/*", element: <Admin404 /> },
];

export default adminRoutes;