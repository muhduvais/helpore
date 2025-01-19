import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { customAxios } from '../../utils/apiClient';
import { AxiosError } from 'axios';
import { IUser } from '../../interfaces/userInterface';
import { FaUsers } from "react-icons/fa";
import { FaAngleRight, FaAngleLeft  } from "react-icons/fa6";
import { CiSearch } from "react-icons/ci";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { TiUserAdd } from "react-icons/ti";
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/AdminTopbar';
import { useDebounce } from 'use-debounce';

const AdminUserManagement = () => {

  const [users, setUsers] = useState<IUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to={'/admin/login'} />
  }

  const getUsers = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);
  };

  useEffect(() => {
    getUsers();
  }, [currentPage, debouncedSearchTerm]);

  return (
    <>
    
    <div className="main-container w-[100vw] h-[100vh] bg-[#F4F4F4]">

      {/* Sidebar */}
      <Sidebar activeLink="/admin/userManagement" />

      {/* Topbar */}
      <Topbar />

      {/* Table container */}
      <div className="table-container flex flex-col items-center px-10 py-5 ml-[240px] pt-[50px]">
      
      <div className="w-[100%] top-part flex items-center justify-between mt-10 mb-5">

        <div className="bread-crumps">
          <div className="crumps flex items-center gap-x-1">
            <span className='text-sm text-[#5F5F5F]'>Users Management</span>
            <FaAngleRight className='text-[#5F5F5F]' />
          </div>
        </div>

        <div className="right-table flex items-center justify-center">

          <Link to={'/admin/addUser'} className="addUser flex items-center justify-center gap-x-2 mr-3 py-1 px-3 bg-[#688D48] text-white">
            <TiUserAdd />
            <button className=''>Add User</button>
          </Link>

          <div className="right shadow-[10px_0_50px_rgba(0,0,0,0.2)] flex items-center justify-center bg-white rounded
          ">
            <input type="text" className='py-2 px-3 outline-none rounded' 
            value={searchTerm} 
            onChange={handleSearch} 
            placeholder="Search by name"
            />
            <CiSearch className='text-xl mr-4'/>
          </div>

        </div>

      </div>

      { isLoading && 
      <DotLottieReact
      src="https://lottie.host/525ff46b-0a14-4aea-965e-4b22ad6a8ce7/wGcySY4DHd.lottie"
      loop
      autoplay
      style={{ width: "30px", height: "50px", paddingTop: "15px", marginBottom: "14px" }}
      />}

      { !isLoading && 
      <div className="main-table shadow-[10px_0_50px_rgba(0,0,0,0.2)] w-full rounded-xl bg-white">
        <div className="table-top bg-white w-[100%] rounded-t border-b-[1px] border-[#cdcdcd] px-10 py-3 flex items-center justify-start gap-x-3">
        <FaUsers className='text-xl text-[#5F5F5F]' />
        <span className='font-bold text-xl text-[#5F5F5F]'>Users List</span>
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
            {users.length === 0 ? (
              <tr>
                <td className='px-10 py-3' colSpan={2}>No users found</td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user._id}>
                  <td className="px-10 py-3">{(currentPage - 1) * 5 + index + 1}</td>
                  <td className="px-10 py-3">{user.name}</td>
                  <td className="px-10 py-3">{user.email}</td>
                  <td className="px-10 py-3">{user.createdAt?.toString().slice(0, 10)}</td>
                  <td className="px-10 py-3">{user.phone}</td>
                  <td className={`px-10 py-3`}>
                    <span className={`${user.isActive ? 'bg-[#688D48]' : 'bg-[#962929]'} text-white px-4 rounded-sm`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div> }
      
      { !isLoading &&
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
    </div>}
      
    </div>

    </div>

    </>
  )
}

export default AdminUserManagement;