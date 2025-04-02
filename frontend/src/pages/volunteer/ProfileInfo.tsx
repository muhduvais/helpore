import { useEffect, useState, useRef } from 'react';
import { User, Key, Cog, Camera, Edit } from 'lucide-react';
import profile_pic from '../../assets/profile_pic.png';
import loading_Profile from '../../assets/loadingProfile.webp';
import { toast } from 'sonner';
import { validateChangePassword } from "../../utils/validation";
import { IUser } from '../../interfaces/userInterface';
import { AxiosError } from 'axios';
import { adminService } from '@/services/admin.service';
import EditProfileModal from '@/components/EditUserProfile';
import { volunteerService } from '@/services/volunteer.service';
import { useSelector } from 'react-redux';

const Profile = () => {
    const [activeTab, setActiveTab] = useState('info');
    const [volunteer, setVolunteer] = useState<IUser | null>(null);
    const [address, setAddress] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isProfileUploading, setIsProfileUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
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

    const volunteerId = useSelector((state: any) => state.auth.userId);

    const fetchVolunteerDetails = async () => {
        try {
            setIsLoading(true);
            const response = await volunteerService.fetchVolunteerDetails(volunteerId);

            if (response.status === 200) {
                setVolunteer(response.data.volunteer);
                setAddress(response.data.address);
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                console.log('Error fetching volunteer details:', error.response?.data?.message || error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVolunteerDetails();
    }, []);

    // Password changing
    const handleChangePassword = async (e: any) => {
        e.preventDefault();
        const { isValid, errors } = validateChangePassword(formData);
        setFormErrors(errors);

        if (isValid) {
            setIsLoading(true);
            try {
                const response = await volunteerService.changePassword(formData);

                if (response?.status === 200) {
                    clearFields();
                    toast.success('Password reset successfully!');
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

    const handleDeleteAccount = () => {
        console.log("Account deletion confirmed");
        setIsModalOpen(false);
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
                    const updateResponse = await volunteerService.updateProfilePicture(uploadedImageUrl);

                    if (updateResponse.status === 200) {
                        toast.success('Profile updated!');
                    } else {
                        toast.error('Error updating the profile!');
                    }
                }

            } catch (error) {
                toast.error('Failed to upload profile image!');
                console.error('File uploading error: ', error);
                return;
            } finally {
                setIsProfileUploading(false);
            }
            toast.success('Profile picture updated successfully!');
            fetchVolunteerDetails();
        }
    };

    const tabs = [
        { id: 'info', label: 'Profile Info', icon: <User className="w-5 h-5" /> },
        { id: 'password', label: 'Change Password', icon: <Key className="w-5 h-5" /> },
        { id: 'settings', label: 'Settings', icon: <Cog className="w-5 h-5" /> },
    ];

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center p-8">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-green-800 font-medium">Loading profile data...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={volunteer}
                address={address}
                onUpdate={fetchVolunteerDetails}
            />

            {/* Confirm Delete Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Account Deletion</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 max-h-full">
                <div className="bg-white shadow-md rounded-xl overflow-hidden">
                    {/* Profile Banner */}
                    <div className="bg-gradient-to-r from-[#688D48] to-[#435D2C] p-6 sm:p-8">
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            {/* Profile Picture */}
                            <div
                                className="relative group"
                                onMouseEnter={() => setIsImageHovered(true)}
                                onMouseLeave={() => setIsImageHovered(false)}
                                onClick={handleProfilePictureClick}
                            >
                                <div className="relative cursor-pointer">
                                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white overflow-hidden shadow-lg">
                                        <img
                                            src={isProfileUploading ? loading_Profile : volunteer?.profilePicture || profile_pic}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className={`absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 transition-opacity duration-300 ${isImageHovered ? 'opacity-100' : 'opacity-0'}`}>
                                        <Camera className="text-white w-8 h-8" />
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {/* Profile Info */}
                            <div className="text-center sm:text-left flex-1">
                                <h1 className="text-3xl font-bold text-white mb-1">{volunteer?.name}</h1>
                                <p className="text-green-100">{volunteer?.email}</p>
                                <div className="mt-3 hidden sm:block">
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-green-800 rounded-full text-sm font-medium hover:bg-green-50 transition shadow-sm"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="bg-white border-b sticky top-0 z-10">
                        <div className="flex overflow-x-auto">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all duration-200
                                    ${activeTab === tab.id
                                            ? 'border-b-2 border-green-700 text-green-700 bg-green-50'
                                            : 'text-gray-600 hover:text-green-700 hover:bg-green-50/30'
                                        }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'info' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Personal Information */}
                                <div className="lg:col-span-2 rounded-xl overflow-hidden border border-gray-100">
                                    <div className="bg-green-50 px-4 py-3 border-b border-gray-100">
                                        <h2 className="font-semibold text-green-800">Personal Information</h2>
                                    </div>

                                    <div className="p-5 bg-white">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Full Name</p>
                                                <p className="font-medium text-gray-800">{volunteer?.name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Age</p>
                                                <p className="font-medium text-gray-800">{volunteer?.age || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Phone</p>
                                                <p className="font-medium text-gray-800">{volunteer?.phone || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Gender</p>
                                                <p className="font-medium text-gray-800">{volunteer?.gender || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Email</p>
                                                <p className="font-medium text-gray-800">{volunteer?.email || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Date of Joining</p>
                                                <p className="font-medium text-gray-800">
                                                    {volunteer?.createdAt?.toString().slice(0, 10) || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="rounded-xl overflow-hidden border border-gray-100">
                                    <div className="bg-green-50 px-4 py-3 border-b border-gray-100">
                                        <h2 className="font-semibold text-green-800">Address Information</h2>
                                    </div>

                                    <div className="p-5 bg-white">
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Street</p>
                                                <p className="font-medium text-gray-800">{address?.street || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">City & State</p>
                                                <p className="font-medium text-gray-800">
                                                    {address?.city || 'N/A'}, {address?.state || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Postal Code</p>
                                                <p className="font-medium text-gray-800">{address?.pincode || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Country</p>
                                                <p className="font-medium text-gray-800">{address?.country || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'password' && (
                            <div className="max-w-2xl mx-auto bg-white rounded-xl overflow-hidden border border-gray-100">
                                <div className="bg-green-50 px-4 py-3 border-b border-gray-100">
                                    <h2 className="font-semibold text-green-800">Change Password</h2>
                                </div>

                                <div className="p-6">
                                    {message && (
                                        <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-600 text-sm">
                                            {message}
                                        </div>
                                    )}

                                    <form className="space-y-5" onSubmit={handleChangePassword}>
                                        <fieldset disabled={isLoading}>
                                            <div className="mb-4">
                                                <label
                                                    htmlFor="currentPassword"
                                                    className={`block text-sm font-medium mb-1 ${formErrors.currentPassword ? 'text-red-500' : 'text-gray-700'}`}
                                                >
                                                    {formErrors.currentPassword ? formErrors.currentPassword : 'Current Password'}
                                                </label>
                                                <input
                                                    type="password"
                                                    id="currentPassword"
                                                    value={formData.currentPassword}
                                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label
                                                    htmlFor="newPassword"
                                                    className={`block text-sm font-medium mb-1 ${formErrors.newPassword ? 'text-red-500' : 'text-gray-700'}`}
                                                >
                                                    {formErrors.newPassword ? formErrors.newPassword : 'New Password'}
                                                </label>
                                                <input
                                                    type="password"
                                                    id="newPassword"
                                                    value={formData.newPassword}
                                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label
                                                    htmlFor="confirmPassword"
                                                    className={`block text-sm font-medium mb-1 ${formErrors.confirmPassword ? 'text-red-500' : 'text-gray-700'}`}
                                                >
                                                    {formErrors.confirmPassword ? formErrors.confirmPassword : 'Confirm New Password'}
                                                </label>
                                                <input
                                                    type="password"
                                                    id="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                                                />
                                            </div>
                                        </fieldset>

                                        <div className="flex items-center gap-3 pt-2">
                                            <button
                                                type="submit"
                                                className="px-5 py-2 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 transition shadow-sm"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? "Updating..." : "Update Password"}
                                            </button>
                                            <button
                                                type="button"
                                                className="px-5 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                                                onClick={clearFields}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="max-w-2xl mx-auto">
                                <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
                                    <div className="bg-red-50 px-4 py-3 border-b border-gray-100">
                                        <h2 className="font-semibold text-red-800">Delete Account</h2>
                                    </div>

                                    <div className="p-6">
                                        <p className="text-gray-600 mb-5 text-sm">
                                            Deleting your account is permanent and will remove all your data from our systems. This action cannot be undone.
                                        </p>
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="px-5 py-2 bg-red-700 text-white font-medium rounded-sm hover:bg-red-800 transition shadow-sm flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;