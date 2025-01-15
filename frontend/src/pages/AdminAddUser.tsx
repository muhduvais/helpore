import { useNavigate, Navigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice'
import { useDispatch } from 'react-redux'
import logo from '../assets/Logo-black.png'
import { MdDashboard, MdMessage } from "react-icons/md";
import { FaUsers, FaUserCircle, FaEyeSlash, FaEye, FaAngleLeft } from "react-icons/fa";
import { FaUsersLine, FaAngleRight  } from "react-icons/fa6";
import { IoNotifications } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { SignupResponse } from '../interfaces/authInterface';
import { customAxios } from '../utils/apiClient';
import { AxiosError } from 'axios';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { toast, ToastContainer } from 'react-toastify';

const userDashboard = () => {

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [pincode, setPincode] = useState('');
  const [password, setPassword] = useState('');
  const [nameMessage, setNameMessage] = useState('');
  const [ageMessage, setAgeMessage] = useState('');
  const [genderMessage, setGenderMessage] = useState('');
  const [phoneMessage, setPhoneMessage] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [fnameMessage, setFnameMessage] = useState('');
  const [lnameMessage, setLnameMessage] = useState('');
  const [streetMessage, setStreetMessage] = useState('');
  const [cityMessage, setCityMessage] = useState('');
  const [stateMessage, setStateMessage] = useState('');
  const [countryMessage, setCountryMessage] = useState('');
  const [pincodeMessage, setPincodeMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [isNext, setIsNext] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  }

  const validateEmail = (email: string) =>
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  
    const validateName = (name: string) =>
      /^[a-zA-Z ]{2,30}$/.test(name);
  
    const validatePassword = (password: string) =>
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(password);
  
    const validatePhone = (phone: string) =>
      /^[0-9]{10}$/.test(phone);

    const handleNextClick = () => {
      setNameMessage('');
      setEmailMessage('');
      setPasswordMessage('');
      setAgeMessage('');
      setGenderMessage('');
      setPhoneMessage('');
  
      const inputName = name.trim();
      const inputEmail = email.trim();
      const inputPhone = phone.trim();
      const inputAge = Number(age.trim());
      const inputgender = gender.trim();
      const inputPassword = password.trim();
  
      let isValid = true;
    
      // Validate Name
      if (!inputName) {
        setNameMessage('Please enter your name');
        isValid = false;
      } else if (!validateName(inputName)) {
        setNameMessage('Please enter a valid name');
        isValid = false;
      }
    
      // Validate Email
      if (!inputEmail) {
        setEmailMessage('Please enter the email');
        isValid = false;
      } else if (!validateEmail(email)) {
        setEmailMessage('Please enter a valid email');
        isValid = false;
      }
    
      // Validate Password
      if (!inputPassword) {
        setPasswordMessage('Please enter the password');
        isValid = false;
      } else if (inputPassword.length < 8) {
        setPasswordMessage('Minimum 8 characters');
        isValid = false;
      } else if (!validatePassword(inputPassword)) {
        setPasswordMessage('Include numbers and special characters!');
        isValid = false;
      }
    
      if (!inputAge) {
        setAgeMessage('Please enter your age');
        isValid = false;
      } else if (inputAge > 100 || inputAge < 0) {
        setAgeMessage('Please enter a valid age');
        isValid = false;
      }
    
      if (!inputgender) {
        setGenderMessage('Please select your gender');
        isValid = false;
      }
    
      if (!inputPhone) {
        setPhoneMessage('Please enter your phone number');
        isValid = false;
      } else if (!validatePhone(phone)) {
        setPhoneMessage('Please enter a valid 10-digit phone number');
        isValid = false;
      }

      if (isValid) {
        setIsNext(true);
      }
    }

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
  
    const inputName = name.trim();
    const inputPassword = password.trim();
  
    // Clear all messages
    setNameMessage('');
    setEmailMessage('');
    setPasswordMessage('');
    setAgeMessage('');
    setGenderMessage('');
    setPhoneMessage('');
    setFnameMessage('');
    setLnameMessage('');
    setStreetMessage('');
    setCityMessage('');
    setStateMessage('');
    setCountryMessage('');
    setPincodeMessage('');
  
    let isValid = true;
  
    // Validate Name
    if (!inputName) {
      setNameMessage('Please enter your name');
      isValid = false;
    } else if (!validateName(inputName)) {
      setNameMessage('Please enter a valid name');
      isValid = false;
    }
  
    // Validate Email
    if (!email) {
      setEmailMessage('Please enter the email');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailMessage('Please enter a valid email');
      isValid = false;
    }
  
    // Validate Password
    if (!inputPassword) {
      setPasswordMessage('Please enter the password');
      isValid = false;
    } else if (inputPassword.length < 8) {
      setPasswordMessage('Minimum 8 characters');
      isValid = false;
    } else if (!validatePassword(inputPassword)) {
      setPasswordMessage('Include numbers and special characters!');
      isValid = false;
    }
  
    if (!age) {
      setAgeMessage('Please enter your age');
      isValid = false;
    }
  
    if (!gender) {
      setGenderMessage('Please select your gender');
      isValid = false;
    }
  
    if (!phone) {
      setPhoneMessage('Please enter your phone number');
      isValid = false;
    } else if (!validatePhone(phone)) {
      setPhoneMessage('Please enter a valid 10-digit phone number');
      isValid = false;
    }
  
    if (!fname) {
      setFnameMessage('Please enter your first name');
      isValid = false;
    }
  
    if (!lname) {
      setLnameMessage('Please enter your last name');
      isValid = false;
    }
  
    if (!street) {
      setStreetMessage('Please enter your street address');
      isValid = false;
    }
  
    if (!city) {
      setCityMessage('Please enter your city');
      isValid = false;
    }
  
    if (!state) {
      setStateMessage('Please enter your state');
      isValid = false;
    }
  
    if (!country) {
      setCountryMessage('Please enter your country');
      isValid = false;
    }
  
    if (!pincode) {
      setPincodeMessage('Please enter your pincode');
      isValid = false;
    }
  
    if (isValid) {
      const formData = {
        name,
        email,
        password: inputPassword,
        age,
        gender,
        phone,
        fname,
        lname,
        street,
        city,
        state,
        country,
        pincode,
      }
      setIsLoading(true);
      try {
        const response = await customAxios.post<SignupResponse>('/api/admin/users', {
          formData
        });
  
        if (response.status !== 201) {
          return setErrorMessage(response.data.message);
        }
  
        if (response.data) {
          console.log('Response data: ', response.data); //
          toast.success('Successfully created the user!');
          setTimeout(() => {
            navigate(`/admin/userManagement`);
          }, 3000);
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
    
    <div className="main-container w-[100vw] h-[100vh] bg-[#F4F4F4]">
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

      {/* Sidebar */}
      <div className="sidebar fixed left-0 z-20 h-[100%] w-[240px] bg-[#F4F4F4] shadow-[10px_0_50px_rgba(0,0,0,0.2)] px-5 py-3 flex flex-col items-center justify-start">
        <div className="logo flex items-center justify-between mb-4">
          <img src={logo} alt="logo" />
        </div>
        <ul className="buttons w-[100%] flex flex-col gap-y-3">
          <li className=''><button className='bg-[#688D48] w-[100%] text-white px-4 py-2 text-start text-sm rounded flex items-center gap-x-2'>
            <MdDashboard/> <span>Dashboard</span>
          </button></li>
          <li><Link to="/admin/userManagement"><button className='bg-[#435D2C] w-[100%] text-white px-4 py-2 text-start text-sm rounded flex items-center gap-x-2'>
          <FaUsers/> <span>User Management</span>
          </button></Link></li>
          <li><Link to="/admin/volunteerManagement"><button className='bg-[#688D48] w-[100%] text-white px-4 py-2 text-start text-sm rounded flex items-center gap-x-2'>
          <FaUsersLine/> <span>Volunteer Management</span>
          </button></Link></li>
        </ul>
      </div>

      {/* Header */}
      <div className="header fixed top-0 w-[100%] h-[50px] bg-[#D9D9D9] z-0 flex items-center justify-end py-1 px-10 gap-x-5">
        <div className="comments">
          <button className='flex items-center justify-center'><MdMessage className='text-2xl text-[#5F5F5F] hover:text-[#000] transition-all duration-300 ease-in-out'/></button>
        </div>
        <div className="notifications">
        <button className='flex items-center justify-center'><IoNotifications className='text-2xl text-[#5F5F5F] hover:text-[#000] transition-all duration-300 ease-in-out' /></button>
        </div>
        <div className="profile">
        <button className='flex items-center justify-center'><FaUserCircle className='text-2xl text-[#5F5F5F] hover:text-[#000] transition-all duration-300 ease-in-out' /></button>
        </div>
        <button className='logout bg-[#fff] text-black py-1 px-3 rounded font-bold flex items-center justify-center gap-x-1'
        onClick={handleLogout}
        >
          <span>Logout</span>
          <IoMdLogOut className='text-[#5F5F5F] hover:text-[#000]'/>
        </button>
      </div>

      {/* Form container */}
      <div className="table-container flex flex-col items-center px-10 py-5 ml-[240px] pt-[50px]">
      
      <div className="w-[100%] top-part flex items-center justify-between mt-10 mb-5">

        {/* Bread Crumps */}
        <div className="bread-crumps flex items-center justify-center gap-x-2 text-sm">

          <Link to='/admin/userManagement' className="crumps flex items-center justify-center gap-x-1">
            <span className='text-[#454545]'>User Management</span>
            <FaAngleRight className='text-[#454545]' />
          </Link>

          <div className="crumps flex items-center justify-center gap-x-1 opacity-80">
            <span className='text-[#5F5F5F]'>Add User</span>
            <FaAngleRight className='text-[#5F5F5F]' />
          </div>

        </div>

      </div>

      {/* Login Form */}
      <div className={`login-form bg-white bg-opacity-80 transition-all duration-300 rounded-xl w-full max-w-[650px] p-3 px-5 mr-24 shadow-[10px_0_50px_rgba(0,0,0,0.2)]`}>
              <div className='login-title flex items-center justify-start gap-x-2 p-4 text-3xl font-bold'>
                  {!isNext ? <h2 className={`text-[#414141]`}>Create <span className='font-light'>User</span></h2> :
                  <h2 className={`text-[#414141]`}>Provide <span className='font-light'>Address</span></h2>}
                  {isLoading && 
                  <DotLottieReact
                    src="https://lottie.host/525ff46b-0a14-4aea-965e-4b22ad6a8ce7/wGcySY4DHd.lottie"
                    loop
                    autoplay
                    style={{ width: "30px", height: "50px", paddingTop: "15px", marginBottom: "14px" }}
                  />}
              </div>
      
              {errorMessage && <span className='p-3 opacity-90 font-semibold text-red-500'>{errorMessage}</span>}
              <hr className='opacity-100'/>
              
                  <form onSubmit={handleRegisterUser} className='py-3'>
      
                      {!isNext && <>
                      {/* Name, Age */}
                      <div className="input-row flex items-center justify-between">
                        <div className="input-field flex flex-col p-3 pt-0 gap-y-1 text-sm">
                            {nameMessage ? <label htmlFor="name" className='opacity-90 font-semibold text-red-500'>{nameMessage}</label>
                            : <label htmlFor="name" className='opacity-75 font-semibold'>Name</label>}
                            <input
                            type="text" 
                            name="name" 
                            id="name" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`transition-all duration-300 bg-transparent px-3 py-2 text-xl font-semibold border-[2px] bg-white ${nameMessage || errorMessage ? 'border-red-500' : 'border-[#5F5F5F]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>
                            
                        </div>
        
                        <div className="relative input-field flex flex-col p-3 pt-0 gap-y-1 text-sm">
                            {ageMessage ? <label htmlFor="age" className='opacity-90 font-semibold text-red-500'>{ageMessage}</label>
                            : <label htmlFor="age" className='opacity-75 font-semibold'>Age</label>}
                            <input 
                            type='text'
                            name="age" 
                            id="age" 
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className={`transition-all duration-300 bg-transparent px-3 py-2  text-xl font-semibold border-[2px] bg-white ${ageMessage || errorMessage ? 'border-red-500' : 'border-[#5F5F5F]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>
                        </div>
                      </div>

                      {/* Gender, Phone */}
                      <div className="input-row flex items-center justify-between">
                        <div className="input-field flex flex-col p-3 pt-0 gap-y-1 text-sm">
                            {genderMessage ? <label htmlFor="gender" className='opacity-90 font-semibold text-red-500'>{genderMessage}</label>
                            : <label htmlFor="gender" className='opacity-75 font-semibold'>Gender</label>}
                            <input
                            type="text" 
                            name="gender" 
                            id="gender" 
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className={`transition-all duration-300 bg-transparent px-3 py-2 text-xl font-semibold border-[2px] bg-white ${genderMessage || errorMessage ? 'border-red-500' : 'border-[#5F5F5F]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>
                            
                        </div>
        
                        <div className="relative input-field flex flex-col p-3 pt-0 gap-y-1 text-sm">
                            {phoneMessage ? <label htmlFor="phone" className='opacity-90 font-semibold text-red-500'>{phoneMessage}</label>
                            : <label htmlFor="phone" className='opacity-75 font-semibold'>Phone</label>}
                            <input 
                            type='text'
                            name="phone" 
                            id="phone" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className={`transition-all duration-300 bg-transparent px-3 py-2  text-xl font-semibold border-[2px] bg-white ${phoneMessage || errorMessage ? 'border-red-500' : 'border-[#5F5F5F]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>
                        </div>
                      </div>

                      {/* Email, Password */}
                      <div className="input-row flex items-center justify-between">
                        <div className="input-field flex flex-col p-3 pt-0 gap-y-1 text-sm">
                            {emailMessage ? <label htmlFor="email" className='opacity-90 font-semibold text-red-500'>{emailMessage}</label>
                            : <label htmlFor="email" className='opacity-75 font-semibold'>Email</label>}
                            <input
                            type="text" 
                            name="email" 
                            id="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`transition-all duration-300 bg-transparent px-3 py-2 text-xl font-semibold border-[2px] bg-white ${emailMessage || errorMessage ? 'border-red-500' : 'border-[#5F5F5F]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>
                            
                        </div>
        
                        <div className="relative input-field flex flex-col p-3 pt-0 gap-y-1 text-sm">
                            {passwordMessage ? <label htmlFor="password" className='opacity-90 font-semibold text-red-500'>{passwordMessage}</label>
                            : <label htmlFor="password" className='opacity-75 font-semibold'>Password</label>}
                            <input 
                            type={showPassword ? 'text' : 'password'}
                            name="password" 
                            id="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`transition-all duration-300 bg-transparent px-3 py-2  text-xl font-semibold border-[2px] bg-white ${passwordMessage || errorMessage ? 'border-red-500' : 'border-[#5F5F5F]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>
                            
                            <button
                              type="button"
                              onClick={togglePasswordVisibility}
                              className="absolute right-7 top-11 text-xl text-gray-600"
                            >
                              {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                      </div>

                      <button
                      className={`transition-all duration-300 bg-[#688D48] px-3 py-1 m-3 text-white text-sm outline-none font-semibold flex items-center justify-center float-right`}
                      onClick={handleNextClick}>
                        <span>Next</span>
                        <FaAngleRight />
                      </button>
                      </>}

                        {/* Address Part */}
                      {isNext && <>
                      {/* Fname, Lname */}
                      <div className="input-row flex items-center justify-between">
                        <div className="input-field flex flex-col p-3 pt-0 gap-y-1 text-sm">
                            {fnameMessage ? <label htmlFor="fname" className='opacity-90 font-semibold text-red-500'>{fnameMessage}</label>
                            : <label htmlFor="fname" className='opacity-75 font-semibold'>First Name</label>}
                            <input
                            type="text" 
                            name="fname" 
                            id="fname" 
                            value={fname}
                            onChange={(e) => setFname(e.target.value)}
                            className={`transition-all duration-300 bg-transparent px-3 py-2 text-xl font-semibold border-[2px] bg-white ${fnameMessage || errorMessage ? 'border-red-500' : 'border-[#5F5F5F]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>
                            
                        </div>
        
                        <div className="relative input-field flex flex-col p-3 pt-0 gap-y-1 text-sm">
                            {lnameMessage ? <label htmlFor="lname" className='opacity-90 font-semibold text-red-500'>{lnameMessage}</label>
                            : <label htmlFor="lname" className='opacity-75 font-semibold'>Last Name</label>}
                            <input 
                            type='text'
                            name="lname" 
                            id="lname" 
                            value={lname}
                            onChange={(e) => setLname(e.target.value)}
                            className={`transition-all duration-300 bg-transparent px-3 py-2  text-xl font-semibold border-[2px] bg-white ${lnameMessage || errorMessage ? 'border-red-500' : 'border-[#5F5F5F]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>
                        </div>
                      </div>

                      {/* Street, City */}
                      <div className="input-row flex items-center justify-between">
                        <div className="input-field flex flex-col p-3 pt-0 gap-y-1 text-sm">
                            {streetMessage ? <label htmlFor="street" className='opacity-90 font-semibold text-red-500'>{streetMessage}</label>
                            : <label htmlFor="street" className='opacity-75 font-semibold'>Street</label>}
                            <input
                            type="text" 
                            name="street" 
                            id="street" 
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            className={`transition-all duration-300 bg-transparent px-3 py-2 text-xl font-semibold border-[2px] bg-white ${streetMessage || errorMessage ? 'border-red-500' : 'border-[#5F5F5F]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>
                            
                        </div>
        
                        <div className="relative input-field flex flex-col p-3 pt-0 gap-y-1 text-sm">
                            {cityMessage ? <label htmlFor="city" className='opacity-90 font-semibold text-red-500'>{cityMessage}</label>
                            : <label htmlFor="city" className='opacity-75 font-semibold'>City</label>}
                            <input 
                            type='text'
                            name="city" 
                            id="city" 
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={`transition-all duration-300 bg-transparent px-3 py-2  text-xl font-semibold border-[2px] bg-white ${cityMessage || errorMessage ? 'border-red-500' : 'border-[#5F5F5F]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>
                        </div>
                      </div>

                      {/* State, Country */}
                      <div className="input-row flex items-center justify-between">
                        <div className="input-field flex flex-col p-3 pt-0 gap-y-1 text-sm">
                            {stateMessage ? <label htmlFor="state" className='opacity-90 font-semibold text-red-500'>{stateMessage}</label>
                            : <label htmlFor="state" className='opacity-75 font-semibold'>State</label>}
                            <input
                            type="text" 
                            name="state" 
                            id="state" 
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className={`transition-all duration-300 bg-transparent px-3 py-2 text-xl font-semibold border-[2px] bg-white ${stateMessage || errorMessage ? 'border-red-500' : 'border-[#5F5F5F]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>
                            
                        </div>
        
                        <div className="input-field flex flex-col p-3 pt-0 gap-y-1 text-sm">
                            {countryMessage ? <label htmlFor="country" className='opacity-90 font-semibold text-red-500'>{countryMessage}</label>
                            : <label htmlFor="country" className='opacity-75 font-semibold'>Country</label>}
                            <input
                            type="text" 
                            name="country" 
                            id="country" 
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className={`transition-all duration-300 bg-transparent px-3 py-2 text-xl font-semibold border-[2px] bg-white ${countryMessage || errorMessage ? 'border-red-500' : 'border-[#5F5F5F]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>
                            
                        </div>
                      </div>

                      <div className="input-field flex flex-col p-3 pt-0 gap-y-1 text-sm">
                            {pincodeMessage ? <label htmlFor="pincode" className='opacity-90 font-semibold text-red-500'>{pincodeMessage}</label>
                            : <label htmlFor="pincode" className='opacity-75 font-semibold'>Pincode</label>}
                            <input
                            type="text" 
                            name="pincode" 
                            id="pincode" 
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            className={`transition-all duration-300 bg-transparent px-3 py-2 text-xl font-semibold border-[2px] bg-white ${pincodeMessage || errorMessage ? 'border-red-500' : 'border-[#5F5F5F]'} border-opacity-60 focus:border-opacity-75 outline-none`}/>
                            
                        </div>

                        {/* Submit button */}
                      <div className="input-field flex items-center justify-between px-3 py-1">

                          <button
                          className={`transition-all duration-300 bg-[#5F5F5F] px-3 py-2 mr-3 text-white text-xl outline-none font-semibold flex items-center justify-center float-right`}
                          onClick={() => setIsNext(false)}>
                            <FaAngleLeft />
                            <span>Back</span>
                          </button>

                          <button
                          type='submit'
                          className={`transition-all w-full duration-300 bg-[#688D48] px-3 py-2 text-white text-xl outline-none font-semibold`}>
                          Submit
                          </button>

                      </div>
                      </>}
      
                  </form>
            </div>
      
    </div>

    </div>
    </>
  )
}

export default userDashboard;