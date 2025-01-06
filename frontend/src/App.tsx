import './App.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpVerification from './pages/OtpVerification';
import UserDashboard from './pages/UserDashboard';
import ResetPassword from './pages/ResetPassword';

function App() {

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
