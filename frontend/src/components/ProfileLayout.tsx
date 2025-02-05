import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import UserProfileOptions from '../components/UserProfileOptions';
import UserTopbar from './UserTopbar';

const ProfileLayout = () => {

  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to={'/user/login'} />
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-start items-center p-4 mt-[50px]">
      <UserTopbar/>
      <div className='flex justify-center items-start w-full gap-x-2'>
        <Outlet />
        <UserProfileOptions />
      </div>
    </div>
  );

}

export default ProfileLayout;