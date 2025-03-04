import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import UserDashboard from '../pages/user/UserDashboard';
import User404 from '../pages/user/User404';
import UserInfo from '../pages/user/ProfileInfo';
import ProfileSettings from '../pages/user/ProfileSettings';
import ProfileChangePassword from '../pages/user/ProfileChangePassword';
import UserLayout from '../pages/user/UserLayout';
import UserRequestList from '../pages/user/UserRequestList';
import UserAssetListing from '@/pages/user/UserAssetsList';
import UserAssetDetails from '@/pages/user/UserAssetDetails';
import { AuthErrorHandler } from '../utils/authErroHandler';
import RequestAssistanceForm from '@/pages/user/AssistanceRequest';
import AssistanceRequestDetails from '@/pages/user/AssistanceRequestDetails';
import DonationPage from '@/pages/user/Donation';

const UserRoutes = () => {
  return (
    <Routes>
      {/* Protected Routes */}
      <Route element={<ProtectedRoute roleRequired="user" />}>
        <Route element={<AuthErrorHandler role='user' />}>

          <Route path="/" element={<Navigate to="/user/dashboard" />} />

          <Route path="/" element={<UserLayout />}>
            <Route index path="dashboard" element={<UserDashboard />} />
            <Route path="assets" element={<UserAssetListing />} />
            <Route path="assets/:id" element={<UserAssetDetails />} />

            {/* Asset & assistance requests */}
            <Route path="requests" element={<UserRequestList />} />

            {/* Assistance requests */}
            <Route path="assistanceRequest" element={<RequestAssistanceForm />} />
            <Route path="assistanceRequests/:id" element={<AssistanceRequestDetails />} />

            <Route path="/profile" element={<Navigate to="/user/profile/info" />} />

            <Route path="/profile/info" element={<UserInfo />} />
            <Route path="/profile/changePassword" element={<ProfileChangePassword />} />
            <Route path="/profile/settings" element={<ProfileSettings />} />

            {/* Donations */}
            <Route path="/donations" element={<DonationPage />} />

            <Route path="404" element={<User404 />} />
            <Route path="*" element={<User404 />} />
          </Route>

        </Route>
      </Route>


    </Routes>
  );
};

export default UserRoutes;
