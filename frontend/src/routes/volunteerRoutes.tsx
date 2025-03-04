import { Navigate, Route, Routes } from 'react-router-dom';
import VolunteerDashboard from '../pages/volunteer/VolunteerDashboard'
import Volunteer404 from '../pages/volunteer/Volunteer404'
import ProtectedRoute from '../components/ProtectedRoute';
import VolunteerAssistanceRequestDetails from '@/pages/volunteer/VolunteerAssistanceRequestDetails';
import { AuthErrorHandler } from '@/utils/authErroHandler';
import VolunteerInfo from '../pages/volunteer/VolunteerProfileInfo';
import ProfileChangePassword from '@/pages/user/ProfileChangePassword';
import ProfileSettings from '@/pages/user/ProfileSettings';
import VolunteerLayout from '@/pages/volunteer/VolunteerLayout';
import VolunteerRequests from '@/pages/volunteer/volunteerRequestsList';
import VolunteerRequestList from '@/pages/volunteer/VolunteerRequestList';

const VolunteerRoutes = () => {
    return (
        <Routes>
            <Route element={<ProtectedRoute roleRequired="volunteer" />}>
                <Route element={<AuthErrorHandler role='volunteer' />}>

                    <Route path="/" element={<Navigate to="/volunteer/dashboard" replace />} />
                    <Route path="/" element={<VolunteerLayout />}>
                        <Route path="/dashboard" element={<VolunteerDashboard />} />

                        <Route path="/profile" element={<Navigate to="/volunteer/profile/info" />} />

                        <Route path="/profile/info" element={<VolunteerInfo />} />
                        <Route path="/profile/changePassword" element={<ProfileChangePassword />} />
                        <Route path="/profile/settings" element={<ProfileSettings />} />

                        <Route path="/requests" element={<VolunteerRequestList />} />

                        <Route path="/assistanceRequests" element={<VolunteerRequests />} />
                        <Route path="/assistanceRequests/:id" element={<VolunteerAssistanceRequestDetails />} />

                        <Route path="/404" element={<Volunteer404 />} />
                        <Route path="/*" element={<Volunteer404 />} />
                    </Route>

                </Route>
            </Route>
        </Routes>
    );
};

export default VolunteerRoutes;