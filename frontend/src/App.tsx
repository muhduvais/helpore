import './App.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { login } from '../src/redux/slices/authSlice'
import AdminLoginPage from './pages/AdminLogin';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import OtpVerification from './pages/OtpVerification';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminVolunteerManagement from './pages/AdminVolunteerManagement';
import UserDashboard from './pages/UserDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import ResetPassword from './pages/ResetPassword';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';

function App() {

  const dispatch = useDispatch();

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const userId = localStorage.getItem('userId');
        const role = localStorage.getItem('role') || 'user';

        if (accessToken && refreshToken && userId) {
            dispatch(login({ userId, accessToken, refreshToken, role }));
        }
    }, [dispatch]);

  return (
    <>
      <Router>
          <Provider store={store}>
              <Routes>
                  <Route path="/" element={<Navigate to="/users/login" replace/>} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/userManagement" element={<AdminUserManagement />} />
                  <Route path="/admin/volunteerManagement" element={<AdminVolunteerManagement />} />

                  <Route path="/users/register" element={<RegisterPage />} />
                  <Route path="/users/verifyOtp" element={<OtpVerification />} />
                  <Route path="/users/login" element={<LoginPage />} />
                  <Route path="/users/resetPassword" element={<ResetPassword />} />
                  <Route path="/users/dashboard" element={<UserDashboard />} />

                  <Route path="/volunteers/dashboard" element={<VolunteerDashboard />} />
              </Routes>
          </Provider>
      </Router>
    </>
  )
}

export default App
