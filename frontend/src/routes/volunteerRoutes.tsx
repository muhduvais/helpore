import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import VolunteerDashboard from '../pages/volunteer/VolunteerDashboard'
import Volunteer404 from '../pages/volunteer/Volunteer404'

const VolunteerRoutes = () => {
    return (
        <Routes>
            {/* Protected Routes */}
            <Route element={<ProtectedRoute roleRequired="user" />}>
                <Route path="/dashboard" element={<VolunteerDashboard />} />
                <Route path="/404" element={<Volunteer404 />} />
                <Route path="/*" element={<Volunteer404 />} />
            </Route>
        </Routes>
    );
};

export default VolunteerRoutes;