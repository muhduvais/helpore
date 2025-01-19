import { Route, Routes } from 'react-router-dom';
import adminRoutes from './adminRoutes';
import userRoutes from './userRoutes';
import volunteerRoutes from './volunteerRoutes';
import ProtectedRoute from '../components/ProtectedRoutes';
import NotFound404 from '../pages/NotFound404';

const ProtectedRoutes = () => {
    console.log('Inside ProtectedRoutes') //
    return (
        <Routes>
            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute roleRequired="admin" />}>
                {adminRoutes.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                ))}
            </Route>

            {/* User Protected Routes */}
            <Route element={<ProtectedRoute roleRequired="user" />}>
                {userRoutes.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                ))}
            </Route>

            {/* Volunteer Protected Routes */}
            <Route element={<ProtectedRoute roleRequired="volunteer" />}>
                {volunteerRoutes.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                ))}
            </Route>

            <Route path="/*" element={<NotFound404 />} />
        </Routes>
    );
};

export default ProtectedRoutes;
