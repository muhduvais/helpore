import { Navigate, useNavigate } from 'react-router-dom';
import bgDark_1_img from '../assets/bg-darkGreen-1.jpeg';
import { logout } from '../redux/slices/authSlice'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axios from '../utils/urlProxy';
import { customAxios } from '../utils/apiClient';
import { AxiosError } from 'axios';
import { IUser } from '../interfaces/userInterface';

const userDashboard = () => {

  const [logoutText, setLogoutText] = useState('Logout');
  const [users, setUsers] = useState<IUser[]>([]);
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

  const getUsers = async () => {
    try {
      const response = await customAxios.get(`/api/admin/users`, {
        params: {
          page: currentPage,
          limit: 5,
          search: searchTerm.trim()
        }
      });
      
      if (response.status === 200) {
        setUsers(response.data.users);
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
    getUsers();
  }, [currentPage, searchTerm]);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  }

  return (
    <>
    {/* Main container */}
    <div className={`main-container w-[100vw] h-[100vh] bg-cover bg-center p-20`}
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
      </div>

      {/* Table container */}
    <div className="table-container flex flex-col items-center px-10 py-5">
      <table className="w-full border-collapse border border-gray-300 text-[#ffffff] text-center">
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
    </div>
    </>
  )
}

export default userDashboard;