import React, { useState } from 'react'
import axios from '../utils/urlProxy'
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios';
import bgDark_1_img from '../assets/bg-darkGreen-1.jpeg';
import logo from '../assets/Logo.png';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface SignupResponse {
  registeredMail: string;
  message: string;
}

const SignupPage: React.FC = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameMessage, setNameMessage] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    const validate = (email: string) => {
      return (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).test(email);
    };

    const inputPassword = password.trim();

    setNameMessage('');
    setEmailMessage('');
    setPasswordMessage('');

    let isValid = true;

    if (!name) {
      setEmailMessage('Please enter your name');
      isValid = false;
    }

    if (!email) {
        setEmailMessage('Please enter the email');
        isValid = false;
    } else if (!validate(email)) {
      setEmailMessage('Please enter a valid email');
      isValid = false;
    }

    if (!inputPassword) {
        setPasswordMessage('Please enter the password');
        isValid = false;
    } else if (inputPassword.length < 6) {
        setPasswordMessage('Minimum 6 characters');
        isValid = false;
    }

    if (isValid) {
        setIsLoading(true);
        try {
            const response = await axios.post<SignupResponse>('/api/auth/users/register', { 
                name,
                email, 
                password: inputPassword 
            });

            if (response.status !== 201) {
                return setErrorMessage(response.data.message);
            }

            if (response.data) {
              const { registeredMail } = response.data;
              navigate(`/users/verifyOtp?email=${registeredMail}`);
            }
        } catch (error: unknown) {
          if (error instanceof AxiosError) {
            const errorMessage = error.response?.data?.message || 'An error occurred';
            setErrorMessage(errorMessage);
          } else {
            console.error('Registration failed:', error);
            setErrorMessage('An unexpected error occurred');
          }
        } finally {
          setIsLoading(false);
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
        <hr className='opacity-100'/>
        
            <form onSubmit={handleSignup} className='py-3'>

                <div className="input-field flex flex-col p-3 pt-0 gap-y-1">
                    {nameMessage ? <label htmlFor="name" className='opacity-90 font-semibold text-red-500'>{nameMessage}</label>
                    : <label htmlFor="name" className='opacity-75 font-semibold'>Name</label>}
                    <input
                    type="text" 
                    name="name" 
                    id="name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`transition-all duration-300 bg-transparent px-3 py-2 text-xl font-semibold border-b-[3px] bg-white ${nameMessage || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>
                </div>

                <div className="input-field flex flex-col p-3 pt-0 gap-y-1">
                    {emailMessage ? <label htmlFor="email" className='opacity-90 font-semibold text-red-500'>{emailMessage}</label>
                    : <label htmlFor="email" className='opacity-75 font-semibold'>Email</label>}
                    <input
                    type="text" 
                    name="email" 
                    id="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`transition-all duration-300 bg-transparent px-3 py-2 text-xl font-semibold border-b-[3px] bg-white ${emailMessage || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>
                </div>

                <div className="input-field flex flex-col p-3 pt-0 gap-y-2">
                    {passwordMessage ? <label htmlFor="password" className='opacity-90 font-semibold text-red-500'>{passwordMessage}</label>
                    : <label htmlFor="password" className='opacity-75 font-semibold'>Password</label>}
                    <input 
                    type="password" 
                    name="password" 
                    id="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`transition-all duration-300 bg-transparent px-3 py-2  text-xl font-semibold border-b-[3px] bg-white ${passwordMessage || errorMessage ? 'border-red-500' : 'border-[#fff]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>
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
                    <div className='new-user text-[14px]'><span className='opacity-60 pr-2'>Already Registered?</span><Link to="/users/login" 
                    className={`text-[#414141] font-semibold pr-1 hover:underline`}>Login Now</Link></div>
                </div>

                {/* Google login button */}
                <div className="input-field flex flex-col px-3 py-1">
                    <button
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