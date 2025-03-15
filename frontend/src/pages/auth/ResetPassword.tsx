import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AxiosError } from 'axios';
import bgDark_1_img from '../../assets/bg-darkGreen-1.jpeg';
import logo from '../../assets/Logo.png';
import { toast } from 'sonner';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { authService } from '../../services/auth.service';

const LoginPage: React.FC = () => {

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmpassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [confirmPasswordMessage, setConfirmPasswordMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const togglePassword1Visibility = () => {
    setShowPassword1(!showPassword1);
  };

  const togglePassword2Visibility = () => {
    setShowPassword2(!showPassword2);
  };

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setErrorMessage('Invalid or missing reset token');
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const inputPassword = password.trim();
    const inputConfirmPassword = confirmPassword.trim();

    setPasswordMessage('');
    setConfirmPasswordMessage('');

    let isValid = true;

    const validatePassword = (password: string) => {
      return (/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/).test(password);
    };

    if (!inputPassword) {
        setPasswordMessage('Please enter the password');
        isValid = false;
    } else if (inputPassword.length < 8) {
      setPasswordMessage('Minimum 8 characters');
      isValid = false;
    } else if (!validatePassword(inputPassword)) {
        setErrorMessage('Include numbers and a special characters!');
        isValid = false;
    }

    if (!inputConfirmPassword) {
        setConfirmPasswordMessage('Please confirm the password');
        isValid = false;
    } else if (inputConfirmPassword !== inputPassword) {
        setErrorMessage('Passwords do not match!');
        isValid = false;
    }

    if (isValid) {

        try {
            const response = await authService.resetPassword(token, password.trim());

            if (response.status !== 200) {
                return setErrorMessage(response.data.message);
            }

            if (response.data) {
              toast.success("Password reset successfully!", {
                duration: 3000,
                onAutoClose: () => navigate("/user/login")
              });
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
            <h2 className={`text-[#414141]`}>Reset <span className='font-light'>password</span></h2>
        </div>
        {errorMessage && <span className='p-3 opacity-90 font-semibold text-red-500'>{errorMessage}</span>}
        <hr className='opacity-100'/>
        
            <form onSubmit={handleResetPassword} className='py-3'>

                <div className="relative input-field flex flex-col p-3 pt-0 gap-y-1">
                    {passwordMessage ? <label htmlFor="password" className='opacity-90 font-semibold text-red-500'>{passwordMessage}</label>
                    : <label htmlFor="password" className='opacity-75 font-semibold'>New Password</label>}
                    <input
                    type={showPassword1 ? 'text' : 'password'} 
                    name="password" 
                    id="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`transition-all duration-300 bg-transparent px-3 py-2 text-xl font-semibold border-b-[3px] bg-white ${passwordMessage || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>

                    <button
                        type="button"
                        onClick={togglePassword1Visibility}
                        className="absolute right-7 top-11 text-xl text-gray-600"
                    >
                        {showPassword1 ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>

                <div className="relative input-field flex flex-col p-3 pt-0 gap-y-2">
                    {confirmPasswordMessage ? <label htmlFor="confirmPassword" className='opacity-90 font-semibold text-red-500'>{confirmPasswordMessage}</label>
                    : <label htmlFor="confirmPassword" className='opacity-75 font-semibold'>Confirm Password</label>}
                    <input 
                    type={showPassword2 ? 'text' : 'password'} 
                    name="confirmPassword" 
                    id="confirmPassword" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmpassword(e.target.value)}
                    className={`transition-all duration-300 bg-transparent px-3 py-2  text-xl font-semibold border-b-[3px] bg-white ${confirmPasswordMessage || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>

                    <button
                        type="button"
                        onClick={togglePassword2Visibility}
                        className="absolute right-7 top-11 text-xl text-gray-600"
                    >
                        {showPassword2 ? <FaEyeSlash /> : <FaEye />}
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

            </form>
      </div>
    </div>
    </>
  )
}

export default LoginPage;