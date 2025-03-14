import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
import bgDark_1_img from '../../assets/bg-darkGreen-1.jpeg';
import logo from '../../assets/Logo.png';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { authService } from '../../services/auth.service';
import { validateForm } from '../../utils/validation';
import { AxiosError } from 'axios';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import { authController } from '../../controllers/authController';

const SignupPage: React.FC = () => {

  const initialData = {
    name: '',
    email: '',
    password: ''
  }

  const [formData, setFormData] = useState<any>(initialData)
  const [formErrors, setFormErrors] = useState<any>(initialData)

  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Toggle password eye
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Handle input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  // Handle register
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const response = await authService.signup(formData);
      if (response?.status === 201) {
        navigate(`/user/verifyOtp?email=${response.data.registeredMail}`);
      } else {
        setErrorMessage(response?.data?.message || 'Registration failed');
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          setErrorMessage(error.response?.data?.message || 'Email is already registered!');
        }
      } else {
        setErrorMessage('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleLogin = async () => {

    try {
      const response = await authController.handleGoogleLogin();

      if (!response.success) {
        setErrorMessage(response.message);
        return;
      }

      const { user: userData, accessToken } = response;

      dispatch(login({ userId: userData.id, accessToken, role: userData.role }));

      navigate('/user');
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

  return (
    <>
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
            <h2 className={`text-[#414141] pr-2`}>Register <span className='font-light'>here</span></h2>
            {isLoading &&
              <DotLottieReact
                src="https://lottie.host/525ff46b-0a14-4aea-965e-4b22ad6a8ce7/wGcySY4DHd.lottie"
                loop
                autoplay
                style={{ width: "30px", height: "50px", paddingTop: "15px" }}
              />}
          </div>
          {errorMessage && <span className='p-3 opacity-90 font-semibold text-red-500'>{errorMessage}</span>}
          <hr className='opacity-100' />

          <form onSubmit={handleSignup} className='py-3'>

            <div className="input-field flex flex-col p-3 pt-0 gap-y-1">
              {formErrors.name ? <label htmlFor="name" className='opacity-90 font-semibold text-red-500'>{formErrors.name}</label>
                : <label htmlFor="name" className='opacity-75 font-semibold'>Name</label>}
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`transition-all duration-300 bg-transparent px-3 py-2 text-xl font-semibold border-b-[3px] bg-white ${formErrors.name || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none`} />
            </div>

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

            {/* Submit button */}
            <div className="input-field flex flex-col px-3 py-1">
              <button
                type='submit'
                className={`transition-all w-full duration-300 bg-[#688D48] px-3 py-2 text-white text-xl outline-none font-semibold`}>
                Submit
              </button>
            </div>

            {/* Register now button */}
            <div className="btns flex items-center justify-between mx-3 mb-2 mt-2">
              <div className='new-user text-[14px]'><span className='opacity-60 pr-2'>Already Registered?</span><Link to="/user/login"
                className={`text-[#414141] font-semibold pr-1 hover:underline`}>Login Now</Link></div>
            </div>

            {/* Google login button */}
            <div className="input-field flex flex-col px-3 py-1">
              <button
                onClick={handleGoogleLogin}
                type='button'
                className={`transition-all w-full duration-300 bg-[#688D48] px-3 py-2 text-white text-xl outline-none`}>
                <span className='opacity-50 pr-5 text-sm'>OR</span><span>Login with</span> <span className='font-semibold'>Google</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  )
}

export default SignupPage;