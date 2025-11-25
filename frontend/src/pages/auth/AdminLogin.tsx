import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { login } from '../../redux/slices/authSlice'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import bgDark_1_img from '../../assets/bg-darkGreen-1.jpeg';
import logo from '../../assets/Logo.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { validateForm } from '../../utils/validation';
import { Fields } from '../../interfaces/formInterface';
import { authService } from '../../services/auth.service';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const AdminLoginPage: React.FC = () => {

  const initialFormData = {
    email: '',
    password: ''
  }

  const [formData, setFormData] = useState<any>(initialFormData);
  const [formErrors, setFormErrors] = useState<any>(initialFormData);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Toggle password eye
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle Input change
  const handleInputChange = (field: keyof Fields, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  }

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
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
      const response = await authService.adminLogin(formData);

      if (response.status !== 200) {
        return setErrorMessage(response.data.message);
      }

      if (response.data) {
        const { user, accessToken } = response.data;

        dispatch(login({ userId: user.id, accessToken, role: user.role }));
        
        navigate('/admin/dashboard');
        return;
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'An error occurred';
        setErrorMessage(errorMessage);
      } else {
        console.error('Login failed:', error);
        setErrorMessage('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* Main container */}
      <div className="main-container relative w-full min-h-screen flex flex-col lg:flex-row items-center justify-center lg:justify-between text-[#222222] bg-cover bg-center px-4 sm:px-8 md:px-12 lg:px-20 py-8"
        style={{ backgroundImage: `url(${bgDark_1_img})` }}
      >
        {/* Logo */}
        <div className="logo absolute top-4 left-4 sm:top-8 sm:left-8 lg:top-16 lg:left-28 z-10">
          <img src={logo} alt="logo" className="h-12 sm:h-16 w-auto" />
        </div>

        {/* Left text */}
        <div className="textContainer hidden lg:flex max-w-[45%] mx-4 xl:mx-20">
          <h2 className='text-white text-3xl xl:text-5xl font-bold leading-tight'>
            "You can always, always give something, even if it is only kindness!"
          </h2>
        </div>

        {/* Login Form */}
        <div className="login-form bg-white bg-opacity-80 sm:bg-opacity-80 transition-all duration-300 rounded-xl w-full max-w-sm sm:max-w-md lg:max-w-sm xl:w-[400px] p-4 sm:p-5 mt-20 lg:mt-0 lg:mr-8 xl:mr-24">

          <div className='login-title flex items-end justify-start gap-x-4 p-2 sm:p-4 pb-4 sm:pb-8 text-2xl sm:text-3xl md:text-4xl font-bold'>
            <h2 className="text-[#414141]">Login <span className='font-light'>here</span></h2>
            {isLoading &&
              <DotLottieReact
                src="https://lottie.host/525ff46b-0a14-4aea-965e-4b22ad6a8ce7/wGcySY4DHd.lottie"
                loop
                autoplay
                style={{ width: "30px", height: "50px", paddingTop: "15px" }}
              />}
          </div>

          <hr />

          {errorMessage && (
            <span className='block p-3 opacity-90 font-semibold text-red-500 text-sm sm:text-base'>
              {errorMessage}
            </span>
          )}
          <hr className='opacity-100' />

          <form onSubmit={handleLogin} className='py-3'>
            {/* Email Field */}
            <div className="input-field flex flex-col p-3 pt-0 gap-y-1">
              {formErrors.email ? (
                <label htmlFor="email" className='opacity-90 font-semibold text-red-500 text-sm sm:text-base'>
                  {formErrors.email}
                </label>
              ) : (
                <label htmlFor="email" className='opacity-75 font-semibold text-sm sm:text-base'>
                  Email
                </label>
              )}
              <input
                type="text"
                name="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`transition-all duration-300 bg-transparent px-3 py-2 text-lg sm:text-xl font-semibold border-b-[3px] bg-white ${formErrors.email || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none`}
              />
            </div>

            {/* Password Field */}
            <div className="relative input-field flex flex-col p-3 pt-0 gap-y-2">
              {formErrors.password ? (
                <label htmlFor="password" className='opacity-90 font-semibold text-red-500 text-sm sm:text-base'>
                  {formErrors.password}
                </label>
              ) : (
                <label htmlFor="password" className='opacity-75 font-semibold text-sm sm:text-base'>
                  Password
                </label>
              )}
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`transition-all duration-300 bg-transparent px-3 py-2 text-lg sm:text-xl font-semibold border-b-[3px] bg-white ${formErrors.password || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none`}
              />

              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-5 sm:right-7 top-10 sm:top-11 text-lg sm:text-xl text-gray-600 hover:text-gray-800 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Submit button */}
            <div className="input-field flex flex-col px-3 py-1 mt-5">
              <button
                type='submit'
                className='transition-all w-full duration-300 bg-[#688D48] hover:bg-[#577A3A] px-3 py-2 sm:py-3 text-white text-lg sm:text-xl outline-none font-semibold rounded-md'
              >
                Submit
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Quote - Shown only on small screens */}
        <div className="lg:hidden text-center mt-8 px-4 max-w-lg">
          <p className='text-white text-lg sm:text-xl font-semibold drop-shadow-lg'>
            "You can always, always give something, even if it is only kindness!"
          </p>
        </div>
      </div>
    </>
  )
}

export default AdminLoginPage;