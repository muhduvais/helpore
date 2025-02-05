import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { IUser } from '../../interfaces/userInterface';
import profile_pic from '../../assets/profile_pic.png'
import { MdEdit } from "react-icons/md";
import { userService } from '../../services/userService';


const UserInfo = () => {

    const [user, setUser] = useState<IUser | null>(null);
    const [address, setAddress] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUserDetails = async () => {
        try {
            setIsLoading(true);
            const response = await userService.fetchUserDetails();
            
            if (response.status === 200) {
                const { userDetails } = response.data;
                setUser(userDetails.user);
                setAddress(userDetails.address);
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                console.log('Error fetching user details:', error.response?.data?.message || error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <span>Loading...</span>
            </div>
        );
    }

    return (
        <div className="bg-white shadow-lg rounded-lg max-w-6xl w-full overflow-hidden">

            {/* Profile Banner */}
            <div className="bg-gradient-to-r from-[#688D48] to-[#435D2C] p-6 text-white">
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        {user?.profilePicture ?
                            <img
                                src={user?.profilePicture}
                                alt={`${user?.name}'s profile`}
                                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                            /> :
                            <img
                                src={profile_pic}
                                alt="profile"
                                className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                            />

                        }
                        <div>
                            <h1 className="text-3xl font-bold">{user?.name}</h1>
                            <p className="text-lg opacity-80">{user?.email}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="relative md:col-span-2 bg-gray-50 p-4 rounded-lg shadow">
                <div className='absolute top-3 right-3'>
                        <MdEdit className='text-xl text-gray-500 hover:opacity-70 cursor-pointer' />
                    </div>
                    <h2 className="text-xl font-bold mb-4 text-gray-500">Personal Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="text-lg font-medium text-gray-700">{user?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Age</p>
                            <p className="text-lg font-medium text-gray-700">{user?.age || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-lg font-medium text-gray-700">{user?.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="text-lg font-medium text-gray-700">{user?.gender || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-lg font-medium text-gray-700">{user?.email || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">DOJ</p>
                            <p className="text-lg font-medium text-gray-700">{user?.createdAt?.toString().slice(0, 10) || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* Address Section */}
                <div className="relative bg-gray-50 p-4 rounded-lg shadow">
                    <div className='absolute top-3 right-3'>
                        <MdEdit className='text-xl text-gray-500 hover:opacity-70 cursor-pointer' />
                    </div>
                    <h2 className="text-xl font-bold mb-4 text-gray-500">Address</h2>
                    <div className="text-gray-700">
                        <p className="text-sm text-gray-500">Street</p>
                        <p className="text-lg font-medium">{address?.street || 'N/A'}</p>

                        <p className="mt-2 text-sm text-gray-500">City</p>
                        <p className="text-lg font-medium">
                            {address?.city || 'N/A'}, {address?.state || 'N/A'}
                        </p>

                        <p className="mt-2 text-sm text-gray-500">Postal Code</p>
                        <p className="text-lg font-medium">{address?.pincode || 'N/A'}</p>

                        <p className="mt-2 text-sm text-gray-500">Country</p>
                        <p className="text-lg font-medium">{address?.country || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* Footer Section */}
            <div className="bg-gray-100 p-4 text-center border-t">
                <p className="text-sm text-gray-600">Profile - {user?.name}</p>
            </div>
        </div>
    );

}

export default UserInfo;