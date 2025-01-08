import React, { useState } from 'react'
import axios from '../utils/urlProxy'
import { useDispatch } from 'react-redux'
import { login } from '../redux/slices/authSlice'
import { Link, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios';
import bgDark_1_img from '../assets/bg-darkGreen-1.jpeg';
import logo from '../assets/Logo.png';
import { authController } from '../controllers/authController';
import { toast, ToastContainer } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useSelector } from 'react-redux';
import { SiTicktick } from "react-icons/si";

interface LoginResponse {
  message: string,
  accessToken: string;
  refreshToken: string;
  user: {
    email: string,
    role: string,
  }
}

const LoginPage: React.FC = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);
  const role = useSelector((state: any) => state.auth.role);

  if (isLoggedIn) {
    if (role === 'admin') {
      return <Navigate to={'/admin/dashboard'} />
    } else if (role === 'user') {
      return <Navigate to={'/users/dashboard'} />
    } else {
      return <Navigate to={'/volunteers/dashboard'} />
    }
  }

  const toggleRole = (value: boolean) => {
    setIsVolunteer(value);
    setEmail('');
    setPassword('');
    setErrorMessage('');
    setEmailMessage('');
    setPasswordMessage('');
  }

  const handleGoogleLogin = async () => {
    try {
        const response = await authController.handleGoogleLogin();

        if (!response.success) {
          setErrorMessage(response.message);
          return;
        }

        const { accessToken, refreshToken, user: userData } = response;

        dispatch(login({ email: userData.email, accessToken, refreshToken, role: userData.role }));
        navigate('/users/dashboard');
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          const errorMessage = error.response?.data?.message || 'An error occurred';
            setErrorMessage(errorMessage);
        }
      } else {
        console.error('Google login failed:', error);
        setErrorMessage('Google login failed. Please try again.');
      }
    }
  };

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
            const response = await axios.post<LoginResponse>('/api/auth/users/login', { 
                selectedRole: isVolunteer ? 'volunteer' : 'user',
                email, 
                password: inputPassword 
            });

            if (response.status !== 200) {
                return setErrorMessage(response.data.message);
            }

            if (response.data) {
              const { accessToken, refreshToken, user } = response.data;
              
              dispatch(login({ email: user.email, accessToken, refreshToken, role: user.role }));

              if (user.role === 'user') {
                return <Navigate to={'/users/dashboard'} />
              } else {
                return <Navigate to={'/volunteers/dashboard'} />
              }
            }
        } catch (error: unknown) {
          // setIsLoading(false);
          if (error instanceof AxiosError) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            setErrorMessage(errorMessage);
          } else {
            console.error('Login failed:', error);
            setErrorMessage('An unexpected error occurred');
          }
        } finally {
          // setIsLoading(false);
        }
    }
  }

    const handleForgotPassword = async (e: React.FormEvent) => {
      e.preventDefault();

      const validate = (email: string) => {
        return (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).test(email);
      };

      let isValid = true;

      if (!forgotEmail) {
        setForgotMessage('Please enter your email');
        isValid = false;
      } else if (!validate(forgotEmail)) {
        setForgotMessage('Please enter a valid email');
        isValid = false;
      }

      if (isValid) {
        setIsLoading(true);
        try {
          setForgotMessage('');
          const response = await axios.post('/api/auth/users/forgotPassword', { email: forgotEmail });
          if (response.status !== 200) {
            return setForgotMessage(response.data.message);
          }
    
          if (response.status === 200) {
            toast.success('Reset link has sent to your email!');
            setShowForgotModal(false);
          }
        } catch (error) {
          if (error instanceof AxiosError) {
            const errorMessage = error.response?.data?.message;
            setForgotMessage(errorMessage || 'Bad request!');
          } else {
            setForgotMessage('An unexpected error occurred');
          }
        } finally {
          setIsLoading(false);
        }
      }
      
    }


  return (
    <>
    <ToastContainer 
        position="top-right" 
        autoClose={5000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
    />

    {/* Modal */}
    {showForgotModal && (
        <div className={`fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 ${
          showForgotModal ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className={`bg-white bg-opacity-90 transition-all duration-300 rounded-xl p-3 px-5 ${
        showForgotModal ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
      }`}>
            <div className="header flex items-center justify-start gap-x-5">
              <h2 className="text-2xl font-bold mb-1">Forgot <span className='font-normal'>Password</span></h2>
              {isLoading && 
              <DotLottieReact
                src="https://lottie.host/525ff46b-0a14-4aea-965e-4b22ad6a8ce7/wGcySY4DHd.lottie"
                loop
                autoplay
                style={{ width: "30px", height: "50px", paddingTop: "15px", marginBottom: "14px" }}
              />}
            </div>
            {forgotMessage && <p className='opacity-90 font-semibold text-red-500 text-sm py-2 pb-3'>{forgotMessage}</p> }
              <form onSubmit={handleForgotPassword}>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`transition-all duration-300 bg-transparent px-3 py-2 my-2 text-xl font-semibold border-b-[3px] bg-white ${forgotMessage || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none`}
                />
                <div className="btns flex gap-x-1">
                  <button
                    onClick={handleForgotPassword}
                    className="w-full p-2 bg-[#688D48] text-white mt-2"
                  >
                    Send Reset Link
                  </button>
                  <button
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotMessage('');
                      setErrorMessage('');
                    }}
                    className="w-full p-2 bg-gray-300 text-black mt-2"
                  >
                    Close
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}

      {/* Main container */}
    <div className={`main-container relative w-[100vw] h-[100vh] flex items-center justify-between text-[#222222] bg-cover bg-center px-20 ${showForgotModal ? 'blur-[3px]' : ''}`}
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

        {/* Are you a volunteer? */}
        <div className='login-title flex items-center justify-center mx-4 mb-1'>
          <button className={`${!isVolunteer ? 'bg-[#688D48]' : ''} w-[50%] flex gap-x-2 items-center justify-center`}
          onClick={() => toggleRole(false)}
          >
              {!isVolunteer && <SiTicktick className='text-white'/>}
              <h2 className={`text-black ${!isVolunteer ? 'text-white' : 'font-semibold'}`}>Not a volunteer</h2>
          </button>
          <button className={`${isVolunteer ? 'bg-[#688D48]' : ''} w-[50%] flex gap-x-2 items-center justify-center`}
          onClick={() => toggleRole(true)}
          >
              {isVolunteer && <SiTicktick className='text-white'/>}
              <h2 className={`text-black ${isVolunteer ? 'text-white' : 'font-semibold'}`}>I am a volunteer</h2>
          </button>
        </div>

        {errorMessage && <span className='p-3 opacity-90 font-semibold text-red-500'>{errorMessage}</span>}
        <hr className='opacity-100'/>
        
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
                    className={`transition-all duration-300 bg-transparent px-3 py-2 text-xl font-semibold border-b-[3px] bg-white ${emailMessage || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>
                    
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
                    className={`transition-all duration-300 bg-transparent px-3 py-2  text-xl font-semibold border-b-[3px] bg-white ${passwordMessage || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>
                    
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-7 top-11 text-xl text-gray-600"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>

                {/* Forgot password */}
                <div className="btns flex items-center justify-between mx-3 mb-2 mt-3">
                    <div className='new-user text-[14px]'><button
                    type='button'
                    className={`text-[#767676] font-semibold pr-1 hover:underline`}
                    onClick={() => setShowForgotModal(true)}
                    >Forgot password?</button></div>
                </div>

                {/* Submit button */}
                <div className="input-field flex flex-col px-3 py-1">
                    <button
                    type='submit'
                    className={`transition-all w-full duration-300 bg-[#688D48] px-3 py-2 text-white text-xl outline-none font-semibold`}>
                    Submit
                    </button>
                </div>

                {/* Register now button */}
                { !isVolunteer && 
                <div className="btns flex items-center justify-between mx-3 mb-2 mt-2">
                    <div className='new-user text-[14px]'><span className='opacity-60 pr-2'>Not Registered?</span><Link to="/users/register" 
                    className={`text-[#414141] font-semibold pr-1 hover:underline`}>Register Now</Link></div>
                </div>}

                {/* Google login button */}
                { !isVolunteer && <div className="input-field flex flex-col px-3 py-1">
                    <button
                    onClick={handleGoogleLogin}
                    type='button'
                    className={`transition-all w-full duration-300 bg-[#688D48] px-3 py-2 text-white text-xl outline-none`}>
                        <span className='opacity-50 pr-5 text-sm'>OR</span><span>Login with</span> <span className='font-semibold'>Google</span>
                    </button>
                </div>}

            </form>
      </div>
    </div>
    </>
  )
}

export default LoginPage;