import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminUserDetails from '../pages/admin/AdminUserDetails';
import AdminUserManagement from '../pages/admin/AdminUserManagement';
import AdminAddUser from '../pages/admin/AdminAddUser';
import AdminVolunteerManagement from '../pages/admin/AdminVolunteerManagement';
import AdminAddVolunteer from '../pages/admin/AdminAddVolunteer';
import Admin404 from '../pages/admin/Admin404';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminAssetManagement from '../pages/admin/AdminAssetManagement';
import AdminAddAsset from '../pages/admin/AdminAddAsset';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminVolunteerDetails from '@/pages/admin/AdminVolunteerDetails';
import AdminAssetDetails from '@/pages/admin/AdminAssetDetails';
import AdminRequestManagement from '@/pages/admin/AdminRequestManagement ';
import AdminAssistanceRequestDetails from '@/pages/admin/AdminAssistanceRequestDetails';
import { AuthErrorHandler } from '@/utils/authErroHandler';

const AdminRoutes = () => {
    return (
        <Routes>
            <Route element={<ProtectedRoute roleRequired="admin" />}>
                <Route element={<AuthErrorHandler role='admin' />}>

                    <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                    <Route path="/" element={<AdminLayout />}>
                        <Route path="/dashboard" element={<AdminDashboard />} />
                        <Route path="/userManagement" element={<AdminUserManagement />} />
                        <Route path="/addUser" element={<AdminAddUser />} />
                        <Route path="/userDetails/:id" element={<AdminUserDetails />} />

                        <Route path="/volunteerManagement" element={<AdminVolunteerManagement />} />
                        <Route path="/addVolunteer" element={<AdminAddVolunteer />} />
                        <Route path="/volunteerDetails/:id" element={<AdminVolunteerDetails />} />

                        <Route path="/assetManagement" element={<AdminAssetManagement />} />
                        <Route path="/addAsset" element={<AdminAddAsset />} />
                        <Route path="/assets/:id" element={<AdminAssetDetails />} />

                        <Route path="/requestManagement" element={<AdminRequestManagement />} />
                        <Route path="/assistanceRequests/:id" element={<AdminAssistanceRequestDetails />} />

                        <Route path="/404" element={<Admin404 />} />
                        <Route path="/*" element={<Admin404 />} />
                    </Route>

                </Route>
            </Route>
        </Routes>
    );
};

export default AdminRoutes;