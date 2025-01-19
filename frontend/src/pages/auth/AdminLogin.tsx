import React, { useEffect, useState } from 'react'
import axios from '../../utils/urlProxy'
import { useDispatch } from 'react-redux'
import { login } from '../../redux/slices/authSlice'
import { Navigate, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import bgDark_1_img from '../../assets/bg-darkGreen-1.jpeg';
import logo from '../../assets/Logo.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { LoginResponse } from '../../interfaces/authInterface';
import { useSelector } from 'react-redux';

const AdminLoginPage: React.FC = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);
  const role = useSelector((state: any) => state.auth.role);

  if (isLoggedIn && role === 'admin') {
    return <Navigate to={'/admin/dashboard'} />
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const dispatch = useDispatch();

  const validateEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEmail = e.target.value.trim();
    setEmail(inputEmail);

    const validate = (email: string) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

    if ((emailMessage || errorMessage) && !validate(inputEmail)) {
      setEmailMessage('Please enter a valid email!');
    } else {
      setEmailMessage('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const validate = (email: string) => {
      return (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).test(email);
    };

    const inputPassword = password.trim();

    setEmailMessage('');
    setPasswordMessage('');

    let isValid = true;

    if (!email) {
      setEmailMessage('Please enter the email!');
      isValid = false;
    } else if (!validate(email)) {
      setEmailMessage('Please enter a valid email!');
      isValid = false;
    }

    if (!inputPassword) {
      setPasswordMessage('Please enter the password!');
      isValid = false;
    }

    if (isValid) {

      try {
        const response = await axios.post<LoginResponse>('/api/auth/admin/login', {
          selectedRole: 'admin',
          email,
          password: inputPassword
        });

        if (response.status !== 200) {
          return setErrorMessage(response.data.message);
        }

        if (response.data) {
          const { user, accessToken, refreshToken } = response.data;

          dispatch(login({ userId: user.id, accessToken, refreshToken, role: user.role }));
          console.log('Going to admin dashboard!') //
          navigate('/admin/dashboard');
          return;
        }
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          const errorMessage = error.response?.data?.message || 'An error occurred';
          setErrorMessage(errorMessage);
        } else {
          console.error('Login failed:', error);
          setErrorMessage('An unexpected error occurred');
        }
      }
    }
  }


  return (
    <>
      {/* Main container */}
      <div className={`main-container relative w-[100vw] h-[100vh] flex items-center justify-between text-[#222222] bg-cover bg-center px-20`}
        style={{ backgroundImage: `url(${bgDark_1_img})` }}
      >
        <div className="logo absolute top-16 left-28">
          <img src={logo} alt="logo" />
        </div>

        {/* Left text */}
        <div className="textContainer max-w-[45%] mx-20">
          <h2 className='text-white text-5xl font-bold'>“You can always, always give something, even if it is only kindness!”</h2>
        </div>

        <div className={`login-form bg-white bg-opacity-80 transition-all duration-300 rounded-xl max-w-sm w-[400px] p-3 px-5 mr-24`}>
          <div className='login-title flex items-center justify-start gap-x-2 p-4 pb-8 text-4xl font-bold'>
            <h2 className={`text-[#414141]`}>Login <span className='font-light'>here</span></h2>
          </div>

          {errorMessage && <span className='p-3 opacity-90 font-semibold text-red-500'>{errorMessage}</span>}
          <hr className='opacity-100' />

          <form onSubmit={handleLogin} className='py-3'>

            <div className="input-field flex flex-col p-3 pt-0 gap-y-1">
              {emailMessage ? <label htmlFor="email" className='opacity-90 font-semibold text-red-500'>{emailMessage}</label>
                : <label htmlFor="email" className='opacity-75 font-semibold'>Email</label>}
              <input
                type="text"
                name="email"
                id="email"
                value={email}
                onChange={validateEmail}
                className={`transition-all duration-300 bg-transparent px-3 py-2 text-xl font-semibold border-b-[3px] bg-white ${emailMessage || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none`} />

            </div>

            <div className="relative input-field flex flex-col p-3 pt-0 gap-y-2">
              {passwordMessage ? <label htmlFor="password" className='opacity-90 font-semibold text-red-500'>{passwordMessage}</label>
                : <label htmlFor="password" className='opacity-75 font-semibold'>Password</label>}
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`transition-all duration-300 bg-transparent px-3 py-2  text-xl font-semibold border-b-[3px] bg-white ${passwordMessage || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none`} />

              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-7 top-11 text-xl text-gray-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Submit button */}
            <div className="input-field flex flex-col px-3 py-1 mt-5">
              <button
                type='submit'
                className={`transition-all w-full duration-300 bg-[#688D48] px-3 py-2 text-white text-xl outline-none font-semibold`}>
                Submit
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  )
}

export default AdminLoginPage;