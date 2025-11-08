import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { login } from '../../redux/slices/authSlice'
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
import axios from 'axios';
import bgDark_1_img from '../../assets/bg-darkGreen-1.jpeg';
import logo from '../../assets/Logo.png';
import { toast } from 'sonner';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { SiTicktick } from "react-icons/si";
import { RootState } from '../../redux/store';
import { useSelector } from 'react-redux';
import { validateForm } from '../../utils/validation';
import { authService } from '../../services/auth.service';
import { authController } from '../../controllers/authController';

const LoginPage: React.FC = () => {

  const [roleParams] = useSearchParams();

  const loginRole = roleParams.get("role") === 'volunteer' ? true : false;

  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const role = useSelector((state: RootState) => state.auth.role);
  const isBlocked = useSelector((state: RootState) => state.auth.isBlocked);

  if (isLoggedIn && !isBlocked) {
    if (role === 'user') {
      return <Navigate to={'/user'} />
    } else if (role === 'volunteer') {
      return <Navigate to={'/volunteer/dashboard'} />
    }
  }

  const initialData = {
    email: '',
    password: ''
  }

  const [formData, setFormData] = useState<any>(initialData);
  const [isLoading, setIsLoading] = useState<any>(false);

  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isVolunteer, setIsVolunteer] = useState(loginRole);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Toggle role
  const toggleRole = (value: boolean) => {
    setIsVolunteer(value);
    setFormData(initialData);
    setErrorMessage('');
  }

  // Handle Input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedRole = isVolunteer ? 'volunteer' : 'user';

    setIsLoading(true);

    try {
      const response = await authService.login(formData, selectedRole);
      if (response?.status === 200) {
        const { user, accessToken } = response.data;
        dispatch(login({ userId: user.id, accessToken, role: user.role }));

        if (user.role === 'user') {
          navigate('/user');
        } else {
          navigate('/volunteer/dashboard');
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          setErrorMessage(error.response?.data?.message || 'Invalid email or password!');
        } else if (error.response?.status === 401) {
          setErrorMessage('Your access is blocked!');
        }
      } else {
        setErrorMessage('An unexpected error occured!');
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      const response = await authController.handleGoogleLogin();

      if (!response.success) {
        setErrorMessage(response.message);
        return;
      }

      const { user: userData, accessToken } = response;

      dispatch(login({ userId: userData.id, accessToken, role: userData.role }));

      const navigateTo = location.state?.from || '/user';
      navigate(navigateTo);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setErrorMessage(error.response?.data?.message || 'An error occurred');
        }
      } else {
        console.error('Google login failed:', error);
        setErrorMessage('Google login failed. Please try again.');
      }
    }
  };

  // Handle Forgot password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    let hasError = false;

    const validationResult = validateForm('email', forgotEmail);
    if (validationResult?.error) {
      setForgotError(validationResult.error);
      hasError = true;
    } else {
      setForgotError('');
    }

    if (hasError) {
      return;
    }

    setIsLoading(true);

    try {
      setForgotError('');
      const response = await authService.forgotPassword(forgotEmail);
      if (response.status !== 200) {
        return setForgotError(response.data.message);
      }

      if (response.status === 200) {
        toast.success('Reset link has sent to your email!');
        setShowForgotModal(false);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        setForgotError(errorMessage || 'Bad request!');
      } else {
        setForgotError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <>
      {/* Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <div className="bg-white bg-opacity-90 transition-all duration-300 rounded-xl p-3 px-5 w-full max-w-md">
            <div className="header flex items-center justify-start gap-x-5">
              <h2 className="text-xl md:text-2xl font-bold mb-1">Forgot <span className='font-normal'>Password</span></h2>
            </div>
            {forgotError && <p className='opacity-90 font-semibold text-red-500 text-sm py-2 pb-3'>{forgotError}</p>}
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter your email"
                className={`transition-all duration-300 bg-transparent px-3 py-2 my-2 text-lg md:text-xl font-semibold border-b-[3px] bg-white w-full ${forgotError || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none`}
              />
              <div className="btns flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleForgotPassword}
                  className={`w-full p-2 bg-[#688D48] text-white mt-2 ${isLoading ? 'opacity-80' : ''}`}
                  disabled={isLoading}
                >
                  Send Reset Link
                </button>
                <button
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotError('');
                    setErrorMessage('');
                    setIsLoading(false);
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
      <div className={`main-container relative w-full min-h-screen flex flex-col md:flex-row items-center justify-center text-[#222222] bg-cover bg-center p-4 md:p-6 lg:px-12 xl:px-20 ${showForgotModal ? 'blur-[3px]' : ''}`}
        style={{ backgroundImage: `url(${bgDark_1_img})` }}
      >
        <div className="top-part flex flex-col items-center sm:items-start justify-center sm:gap-y-4">
          <div className="logo">
            <img src={logo} alt="logo" className="h-10 sm:h-12 md:h-auto" />
          </div>

          {/* text */}
          <div className="textContainer w-full md:max-w-[65%] mx-4 md:mx-8 md:mt-0 mb-8 md:mb-0">
            <h2 className='text-gray-300 text-center sm:text-start text-lg sm:text-3xl md:text-4xl lg:text-5xl font-normal italic'>"You can always, always give something, even if it is only kindness!"</h2>
          </div>
        </div>

        <div className="login-form bg-white bg-opacity-80 transition-all duration-300 rounded-xl w-full max-w-sm mx-auto md:mr-8 lg:mr-16 xl:mr-24 p-3 px-5">
          <div className='login-title flex items-center justify-start gap-x-4 p-2 sm:p-4 pb-4 sm:pb-8 text-2xl sm:text-3xl md:text-4xl font-bold'>
            <h2 className="text-[#414141]">Login <span className='font-light'>here</span></h2>
            {isLoading &&
              <DotLottieReact
                src="https://lottie.host/525ff46b-0a14-4aea-965e-4b22ad6a8ce7/wGcySY4DHd.lottie"
                loop
                autoplay
                style={{ width: "30px", height: "50px", paddingTop: "15px" }}
              />}
          </div>

          {/* Are you a volunteer? */}
          <div className='login-title flex items-center justify-center mx-2 sm:mx-4 mb-1'>
            <button className={`${!isVolunteer ? 'bg-[#688D48]' : ''} w-[50%] flex gap-x-2 items-center justify-center py-1`}
              onClick={() => toggleRole(false)}
            >
              {!isVolunteer && <SiTicktick className='text-white' />}
              <h2 className={`text-black text-sm sm:text-base ${!isVolunteer ? 'text-white' : 'font-semibold'}`}>Not a volunteer</h2>
            </button>
            <button className={`${isVolunteer ? 'bg-[#688D48]' : ''} w-[50%] flex gap-x-2 items-center justify-center py-1`}
              onClick={() => toggleRole(true)}
            >
              {isVolunteer && <SiTicktick className='text-white' />}
              <h2 className={`text-black text-sm sm:text-base ${isVolunteer ? 'text-white' : 'font-semibold'}`}>I am a volunteer</h2>
            </button>
          </div>

          {errorMessage && <span className='p-2 sm:p-3 opacity-90 font-semibold text-red-500 text-sm'>{errorMessage}</span>}
          <hr className='opacity-100' />

          <form onSubmit={handleLogin} className='py-2 sm:py-3'>

            <div className="input-field flex flex-col p-2 sm:p-3 pt-0 gap-y-1">
              <label htmlFor="email" className='opacity-75 font-semibold text-sm'>Email</label>
              <input
                type="text"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`transition-all duration-300 bg-transparent px-3 py-2 text-base sm:text-lg md:text-xl font-semibold border-b-[3px] bg-white border-[#fff] border-opacity-60 focus:border-opacity-75 outline-none`} />

            </div>

            <div className="relative input-field flex flex-col p-2 sm:p-3 pt-0 gap-y-1 sm:gap-y-2">
              <label htmlFor="password" className='opacity-75 font-semibold text-sm'>Password</label>
              <div className="relative w-full">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`transition-all duration-300 bg-transparent px-3 py-2 text-base sm:text-lg md:text-xl font-semibold border-b-[3px] bg-white border-[#fff] border-opacity-60 focus:border-opacity-75 outline-none w-full`} />

                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-3 text-lg sm:text-xl text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="btns flex items-center justify-between mx-2 sm:mx-3 mb-2 mt-2 sm:mt-3">
              <div className='new-user text-xs sm:text-sm'><button
                type='button'
                className={`text-[#767676] font-semibold pr-1 hover:underline`}
                onClick={() => setShowForgotModal(true)}
              >Forgot password?</button></div>
            </div>

            {/* Submit button */}
            <div className="input-field flex flex-col px-2 sm:px-3 py-1">
              <button
                type='submit'
                className={`transition-all w-full duration-300 bg-[#688D48] px-3 py-2 text-white text-lg sm:text-xl outline-none font-semibold`}>
                Submit
              </button>
            </div>

            {/* Register now button */}
            {!isVolunteer &&
              <div className="btns flex items-center justify-between mx-2 sm:mx-3 mb-2 mt-2">
                <div className='new-user text-xs sm:text-sm'><span className='opacity-60 pr-2'>Not Registered?</span><Link to="/user/register"
                  className={`text-[#414141] font-semibold pr-1 hover:underline`}>Register Now</Link></div>
              </div>}

            {/* Google login button */}
            {!isVolunteer && <div className="input-field flex flex-col px-2 sm:px-3 py-1">
              <button
                onClick={handleGoogleLogin}
                type='button'
                className={`transition-all w-full duration-300 bg-[#688D48] px-3 py-2 text-white text-base sm:text-lg md:text-xl outline-none`}>
                <span className='opacity-50 pr-3 sm:pr-5 text-xs sm:text-sm'>OR</span><span>Login with</span> <span className='font-semibold'>Google</span>
              </button>
            </div>}

          </form>
        </div>
      </div>
    </>
  )
}

export default LoginPage;