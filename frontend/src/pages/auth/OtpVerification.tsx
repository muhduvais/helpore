

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios';
import bgDark_1_img from '../../assets/bg-darkGreen-1.jpeg';
import logo from '../../assets/Logo.png';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authService } from '../../services/auth.service';

const LoginPage: React.FC = () => {

  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [count, setCount] = useState(30);

  const navigate = useNavigate();

  // Resend Otp
  const resendOtp = async () => {
    if (count !== 0) return;
    const response = await authService.resendOtp(email);
    if (response.data.success) {
      setCount(30);
      toast.success('A new OTP has been sent to your email!');
    }
  }

  // Set resend count-down
  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        } else {
          return prev - 1;
        }
      })
    }, 1000);

    return () => clearInterval(timer);
  }, [resendOtp]);

  // Otp verification
  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    const inputOtp = otp.trim();

    setOtpMessage('');

    let isValid = true;

    if (!inputOtp) {
      setOtpMessage('Please enter the Otp!');
      isValid = false;
    }

    if (isValid) {

      try {
        const response = await authService.verifyOtp(email, otp);

        if (response.status !== 200) {
          return setOtpMessage(response.data.message);
        }
        toast.success('Successfully verified your email, now you can login!', {
          onClose: () => navigate('/user/login')
        });

      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          const errorMessage = error.response?.data?.message || 'An error occurred';
          setOtpMessage(errorMessage);
        } else {
          console.error('Verification failed:', error);
          setOtpMessage('An unexpected error occurred');
        }
      }
    }
  };

  return (
    <>
      <div className={`main-container relative w-[100vw] h-[100vh] flex items-center justify-between text-[#222222] bg-cover bg-center px-20`}
        style={{ backgroundImage: `url(${bgDark_1_img})` }}
      >
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
        <div className="logo absolute top-16 left-28">
          <img src={logo} alt="logo" />
        </div>

        {/* Left text */}
        <div className="textContainer max-w-[45%] mx-20">
          <h2 className='text-white text-5xl font-bold'>“You can always, always give something, even if it is only kindness!”</h2>
        </div>

        <div className={`login-form bg-white bg-opacity-80 transition-all duration-300 rounded-xl max-w-sm w-[400px] p-2 px-5 mr-24`}>
          <div className='login-title flex items-center justify-start gap-x-2 p-4 pb-4 text-3xl font-bold'>
            <h2 className={`text-[#414141]`}>Verify <span className='font-light'>Otp</span></h2>
          </div>
          <p className='px-4 pb-1 text-sm text-gray-500'>An otp has sent to your mail <span className='text-black font-semibold'>{email}</span></p>
          <hr className='opacity-100' />

          <form onSubmit={handleVerification} className='py-3'>

            <div className="input-field flex flex-col p-3 gap-y-1">
              {otpMessage ? <label htmlFor="email" className='opacity-90 font-semibold text-red-500'>{otpMessage}</label>
                : <label htmlFor="email" className='opacity-75 font-semibold'>Enter the Otp</label>}
              <input
                type="text"
                name="email"
                id="email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={`transition-all duration-300 bg-transparent px-3 py-2 text-xl font-semibold border-b-[3px] bg-white ${otpMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none`} />
            </div>

            <div className="input-field flex px-3 py-1">
              <button
                onClick={resendOtp}
                className={`${count !== 0 ? 'opacity-70' : 'font-semibold'} pr-1`}
                type='button'
              >Resent otp</button>
              <span className={`${count === 0 ? 'hidden' : ''}`}>in {count} seconds</span>
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