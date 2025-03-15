import './App.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { login } from './redux/slices/authSlice'
import AdminLoginPage from './pages/auth/AdminLogin';
import LoginPage from './pages/auth/Login';
import RegisterPage from './pages/auth/Register';
import OtpVerification from './pages/auth/OtpVerification';
import ResetPassword from './pages/auth/ResetPassword';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import UserRoutes from './routes/user.routes';
import VolunteerRoutes from './routes/volunteer.routes';
import AdminRoutes from './routes/admin.routes';
import NotFound404 from './pages/NotFound404';
import { SidebarProvider } from './context/sidebarContext';
import LandingPage from './pages/user/LandingPage';
import { NotificationProvider } from '@/context/notificationContext';
import { Toaster } from 'sonner';

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role') || 'user';
    const accessToken = localStorage.getItem('accessToken') || '';

    if (userId && role) {
      dispatch(login({ userId, accessToken, role }));
    }
  }, [dispatch]);

  return (
    <>
      <Router>
        <Provider store={store}>
          <SidebarProvider>
            <NotificationProvider>
              <Routes>
                {/* Auth Routes */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<LandingPage />} />

                <Route path="/user/login" element={<LoginPage />} />
                <Route path="/user/register" element={<RegisterPage />} />
                <Route path="/user/verifyOtp" element={<OtpVerification />} />
                <Route path="/user/resetPassword" element={<ResetPassword />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Other Routes */}
                <Route path="/admin/*" element={<AdminRoutes />} />
                <Route path="/user/*" element={<UserRoutes />} />
                <Route path="/volunteer/*" element={<VolunteerRoutes />} />
                <Route path="/*" element={<NotFound404 />} />
              </Routes>
              <Toaster position="top-center" />
            </NotificationProvider>
          </SidebarProvider>
        </Provider>
      </Router>
    </>
  )
}

export default App
