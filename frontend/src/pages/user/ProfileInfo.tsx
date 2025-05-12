import { useEffect, useState, useRef } from 'react';
import { MdOutlinePhotoCamera } from "react-icons/md";
import { User, Key, Cog, Upload } from 'lucide-react';
import profile_pic from '../../assets/profile_pic.png';
import loading_Profile from '../../assets/loadingProfile.webp';
import { toast } from 'sonner';
import { validateChangePassword } from "../../utils/validation";
import { userService } from '../../services/user.service';
import { IUser } from '../../interfaces/userInterface';
import { AxiosError } from 'axios';
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

    const [certificateFile, setCertificateFile] = useState<File | string | null>(null);
    const [isCertificateLoading, setIsCertificateLoading] = useState(false);
    const [certificateErrorMessage, setCertificateErrorMessage] = useState<any>('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [certificateToDelete, setCertificateToDelete] = useState<{ index: number, url: string } | null>(null);
    const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

    // Password change state
    const initialFormState = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    };
    const [formData, setFormData] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState(initialFormState);
    const [message, setMessage] = useState<string | null>(null);

    const [isDeleting, setIsDeleting] = useState(false);

    const fetchUserDetails = async () => {
        try {
            setIsLoading(true);
            const response = await userService.fetchUserDetails();

            if (response.status === 200) {
                setUser(response.data.user);
                setAddress(response.data.address);
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

    // Certificate uploads
    const uploadCertificate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCertificateErrorMessage('');

        if (!certificateFile) {
            setCertificateErrorMessage('Please select a file to upload');
            return;
        }

        const formFileData = new FormData();
        formFileData.append('file', certificateFile);

        setIsCertificateLoading(true);

        try {
            const uploadResponse = await userService.uploadCertificateImage(formFileData);

            if (uploadResponse.status === 200) {
                toast.success('certificate uploaded!');
            } else {
                toast.error('Error uploading the certificate!');
                return;
            }

            const uploadedCertificateUrl = uploadResponse.data.certificateUrl;

            // Update certificates
            setUser((prevUser: IUser) => ({
                ...prevUser,
                certificates: [...(prevUser?.certificates || []), uploadedCertificateUrl]
            }));

            // Reset file input
            setCertificateFile(null);
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response?.data?.error === 'Unknown error') {
                    setCertificateErrorMessage('There was an error, please try again!');
                } else {
                    setCertificateErrorMessage(error.response?.data?.message || 'Failed to upload certificate!');
                }
            }
            console.error('File uploading error: ', error);
        } finally {
            setIsCertificateLoading(false);
        }
    };

    // Certificate changing
    const handleCertificateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCertificateFile(e.target.files[0]);
        }
    };

    const openPreview = (url: string) => {
        setPreviewUrl(url);
        setShowPreview(true);
    };

    const closePreview = () => {
        setShowPreview(false);
        setPreviewUrl(null);
    };

    // Password changing
    const handleChangePassword = async (e: any) => {
        e.preventDefault();
        const { isValid, errors } = validateChangePassword(formData);
        setFormErrors(errors);

        if (isValid) {
            setIsLoading(true);
            try {
                const response = await userService.changePassword(formData);

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
                    const updateResponse = await userService.updateProfilePicture(uploadedImageUrl);

                    if (updateResponse.status === 200) {
                        toast.success('Profile updated!');
                    } else {
                        toast.error('Error updating the profile!');
                    }
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

    const openDeleteConfirmation = (index: number, url: string) => {
        setCertificateToDelete({ index, url });
        setShowDeleteConfirmation(true);
    };

    const cancelDelete = () => {
        setShowDeleteConfirmation(false);
        setCertificateToDelete(null);
    };

    const confirmDelete = async () => {
        setShowDeleteConfirmation(false);
        console.log('certificate to delete: ', certificateToDelete)
        if (certificateToDelete) {
            setIsDeleting(true);
            setDeletingIndex(certificateToDelete.index);
            try {
                const response = await userService.deleteCertificate(certificateToDelete.url);
                if (response.status === 200) {
                    setUser((prevUser: IUser) => ({
                        ...prevUser,
                        certificates: prevUser.certificates?.filter(cert => cert !== certificateToDelete.url)
                    }))
                    toast.success("Certificate deleted!");
                }
            } catch (error) {
                console.error("Error deleting certificate:", error);
                toast.error("Failed to delete certificate");
            } finally {
                setShowDeleteConfirmation(false);
                setCertificateToDelete(null);
                setIsDeleting(false);
                setDeletingIndex(null);
            }
        }
    };

    const tabs = [
        { id: 'info', label: 'Profile Info', icon: <User className="w-5 h-5" /> },
        { id: 'uploads', label: 'Uploads', icon: <Upload className="w-5 h-5" /> },
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
                            <div className="relative cursor-pointer">
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
                                        className='px-8 py-2 bg-[#688D48] rounded text-white'
                                        type="submit"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Updating..." : "Update Password"}
                                    </button>
                                    <button
                                        type="button"
                                        className="px-8 py-2 bg-gray-100 text-gray-700 font-medium rounded hover:bg-gray-200 transition"
                                        onClick={clearFields}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'uploads' && (
                        <div className="bg-gray-50 p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold mb-6 text-gray-700">Certificates</h2>
                            {certificateErrorMessage && (
                                <p className="text-red-500 mt-2 text-sm">{certificateErrorMessage}</p>
                            )}
                            {/* Certificates Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[80vh] overflow-y-auto pr-2">
                                {/* Upload Card*/}
                                <div className="border rounded-lg shadow-sm bg-white overflow-hidden h-64 flex flex-col">
                                    <div className="p-3 border-b">
                                        <h3 className="font-medium text-gray-700">Upload New Certificate</h3>
                                    </div>
                                    <div className="flex-1 p-4 flex flex-col">
                                        <form onSubmit={uploadCertificate} className="flex flex-col h-full">
                                            <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg flex-1 cursor-pointer hover:bg-gray-50 transition-colors duration-200">
                                                <input
                                                    type="file"
                                                    onChange={handleCertificateFileChange}
                                                    accept="image/*,.pdf"
                                                    className="hidden"
                                                />
                                                <div className="text-center p-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    <span className="mt-2 block text-sm text-gray-600 text-truncate-1">
                                                        {certificateFile ? (certificateFile as File).name : "Select a file or drag and drop"}
                                                    </span>
                                                    <span className="mt-1 block text-xs text-gray-500">
                                                        PDF or image files
                                                    </span>
                                                </div>
                                            </label>

                                            <button
                                                type="submit"
                                                disabled={isCertificateLoading || !certificateFile}
                                                className={`w-full mt-3 px-4 py-2 rounded-md transition-colors duration-200 ${isCertificateLoading || !certificateFile
                                                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                                    }`}
                                            >
                                                {isCertificateLoading ? (
                                                    <div className="flex items-center justify-center">
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Uploading...
                                                    </div>
                                                ) : 'Upload Certificate'}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Certificate Cards */}
                                {user?.certificates && user.certificates.length > 0 ? (
                                    user.certificates.map((certificateUrl: string, index: number) => (
                                        <div key={index} className="border rounded-lg shadow-sm bg-white overflow-hidden h-64 flex flex-col group relative">
                                            <div className="p-3 border-b flex justify-between items-center">
                                                <h3 className="font-medium text-gray-700">Certificate {index + 1}</h3>
                                            </div>
                                            <div
                                                className="flex-1 cursor-pointer transition-transform duration-300 group-hover:scale-105 overflow-hidden"
                                                onClick={() => openPreview(certificateUrl)}
                                            >
                                                {certificateUrl.endsWith('.pdf') ? (
                                                    <div className="h-full flex items-center justify-center bg-gray-100">
                                                        <div className="text-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            <p className="mt-2 text-sm text-gray-600">PDF Document</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={certificateUrl}
                                                        alt={`Certificate ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => openDeleteConfirmation(index, certificateUrl)}
                                                className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-red-100 transition-colors duration-200 z-10"
                                                title="Delete"
                                                disabled={isDeleting}
                                            >
                                                {isDeleting && deletingIndex === index ? (
                                                    <svg className="animate-spin h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-3 text-center py-8">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="mt-2 text-gray-500">No certificates uploaded yet.</p>
                                        <p className="text-sm text-gray-400">Use the upload card to add your first certificate.</p>
                                    </div>
                                )}
                            </div>

                            {/* Certificate Preview Modal with Download Option */}
                            {showPreview && previewUrl && (
                                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                                    <div className="relative bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden shadow-xl animate-fade-in">
                                        <div className="absolute top-0 right-0 p-4 flex space-x-2">
                                            <a
                                                href={previewUrl}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-blue-500 text-white rounded-full p-2 shadow-md hover:bg-blue-600 transition-colors duration-200"
                                                title="Download"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </a>
                                            <button
                                                onClick={closePreview}
                                                className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors duration-200"
                                                title="Close"
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="h-full overflow-auto p-6">
                                            {previewUrl.endsWith('.pdf') ? (
                                                <iframe
                                                    src={previewUrl}
                                                    className="w-full h-[80vh] border"
                                                    title="PDF Preview"
                                                ></iframe>
                                            ) : (
                                                <img
                                                    src={previewUrl}
                                                    alt="Certificate Preview"
                                                    className="max-w-full max-h-[80vh] mx-auto object-contain"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Delete Confirmation Modal */}
                            {showDeleteConfirmation && (
                                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                                    <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl animate-fade-in">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
                                        <p className="text-gray-500 mb-6">Are you sure you want to delete this certificate? This action cannot be undone.</p>
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => cancelDelete()}
                                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={confirmDelete}
                                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
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
                {activeTab === 'info' ? (
                    <div className="bg-gray-100 p-4 flex items-center justify-between border-t">
                        <button
                            className='ml-3 px-8 py-2 bg-[#688D48] rounded text-white'
                            onClick={() => setIsEditModalOpen(true)}
                        >Edit Profile</button>
                        <p className="text-sm text-gray-600 px-3">Profile - {user?.name}</p>
                    </div>) : (
                    <div className="bg-gray-100 p-4 flex items-center justify-center border-t">
                        <p className="text-sm text-gray-600 px-3">Profile - {user?.name}</p>
                    </div>)
                }
            </div>
        </>
    );
};

export default Profile;