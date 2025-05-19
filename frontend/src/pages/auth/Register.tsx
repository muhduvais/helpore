import { useState } from 'react'
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
import bgDark_1_img from '../../assets/bg-darkGreen-1.jpeg';
import logo from '../../assets/Logo.png';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { authService } from '../../services/auth.service';
import { validateForm } from '../../utils/validation';
import axios from 'axios';
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
      if (axios.isAxiosError(error)) {
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
      if (axios.isAxiosError(error)) {
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
      <div className="main-container relative w-full min-h-screen flex flex-col md:flex-row items-center justify-center text-[#222222] bg-cover bg-center p-4 md:p-6 lg:px-12 xl:px-20"
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
          <div className='login-title flex items-center justify-start gap-x-2 p-2 sm:p-4 pb-4 sm:pb-8 text-2xl sm:text-3xl md:text-4xl font-bold'>
            <h2 className="text-[#414141] pr-2">Register <span className='font-light'>here</span></h2>
            {isLoading &&
              <DotLottieReact
                src="https://lottie.host/525ff46b-0a14-4aea-965e-4b22ad6a8ce7/wGcySY4DHd.lottie"
                loop
                autoplay
                style={{ width: "30px", height: "50px", paddingTop: "15px" }}
              />}
          </div>

          {errorMessage && <span className='p-2 sm:p-3 opacity-90 font-semibold text-red-500 text-sm'>{errorMessage}</span>}
          <hr className='opacity-100' />

          <form onSubmit={handleSignup} className='py-2 sm:py-3'>

            <div className="input-field flex flex-col px-2 sm:px-3 pt-0 gap-y-1">
              {formErrors.name ? <label htmlFor="name" className='opacity-90 font-semibold text-red-500 text-sm'>{formErrors.name}</label>
                : <label htmlFor="name" className='opacity-75 font-semibold text-sm'>Name</label>}
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`transition-all duration-300 bg-transparent px-3 py-2 text-base sm:text-lg md:text-xl font-semibold border-b-[3px] bg-white ${formErrors.name || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none w-full`} />
            </div>

            <div className="input-field flex flex-col p-2 pb-0 sm:p-3 sm:pb-0 pt-0 gap-y-1">
              {formErrors.email ? <label htmlFor="email" className='opacity-90 font-semibold text-red-500 text-sm'>{formErrors.email}</label>
                : <label htmlFor="email" className='opacity-75 font-semibold text-sm'>Email</label>}
              <input
                type="text"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`transition-all duration-300 bg-transparent px-3 py-2 text-base sm:text-lg md:text-xl font-semibold border-b-[3px] bg-white ${formErrors.email || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none w-full`} />
            </div>

            <div className="input-field flex flex-col p-2 sm:p-3 pt-0 gap-y-1 sm:gap-y-2">
              {formErrors.password ? <label htmlFor="password" className='opacity-90 font-semibold text-red-500 text-sm'>{formErrors.password}</label>
                : <label htmlFor="password" className='opacity-75 font-semibold text-sm'>Password</label>}
              <div className="relative w-full">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`transition-all duration-300 bg-transparent px-3 py-2 text-base sm:text-lg md:text-xl font-semibold border-b-[3px] bg-white ${formErrors.password || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none w-full`} />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-lg sm:text-xl text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div className="input-field flex flex-col px-2 sm:px-3 py-1">
              <button
                type='submit'
                className={`transition-all w-full duration-300 bg-[#688D48] px-3 py-2 text-white text-lg sm:text-xl outline-none font-semibold`}>
                Submit
              </button>
            </div>

            {/* Already registered button */}
            <div className="btns flex items-center justify-between mx-2 sm:mx-3 mb-2 mt-2">
              <div className='new-user text-xs sm:text-sm'><span className='opacity-60 pr-2'>Already Registered?</span><Link to="/user/login"
                className={`text-[#414141] font-semibold pr-1 hover:underline`}>Login Now</Link></div>
            </div>

            {/* Google login button */}
            <div className="input-field flex flex-col px-2 sm:px-3 py-1">
              <button
                onClick={handleGoogleLogin}
                type='button'
                className={`transition-all w-full duration-300 bg-[#688D48] px-3 py-2 text-white text-base sm:text-lg md:text-xl outline-none`}>
                <span className='opacity-50 pr-3 sm:pr-5 text-xs sm:text-sm'>OR</span><span>Login with</span> <span className='font-semibold'>Google</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  )
}

export default SignupPage;