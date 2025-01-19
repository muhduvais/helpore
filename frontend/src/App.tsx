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
import ProtectedRoutes from './routes/protectedRoutes';

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role') || 'user';
    const accessToken = localStorage.getItem('accessToken') || '';
    const refreshToken = localStorage.getItem('refreshToken') || '';

    if (userId && role) {
      dispatch(login({ userId, accessToken, refreshToken, role }));
    }
  }, [dispatch]);

  return (
    <>
      <Router>
        <Provider store={store}>
          <Routes>
            <Route path="/" element={<Navigate to="/user/login" replace />} />

            {/* Public Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            <Route path="/user/login" element={<LoginPage />} />
            
            <Route path="/user/register" element={<RegisterPage />} />
            <Route path="/user/verifyOtp" element={<OtpVerification />} />
            <Route path="/user/resetPassword" element={<ResetPassword />} />

            <Route path="/volunteer/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </Provider>
      </Router>
    </>
  )
}

export default App
