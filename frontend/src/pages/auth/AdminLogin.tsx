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

const AdminLoginPage: React.FC = () => {

  const initialFormData = {
    email: '',
    password: ''
  }

  const [formData, setFormData] = useState<any>(initialFormData);
  const [formErrors, setFormErrors] = useState<any>(initialFormData);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // if (isLoggedIn && role === 'admin') {
  //   return <Navigate to={'/admin/dashboard'} />
  // }

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
              {formErrors.email ? <label htmlFor="email" className='opacity-90 font-semibold text-red-500'>{formErrors.email}</label>
                : <label htmlFor="email" className='opacity-75 font-semibold'>Email</label>}
              <input
                type="text"
                name="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
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
                onChange={(e) => handleInputChange('password', e.target.value)}
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