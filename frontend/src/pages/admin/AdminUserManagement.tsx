import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useDebounce } from 'use-debounce';
import { FaUsers, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { CiSearch } from 'react-icons/ci';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { TiUserAdd } from 'react-icons/ti';
import { adminService } from '../../services/admin.service';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IUser } from '@/interfaces/userInterface';
import profile_pic from '../../assets/profile_pic.png'

const AdminUserManagement = () => {
  const [users, setUsers] = useState<IUser[] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to={'/admin/login'} />;
  }

  const getUsers = async () => {
    try {
      setIsLoading(true);

      const response = await adminService.fetchUsers(currentPage, 5, searchTerm.trim());

      if (response.status === 200) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
        setTotalUsers(response.data.totalUsers);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          console.log('No users found!', error);
        }
      }
      console.log('Error fetching the users!', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);
  };

  useEffect(() => {
    getUsers();
  }, [currentPage, debouncedSearchTerm]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    img.src = profile_pic;
  };

  return (
    <div className="table-container p-5">

      {/* Breadcrumbs */}
      <div className="flex items-center gap-x-2 my-3">
        <Link to="/admin/userManagement" className="text-sm text-[#8a8a8a]">User Management</Link>
        <FaAngleRight className="text-[#8a8a8a]" />
      </div>

      <div className="w-full flex justify-between items-center mb-5">
        <div className="flex items-center gap-x-2">
          <FaUsers className="text-xl text-[#5F5F5F]" />
          <span className="font-bold text-xl text-[#5F5F5F]">Users List</span>
        </div>
        <div className="flex items-center gap-x-3">
          <Link
            to={'/admin/addUser'}
            className="flex items-center gap-x-2 py-1 px-3 bg-[#688D48] text-white rounded"
          >
            <TiUserAdd />
            <span>Add User</span>
          </Link>
          <div className="flex items-center bg-white border p-2 rounded">
            <CiSearch className="text-xl mr-2" />
            <input
              type="text"
              className="outline-none"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by name"
            />
          </div>
        </div>
      </div>

      {isLoading && (
        <DotLottieReact
          src="https://lottie.host/525ff46b-0a14-4aea-965e-4b22ad6a8ce7/wGcySY4DHd.lottie"
          loop
          autoplay
          style={{ width: '30px', height: '50px', paddingTop: '15px', marginBottom: '14px' }}
        />
      )}

      {!isLoading && (
        <Table className="border-4 rounded">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Sl.No.</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>DOJ</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>No users found</TableCell>
              </TableRow>
            ) : (
              users?.map((user, index) => (
                <TableRow key={user._id}>
                  <TableCell>{(currentPage - 1) * 5 + index + 1}</TableCell>
                  <TableCell>
                    <img
                      src={user.profilePicture || profile_pic}
                      alt="Profile"
                      className="rounded-full object-cover w-[30px] h-[30px]"
                      onError={handleImageError}
                    />
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.createdAt?.toString().slice(0, 10)}</TableCell>
                  <TableCell>
                    <span
                      className={`${!user.isBlocked ? 'bg-[#688D48]' : 'bg-[#962929]'
                        } text-white px-4 rounded-sm`}
                    >
                      {!user.isBlocked ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link to={`/admin/userDetails/${user._id}`} className="text-blue-600">
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5} className="text-right">Total Users</TableCell>
              <TableCell>{totalUsers}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}

      {!isLoading && (
        <div className="pagination py-5 flex items-center justify-center">
          {currentPage !== 1 && (
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              className="text-black font-bold text-sm px-2 flex items-center justify-center"
            >
              <FaAngleLeft className="text-[#5F5F5F]" />
              <span>PREV</span>
            </button>
          )}
          {[...Array(totalPages)]?.map((_, index) => (
            <button
              key={index}
              className={`text-white px-2 m-1 ${currentPage === index + 1 ? 'active bg-[#435D2C]' : 'bg-[#688D48]'
                }`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          {currentPage !== totalPages && (
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              className="text-black font-bold text-sm px-2 flex items-center justify-center"
            >
              <span>NEXT</span>
              <FaAngleRight className="text-[#5F5F5F]" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
