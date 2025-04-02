import { useEffect, useState, useRef } from 'react';
import { MdOutlinePhotoCamera } from "react-icons/md";
import { User, Key, Cog, Upload } from 'lucide-react';
import profile_pic from '../../assets/profile_pic.png';
import loading_Profile from '../../assets/loadingProfile.webp';
import { toast } from 'sonner';
import { validateChangePassword } from "../../utils/validation";
import { userService } from '../../services/user.service';
import { AxiosError } from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { adminService } from '@/services/admin.service';
import EditProfileModal from '@/components/EditUserProfile';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('info');
    const [user, setUser] = useState<any | null>(null);
    const [address, setAddress] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isProfileUploading, setIsProfileUploading] = useState(false);
    const [isImageHovered, setIsImageHovered] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Password change state
    const initialFormState = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    };
    const [formData, setFormData] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState(initialFormState);
    const [message, setMessage] = useState<string | null>(null);

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
    }, [])

    const handleChangePassword = async (e: any) => {
        e.preventDefault();
        const { isValid, errors } = validateChangePassword(formData);
        setFormErrors(errors);

        if (isValid) {
            setIsLoading(true);
            try {
                const response = await userService.changePassword(formData);
                if (response?.status === 200) {
                    toast.success('Password reset successfully!');
                    clearFields();
                }
            } catch (error) {
                if (error instanceof AxiosError) {
                    if (error.response?.status === 400) {
                        setMessage(error.response?.data?.message || 'Invalid current password!');
                    }
                } else {
                    setMessage('An unexpected error occurred');
                }
            } finally {
                setIsLoading(false);
            }
        }
    };

    const clearFields = () => {
        setFormData(initialFormState);
        setFormErrors(initialFormState);
        setMessage('');
    };

    const handleProfilePictureClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.info('Image size should be less than 5MB');
                return;
            }

            const formFileData = new FormData();
            formFileData.append('file', file);

            setIsProfileUploading(true);
            try {
                const uploadResponse = await adminService.uploadAssetImage(formFileData);
                const uploadedImageUrl = uploadResponse.data.imageUrl;

                if (uploadedImageUrl) {
                    const updateProfilePicture = await userService.updateProfilePicture(uploadedImageUrl);
                    if (!updateProfilePicture) {
                        toast.error('Error updating the profile picture!');
                    };
                }

            } catch (error) {
                toast.error('Failed to upload asset image!');
                console.error('File uploading error: ', error);
                return;
            } finally {
                setIsProfileUploading(false);
            }
            toast.success('Profile picture updated successfully!');
            fetchUserDetails();
        }
    };

    const tabs = [
        { id: 'info', label: 'Profile Info', icon: <User className="w-5 h-5" /> },
        { id: 'password', label: 'Change Password', icon: <Key className="w-5 h-5" /> },
        { id: 'settings', label: 'Settings', icon: <Cog className="w-5 h-5" /> },
    ];

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <span>Loading...</span>
            </div>
        );
    }

    return (
        <>
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
                address={address}
                onUpdate={fetchUserDetails}
            />
            <div className="bg-white shadow-lg rounded-lg max-w-6xl w-full overflow-hidden">
                {/* Profile Banner */}
                <div className="bg-gradient-to-r from-[#688D48] to-[#435D2C] p-8">
                    <div className="relative flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
                        {/* Profile Picture Section */}
                        <div className="relative group"
                            onMouseEnter={() => setIsImageHovered(true)}
                            onMouseLeave={() => setIsImageHovered(false)}
                            onClick={handleProfilePictureClick}
                        >
                            <div className="relative">
                                <img
                                    src={isProfileUploading ? loading_Profile : user?.profilePicture || profile_pic}
                                    alt="Profile"
                                    className="w-36 h-36 rounded-full border-4 border-white object-cover shadow-lg transition-transform duration-300 ease-in-out group-hover:opacity-75"
                                />
                                <div className={`absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 transition-opacity duration-300 ${isImageHovered ? 'opacity-100' : 'opacity-0'}`}>
                                    <MdOutlinePhotoCamera className="text-white text-3xl" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <div className="absolute -bottom-2 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer">
                                <Upload className="w-4 h-4 text-gray-600" />
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl font-bold text-white mb-2">{user?.name}</h1>
                            <p className="text-xl text-white/80">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Enhanced Tabs */}
                <div className="border-b bg-white sticky top-0 z-10">
                    <div className="flex overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-8 py-4 focus:outline-none whitespace-nowrap transition-all duration-200
                ${activeTab === tab.id
                                        ? 'border-b-2 border-[#688D48] text-[#688D48] bg-green-50'
                                        : 'text-gray-500 hover:text-[#688D48] hover:bg-green-50/50'
                                    }`}
                            >
                                {tab.icon}
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Enhanced Tab Content */}
                <div className="p-8">
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Personal Information */}
                            <div className="relative md:col-span-2 bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">

                                <h2 className="text-2xl font-bold mb-6 text-gray-700">Personal Information</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                                        <p className="text-lg font-medium text-gray-700">
                                            {user?.createdAt?.toString().slice(0, 10) || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Address Section */}
                            <div className="relative bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">

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
                    )}

                    {activeTab === 'password' && (
                        <div className="max-w-2xl mx-auto">
                            <h2 className="text-2xl font-bold text-gray-700 mb-4">Change Password</h2>
                            {message && (
                                <div className="p-3 mb-4 rounded bg-red-100 text-red-700">
                                    {message}
                                </div>
                            )}
                            <form className="space-y-6" onSubmit={handleChangePassword}>
                                <fieldset disabled={isLoading}>
                                    <div>
                                        <label htmlFor="currentPassword" className={`block text-sm ${formErrors.currentPassword ? 'text-red-500' : 'text-gray-500'}`}>
                                            {formErrors.currentPassword ? formErrors.currentPassword : 'Current Password'}
                                        </label>
                                        <input
                                            type="password"
                                            id="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                            className="w-full mt-1 px-4 py-2 border text-gray-700"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="newPassword" className={`block text-sm ${formErrors.newPassword ? 'text-red-500' : 'text-gray-500'}`}>
                                            {formErrors.newPassword ? formErrors.newPassword : 'New Password'}
                                        </label>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            value={formData.newPassword}
                                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                            className="w-full mt-1 px-4 py-2 border text-gray-700"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="confirmPassword" className={`block text-sm ${formErrors.confirmPassword ? 'text-red-500' : 'text-gray-500'}`}>
                                            {formErrors.confirmPassword ? formErrors.confirmPassword : 'Confirm New Password'}
                                        </label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="w-full mt-1 px-4 py-2 border text-gray-700"
                                        />
                                    </div>
                                </fieldset>

                                <div className="flex items-center space-x-4">
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-[#688D48] text-white font-semibold hover:bg-[#435D2C] transition"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Updating..." : "Update Password"}
                                    </button>
                                    <button
                                        type="button"
                                        className="px-6 py-2 bg-gray-200 text-gray-600 font-semibold hover:bg-gray-300 transition"
                                        onClick={clearFields}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="max-w-2xl mx-auto">
                            <div className="bg-gray-50 p-4 rounded-lg shadow">
                                <h2 className="text-xl font-bold mb-4 text-gray-500">Delete Account</h2>
                                <p className="text-gray-700 mb-6">
                                    Deleting your account is permanent and will remove all your data. This action cannot be undone.
                                </p>
                                <button
                                    className="bg-red-700 text-white px-4 py-2 shadow-md hover:bg-red-800"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="bg-gray-100 p-4 flex items-center justify-between border-t">
                    <button
                        className='ml-3 px-8 py-2 bg-[#688D48] rounded text-white'
                        onClick={() => setIsEditModalOpen(true)}
                    >Edit Profile</button>
                    <p className="text-sm text-gray-600 px-3">Profile - {user?.name}</p>
                </div>
            </div>
        </>
    );
};

export default Profile;