import { Navigate, useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import logo from '../assets/Logo-black.png'
import { customAxios } from '../utils/apiClient';
import { AxiosError } from 'axios';
import { IUser } from '../interfaces/userInterface';
import { MdDashboard, MdMessage } from "react-icons/md";
import { FaUsers, FaUserCircle } from "react-icons/fa";
import { FaUsersLine, FaAngleRight, FaAngleLeft  } from "react-icons/fa6";
import { IoNotifications } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { CiSearch } from "react-icons/ci";

const userDashboard = () => {

  const [volunteers, setVolunteers] = useState<IUser[]>([]);
  // const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to={'/admin/login'} />
  }

  const getVolunteers = async () => {
    try {
      const response = await customAxios.get(`/api/admin/volunteers`, {
        params: {
          page: currentPage,
          limit: 5,
          search: searchTerm.trim()
        }
      });
      
      if (response.status === 200) {
        setVolunteers(response.data.volunteers);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          console.log('No users found!', error);
        }
      }
      console.log('Error fetching the users!', error);
    }
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);
  };

  useEffect(() => {
    getVolunteers();
  }, [currentPage, searchTerm]);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  }

  return (
    <>
    <div className="main-container w-[100vw] h-[100vh] bg-[#F4F4F4]">

      {/* Sidebar */}
      <div className="sidebar fixed left-0 z-20 h-[100%] w-[240px] bg-[#F4F4F4] shadow-[10px_0_50px_rgba(0,0,0,0.2)] px-5 py-3 flex flex-col items-center justify-start">
        <div className="logo flex items-center justify-between mb-4">
          <img src={logo} alt="logo" />
        </div>
        <ul className="buttons w-[100%] flex flex-col gap-y-3">
          <li className=''><a href="/admin/dashboard"><button className='bg-[#688D48] w-[100%] text-white px-4 py-2 text-start text-sm rounded flex items-center gap-x-2'>
            <MdDashboard/> <span>Dashboard</span>
          </button></a></li>
          <li><a href="/admin/userManagement"><button className='bg-[#688D48] w-[100%] text-white px-4 py-2 text-start text-sm rounded flex items-center gap-x-2'>
          <FaUsers/> <span>User Management</span>
          </button></a></li>
          <li><button className='bg-[#435D2C] w-[100%] text-white px-4 py-2 text-start text-sm rounded flex items-center gap-x-2'>
          <FaUsersLine/> <span>Volunteer Management</span>
          </button></li>
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

      {/* Table container */}
      <div className="table-container flex flex-col items-center px-10 py-5 ml-[240px] pt-[50px]">
      
      <div className="w-[100%] top-part flex items-center justify-between mt-10 mb-5">

        <div className="bread-crumps">
          <div className="crumps flex items-center gap-x-1">
            <span className='text-sm text-[#5F5F5F]'>Volunteers List</span>
            <FaAngleRight className='text-[#5F5F5F]' />
          </div>
        </div>

        <div className="table-top-right shadow-[10px_0_50px_rgba(0,0,0,0.2)] flex items-center justify-center bg-white rounded
        ">
          <input type="text" className='py-2 px-3 outline-none rounded' 
          value={searchTerm} 
          onChange={handleSearch} 
          placeholder="Search by name"
          />
          <CiSearch className='text-xl mr-4'/>
        </div>

      </div>

      <div className="main-table shadow-[10px_0_50px_rgba(0,0,0,0.2)] w-full rounded-xl bg-white">
        <div className="table-top bg-white w-[100%] rounded-t border-b-[1px] border-[#cdcdcd] px-10 py-3 flex items-center justify-start gap-x-3">
        <FaUsersLine className='text-xl text-[#5F5F5F]' />
        <span className='font-bold text-xl text-[#5F5F5F]'>Volunteers List</span>
        </div>

        <table className="w-full text-start bg-white rounded text-sm my-3">
          <thead>
            <tr>
              <th className="px-10 py-3 text-start">Sl.No.</th>
              <th className="px-10 py-3 text-start">Name</th>
              <th className="px-10 py-3 text-start">Email</th>
              <th className="px-10 py-3 text-start">DOJ</th>
              <th className="px-10 py-3 text-start">Phone</th>
              <th className="px-10 py-3 text-start">Status</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.length === 0 ? (
              <tr>
                <td className='px-10 py-3' colSpan={2}>No volunteers found</td>
              </tr>
            ) : (
              volunteers.map((volunteer, index) => (
                <tr key={volunteer._id}>
                  <td className="px-10 py-3">{(currentPage - 1) * 5 + index + 1}</td>
                  <td className="px-10 py-3">{volunteer.name}</td>
                  <td className="px-10 py-3">{volunteer.email}</td>
                  <td className="px-10 py-3">{volunteer.createdAt?.toString().slice(0, 10)}</td>
                  <td className="px-10 py-3">{volunteer.phone}</td>
                  <td className={`px-10 py-3`}>
                    <span className={`${volunteer.isActive ? 'bg-[#688D48]' : 'bg-[#962929]'} text-white px-4 rounded-sm`}>
                    {volunteer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="pagination py-5 flex items-center justify-center">
        { currentPage !== 1 && 
        <button onClick={() => setCurrentPage(currentPage - 1)}
        className='text-black font-bold text-sm px-2 flex items-center justify-center'
        ><FaAngleLeft className='text-[#5F5F5F]' /><span>PREV</span></button>}
          {[...Array(totalPages)].map((_, index) => (
              <button
                  key={index}
                  className={`text-white px-2 m-1 ${currentPage === index + 1 ? 'active bg-[#435D2C]' : 'bg-[#688D48]'}`}
                  onClick={() => setCurrentPage(index + 1)}
              >
                  {index + 1}
              </button>
          ))}
          { currentPage !== totalPages && 
          <button onClick={() => setCurrentPage(currentPage + 1)}
          className='text-black font-bold text-sm px-2 flex items-center justify-center'
          ><span>NEXT</span><FaAngleRight className='text-[#5F5F5F]' /></button>}
      </div>
      
      </div>
    </div>
    </>
  )
}

export default userDashboard;