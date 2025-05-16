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
  const [formErrors, setFormErrors] = useState<any>(initialData);
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

    let hasError = false;

    const newFormErrors = { ...formErrors };

    Object.keys(formData).forEach((field: any) => {
      const validationResult = validateForm(field, formData[field]);
      if (validationResult?.error) {
        newFormErrors[field] = validationResult.error;
        hasError = true;
      } else {
        newFormErrors[field] = '';
      }
    });

    setFormErrors(newFormErrors);

    if (hasError) return;

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
        <div className={`fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 ${showForgotModal ? 'opacity-100' : 'opacity-0'
          }`}>
          <div className={`bg-white bg-opacity-90 transition-all duration-300 rounded-xl p-3 px-5 ${showForgotModal ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
            }`}>
            <div className="header flex items-center justify-start gap-x-5">
              <h2 className="text-2xl font-bold mb-1">Forgot <span className='font-normal'>Password</span></h2>
            </div>
            {forgotError && <p className='opacity-90 font-semibold text-red-500 text-sm py-2 pb-3'>{forgotError}</p>}
            <form onSubmit={handleForgotPassword}>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="Enter your email"
                className={`transition-all duration-300 bg-transparent px-3 py-2 my-2 text-xl font-semibold border-b-[3px] bg-white ${forgotError || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none`}
              />
              <div className="btns flex gap-x-1">
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
          <div className='login-title flex items-center justify-start gap-x-4 p-4 pb-8 text-4xl font-bold'>
            <h2 className={`text-[#414141]`}>Login <span className='font-light'>here</span></h2>
            {isLoading &&
              <DotLottieReact
                src="https://lottie.host/525ff46b-0a14-4aea-965e-4b22ad6a8ce7/wGcySY4DHd.lottie"
                loop
                autoplay
                style={{ width: "30px", height: "50px", paddingTop: "15px" }}
              />}
          </div>

          {/* Are you a volunteer? */}
          <div className='login-title flex items-center justify-center mx-4 mb-1'>
            <button className={`${!isVolunteer ? 'bg-[#688D48]' : ''} w-[50%] flex gap-x-2 items-center justify-center`}
              onClick={() => toggleRole(false)}
            >
              {!isVolunteer && <SiTicktick className='text-white' />}
              <h2 className={`text-black ${!isVolunteer ? 'text-white' : 'font-semibold'}`}>Not a volunteer</h2>
            </button>
            <button className={`${isVolunteer ? 'bg-[#688D48]' : ''} w-[50%] flex gap-x-2 items-center justify-center`}
              onClick={() => toggleRole(true)}
            >
              {isVolunteer && <SiTicktick className='text-white' />}
              <h2 className={`text-black ${isVolunteer ? 'text-white' : 'font-semibold'}`}>I am a volunteer</h2>
            </button>
          </div>

          {errorMessage && <span className='p-3 opacity-90 font-semibold text-red-500'>{errorMessage}</span>}
          <hr className='opacity-100' />

          <form onSubmit={handleLogin} className='py-3'>

            <div className="input-field flex flex-col p-3 pt-0 gap-y-1">
              {formErrors.email ? <label htmlFor="email" className='opacity-90 font-semibold text-red-500'>{formErrors.email}</label>
                : <label htmlFor="email" className='opacity-75 font-semibold'>Email</label>}
              <input
                type="text"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`transition-all duration-300 bg-transparent px-3 py-2 text-xl font-semibold border-b-[3px] bg-white ${formErrors.email || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none`} />

            </div>

            <div className="relative input-field flex flex-col p-3 pt-0 gap-y-2">
              {formErrors.password ? <label htmlFor="password" className='opacity-90 font-semibold text-red-500'>{formErrors.password}</label>
                : <label htmlFor="password" className='opacity-75 font-semibold'>Password</label>}
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`transition-all duration-300 bg-transparent px-3 py-2  text-xl font-semibold border-b-[3px] bg-white ${formErrors.password || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none`} />

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
            {!isVolunteer &&
              <div className="btns flex items-center justify-between mx-3 mb-2 mt-2">
                <div className='new-user text-[14px]'><span className='opacity-60 pr-2'>Not Registered?</span><Link to="/user/register"
                  className={`text-[#414141] font-semibold pr-1 hover:underline`}>Register Now</Link></div>
              </div>}

            {/* Google login button */}
            {!isVolunteer && <div className="input-field flex flex-col px-3 py-1">
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