import './App.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { login } from '../src/redux/slices/authSlice'
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpVerification from './pages/OtpVerification';
import UserDashboard from './pages/UserDashboard';
import ResetPassword from './pages/ResetPassword';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';

function App() {

  const dispatch = useDispatch();

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const email = localStorage.getItem('userEmail');
        const isAdmin = localStorage.getItem('isAdmin') === 'true';

        if (accessToken && refreshToken && email) {
            dispatch(login({ email, accessToken, refreshToken, isAdmin }));
        }
    }, [dispatch]);

  return (
    <>
      <Router>
          <Provider store={store}>
              <Routes>
                  <Route path="/" element={<Navigate to="/users/login" replace/>} />
                  <Route path="/users/register" element={<RegisterPage />} />
                  <Route path="/users/verifyOtp" element={<OtpVerification />} />
                  <Route path="/users/login" element={<LoginPage />} />
                  <Route path="/users/resetPassword" element={<ResetPassword />} />
                  <Route path="/users/dashboard" element={<UserDashboard />} />
              </Routes>
          </Provider>
      </Router>
    </>
  )
}

export default App
