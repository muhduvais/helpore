import { Navigate, useNavigate } from 'react-router-dom';
import bgDark_1_img from '../assets/bg-darkGreen-1.jpeg';
import { logout } from '../redux/slices/authSlice'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux';
import { useState } from 'react';

const userDashboard = () => {

  const [logoutText, setLogoutText] = useState('Logout');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);
  const isAdmin = useSelector((state: any) => state.auth.isAdmin);

  if (!isLoggedIn) {
    return <Navigate to={isAdmin ? '/admin/login' : '/users/login'} />;
  }
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/users/login');
  }

  return (
    <>
    {/* Main container */}
    <div className={`main-container w-[100vw] h-[100vh] flex items-center justify-center text-[#ffffff] bg-cover bg-center gap-x-10 px-20`}
    style={{ backgroundImage: `url(${bgDark_1_img})` }}
    >
      <h2 className='text-5xl font-bold'>Dashboard</h2>
      <button className={`text-3xl font-semiboldbold px-3 py-1 rounded bg-[#636363] opacity-8}`}
      onMouseEnter={() => setLogoutText('Noo🥹!!')}
      onMouseLeave={() => setLogoutText('Logout')}
      onClick={handleLogout}
      >
        {logoutText}
      </button>
    </div>
    </>
  )
}

export default userDashboard;