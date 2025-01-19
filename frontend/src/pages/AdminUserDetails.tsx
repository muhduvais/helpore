import { Navigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { customAxios } from '../utils/apiClient';
import { AxiosError } from 'axios';
import { FaAngleRight } from "react-icons/fa6";
import Sidebar from '../components/Sidebar';
import Topbar from '../components/AdminTopbar';
import { IUser } from '../interfaces/userInterface';

const AdminUserDetails = () => {

    const { userId } = useParams();
    const [user, setUser] = useState<IUser | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

    if (!isLoggedIn) {
        return <Navigate to={'/admin/login'} />;
    }

    const fetchUserDetails = async () => {
        try {
            setIsLoading(true);
            const response = await customAxios.get(`/api/admin/users/6780a783fe08ac96ad71f013`);
            if (response.status === 200) {
                setUser(response.data.user);
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                console.log('Error fetching user details:', error.response?.data?.message || error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBlockUnblock = async () => {
        try {
            if (!user) {
                console.error('User is null or undefined.');
                return;
            }
            const action = user.isBlocked ? 'unblock' : 'block';
            const response = await customAxios.patch(`/api/admin/users/${userId}/${action}`);
            if (response.status === 200) {
                setUser({
                    ...user,
                    isBlocked: !user.isBlocked,
                });
            }
        } catch (error) {
            console.error('Error updating user status:', error);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <span>Loading...</span>
            </div>
        );
    }

    return (
        <>
            <div className="main-container w-[100vw] h-[100vh] bg-[#F4F4F4]">
                {/* Sidebar */}
                <Sidebar activeLink="/admin/userManagement" />

                {/* Topbar */}
                <Topbar />

                {/* Content */}
                <div className="details-container flex flex-col items-center px-10 py-5 ml-[240px] pt-[50px]">
                    <div className="w-[100%] top-part flex items-center justify-between mt-10 mb-5">
                        {/* Breadcrumb */}
                        <div className="bread-crumps">
                            <div className="crumps flex items-center gap-x-1">
                                <span className="text-sm text-[#5F5F5F]">Users Management</span>
                                <FaAngleRight className="text-[#5F5F5F]" />
                                <span className="text-sm text-[#5F5F5F]">User Details</span>
                            </div>
                        </div>
                    </div>

                    {user ? (
                        <div className="user-details bg-white shadow-[10px_0_50px_rgba(0,0,0,0.2)] w-[100%] rounded-xl p-8 flex gap-x-8">
                            {/* Profile Picture */}
                            <div className="profile-section flex flex-col items-center justify-center gap-y-4">
                                <img
                                    src={user.profilePicture || '/default-profile.png'}
                                    alt="Profile"
                                    className="w-[150px] h-[150px] rounded-full shadow-lg object-cover"
                                />
                                <button
                                    onClick={handleBlockUnblock}
                                    className={`py-1 px-6 ${user.isBlocked ? 'bg-[#688D48]' : 'bg-[#962929]'
                                        } text-white`}
                                >
                                    {user.isBlocked ? 'Unblock' : 'Block'}
                                </button>
                            </div>

                            {/* User Details */}
                            <div className="details-section flex flex-col gap-y-4 w-full">
                                <h2 className="text-xl font-bold text-[#5F5F5F]">User Details</h2>
                                <div className="detail-item flex">
                                    <span className="font-semibold w-[150px] text-[#5F5F5F]">Name:</span>
                                    <span>{user.name}</span>
                                </div>
                                <div className="detail-item flex">
                                    <span className="font-semibold w-[150px] text-[#5F5F5F]">Email:</span>
                                    <span>{user.email}</span>
                                </div>
                                <div className="detail-item flex">
                                    <span className="font-semibold w-[150px] text-[#5F5F5F]">Phone:</span>
                                    <span>{user.phone || 'N/A'}</span>
                                </div>
                                <div className="detail-item flex">
                                    <span className="font-semibold w-[150px] text-[#5F5F5F]">Date of Joining:</span>
                                    <span>{user.createdAt?.toString().slice(0, 10) || 'N/A'}</span>
                                </div>
                                <div className="detail-item flex">
                                    <span className="font-semibold w-[150px] text-[#5F5F5F]">Status:</span>
                                    <span
                                        className={`px-3 py-1 text-sm rounded ${user.isBlocked ? 'bg-[#962929] text-white' : 'bg-[#688D48] text-white'
                                            }`}
                                    >
                                        {user.isBlocked ? 'Blocked' : 'Active'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full flex items-center justify-center">
                            <p className="text-[#5F5F5F] text-lg">User not found.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminUserDetails;
