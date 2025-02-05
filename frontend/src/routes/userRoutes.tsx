import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import UserDashboard from '../pages/user/UserDashboard';
import User404 from '../pages/user/User404';
import ProfileLayout from '../components/ProfileLayout';
import UserInfo from '../pages/user/ProfileInfo';
import ProfileSettings from '../pages/user/ProfileSettings';
import ProfileChangePassword from '../pages/user/ProfileChangePassword';
import UserLayout from '../pages/user/UserLayout';
import UserRequestList from '../pages/user/UserRequestList';
import UserAssetListing from '@/pages/user/UserAssetsList';
import UserAssetDetails from '@/pages/user/UserAssetDetails';

const UserRoutes = () => {
  return (
    <Routes>
      {/* Protected Routes */}
      <Route element={<ProtectedRoute roleRequired="user" />}>

        <Route path="/" element={<Navigate to="/user/dashboard" />} />
        <Route path="/" element={<UserLayout />}>
          <Route index path="dashboard" element={<UserDashboard />} />
          <Route path="assets" element={<UserAssetListing />} />
          <Route path="assetDetails/:id" element={<UserAssetDetails />} />
          <Route path="requestList" element={<UserRequestList />} />
          <Route path="404" element={<User404 />} />
          <Route path="*" element={<User404 />} />
        </Route>

        <Route path="/profile" element={<Navigate to="/user/profile/info" />} />
        <Route path="/profile" element={<ProfileLayout />}>
          <Route index path="info" element={<UserInfo />} />
          <Route path="changePassword" element={<ProfileChangePassword />} />
          <Route path="settings" element={<ProfileSettings />} />
        </Route>
      </Route>


    </Routes>
  );
};

export default UserRoutes;
