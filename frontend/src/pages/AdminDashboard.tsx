import { useNavigate, Navigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice'
import { useDispatch } from 'react-redux'
import logo from '../assets/Logo-black.png'
import { MdDashboard, MdMessage } from "react-icons/md";
import { FaUsers, FaUserCircle } from "react-icons/fa";
import { FaUsersLine, FaAngleRight, FaAngleLeft  } from "react-icons/fa6";
import { IoNotifications } from "react-icons/io5";
import { IoMdLogOut } from "react-icons/io";
import { CiSearch } from "react-icons/ci";

const userDashboard = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

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
          <li className=''><button className='bg-[#435D2C] w-[100%] text-white px-4 py-2 text-start text-sm rounded flex items-center gap-x-2'>
            <MdDashboard/> <span>Dashboard</span>
          </button></li>
          <li><a href="/admin/userManagement"><button className='bg-[#688D48] w-[100%] text-white px-4 py-2 text-start text-sm rounded flex items-center gap-x-2'>
          <FaUsers/> <span>User Management</span>
          </button></a></li>
          <li><a href="/admin/volunteerManagement"><button className='bg-[#688D48] w-[100%] text-white px-4 py-2 text-start text-sm rounded flex items-center gap-x-2'>
          <FaUsersLine/> <span>Volunteer Management</span>
          </button></a></li>
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
            <span className='text-sm text-[#5F5F5F]'>Dashboard</span>
            <FaAngleRight className='text-[#5F5F5F]' />
          </div>
        </div>

        <div></div>

      </div>
      
    </div>

    </div>


    {/* Main container */}
    {/* <div className={`main-container w-[100vw] h-[100vh] bg-cover bg-center p-20`}
    style={{ backgroundImage: `url(${bgDark_1_img})` }}
    >
      <input 
      type="text" 
      value={searchTerm} 
      onChange={handleSearch} 
      placeholder="Search by name" 
      className="text-[#fff] mx-3 rounded-md px-3 py-1 outline-none border-2 border-[#ddd5d5] bg-transparent"
      />

      <div className='top-container flex items-center justify-center text-[#ffffff] gap-x-10'>
        <h2 className='text-5xl font-bold'>Admin Dashboard</h2>
        <button className={`text-3xl font-semibold px-3 py-1 rounded bg-[#636363] opacity-8}`}
        onMouseEnter={() => setLogoutText('Noo🥹!!')}
        onMouseLeave={() => setLogoutText('Logout')}
        onClick={handleLogout}
        >
          {logoutText}
        </button>
      </div> */}

      {/* Table container */}
    {/* <div className="table-container flex flex-col items-center px-10 py-5">
      <table className="w-full border-collapse text-[#ffffff] text-center">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={2}>No users found</td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user._id}>
                <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                <td className="border border-gray-300 px-4 py-2">{user.email}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="pagination">
        { currentPage !== 1 && 
        <button onClick={() => setCurrentPage(currentPage - 1)}
        className='text-white'
        >Previous</button>}
          {[...Array(totalPages)].map((_, index) => (
              <button
                  key={index}
                  className={`text-white px-1 m-1 bg-lime-500 ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(index + 1)}
              >
                  {index + 1}
              </button>
          ))}
          { currentPage !== totalPages && 
          <button onClick={() => setCurrentPage(currentPage + 1)}
          className='text-white'
          >Next</button>}
      </div>

    </div>
    </div> */}
    </>
  )
}

export default userDashboard;