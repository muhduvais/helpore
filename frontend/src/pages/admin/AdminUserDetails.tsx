import { Navigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaAngleRight, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity, FaGlobe, FaCertificate, FaDownload, FaTimes, FaCalendarAlt } from "react-icons/fa";
import { IAddress, IUser } from '../../interfaces/userInterface';
import profile_pic from '../../assets/profile_pic.png';
import { Link } from 'react-router-dom';
import { adminService } from '@/services/admin.service';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface ICertificate {
    url: string;
    type: string;
    name: string;
    uploadedAt?: string;
    isVerified?: boolean;
}

const AdminUserDetails = () => {
    const params = useParams();
    const userId = params.id || '';

    const [user, setUser] = useState<IUser | null>(null);
    const [address, setAddress] = useState<IAddress | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const [certificates, setCertificates] = useState<any>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [previewName, setPreviewName] = useState<string>('');
    const [previewType, setPreviewType] = useState<string>('');

    const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

    if (!isLoggedIn) {
        return <Navigate to={'/admin/login'} />;
    }

    const fetchUserDetails = async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await adminService.fetchUserDetails(userId);
            if (response.status === 200) {
                setUser(response.data.user);
                setAddress(response.data?.address || null);
                
                // Handle if certificates are an array of strings (urls)
                if (response.data.user?.certificates) {
                    if (Array.isArray(response.data.user.certificates)) {
                        if (typeof response.data.user.certificates[0] === 'string') {
                            // Convert string URLs to certificate objects
                            const formattedCerts = response.data.user.certificates.map((url: string, index: number) => {
                                const fileExtension = url.split('.').pop()?.toLowerCase() || '';
                                const fileType = fileExtension === 'pdf' ? 'pdf' : 'image';
                                return {
                                    url: url,
                                    type: fileType,
                                    name: `Certificate ${ index + 1 } `,
                                    uploadedAt: new Date().toISOString(),
                                    isVerified: true
                                };
                            });
                            setCertificates(formattedCerts);
                        } else {
                            // Already in the correct format
                            setCertificates(response.data.user.certificates);
                        }
                    }
                }
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || 'Error fetching user details');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBlockUnblock = async () => {
        try {
            if (!user) return;
            const action = user.isBlocked ? 'unblock' : 'block';
            const response = await adminService.userBlockToggle(userId, action);
            if (response.status === 200) {
                setUser({
                    ...user,
                    isBlocked: !user.isBlocked,
                });
            }
        } catch (error: unknown) {
            setError('Error updating user status');
        }
    };

    // Certificate preview functions
    const openPreview = (url: string, name: string, type: string) => {
        setPreviewUrl(url);
        setPreviewName(name);
        setPreviewType(type);
        setShowPreview(true);
    };

    const closePreview = () => {
        setShowPreview(false);
        setPreviewUrl('');
        setPreviewName('');
        setPreviewType('');
    };

    useEffect(() => {
        fetchUserDetails();
    }, [userId]);

    const UserInfoField = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | undefined }) => (
        <div className="flex items-center gap-3 w-full p-3 bg-gray-50 rounded-lg">
            <Icon className="text-gray-500" size={20} />
            <div className="flex flex-col">
                <span className="text-sm text-gray-500">{label}</span>
                <span className="font-medium">{value || 'N/A'}</span>
            </div>
        </div>
    );

    const BlockUnblockDialog = () => (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant={user?.isBlocked ? "destructive" : "outline"}
                    className="w-full max-w-xs"
                >
                    {user?.isBlocked ? 'Unblock User' : 'Block User'}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {user?.isBlocked ? 'Unblock User' : 'Block User'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {user?.isBlocked
                            ? `Are you sure you want to unblock ${ user?.name }? They will regain access to all features.`
                            : `Are you sure you want to block ${ user?.name }? This will prevent them from accessing the platform.`}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBlockUnblock} className='bg-[#688D48]'>
                        {user?.isBlocked ? 'Yes, unblock' : 'Yes, block'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );

    // Certificate card component
    const CertificateCard = ({ certificate }: { certificate: ICertificate }) => {
        const fileType = certificate.type.toLowerCase();
        return (
            <div 
                className="border rounded-lg shadow-sm bg-white overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200 flex flex-col"
                onClick={() => openPreview(certificate.url, certificate.name, certificate.type)}
            >
                {/* Thumbnail Preview */}
                <div className="h-48 w-full overflow-hidden bg-gray-100 border-b relative">
                    {fileType === 'pdf' ? (
                        <div className="flex items-center justify-center h-full bg-gray-50">
                            <div className="text-4xl text-red-500">PDF</div>
                        </div>
                    ) : (
                        <img 
                            src={certificate.url} 
                            alt={certificate.name} 
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
                
                {/* Certificate Info */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="font-medium text-gray-700 truncate mb-1">{certificate.name}</h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                            <FaCalendarAlt />
                            <span>
                                {certificate.uploadedAt && new Date(certificate.uploadedAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                            {fileType.toUpperCase()}
                        </span>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(certificate.url, '_blank');
                            }}
                        >
                            <FaDownload size={14} />
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="p-5 space-y-4">
                <div className="flex gap-2 items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Card>
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Skeleton className="h-48 w-48 rounded-full mx-auto" />
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                            <div className="space-y-4">
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-16 w-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-5 space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex items-center gap-2 text-sm">
                <Link to="/admin/userManagement" className="text-gray-500 hover:text-gray-700">
                    User Management
                </Link>
                <FaAngleRight className="text-gray-500" />
                <span className="text-gray-700">{user?.name || 'User Details'}</span>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Left Column - Profile Picture and Status */}
                        <div className="space-y-4">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative">
                                    <img
                                        src={user?.profilePicture || profile_pic}
                                        alt="Profile"
                                        className="w-48 h-48 rounded-full object-cover border-4 border-gray-100"
                                    />
                                    <span className={`absolute bottom - 2 right - 2 w - 4 h - 4 rounded - full ${ user?.isBlocked ? 'bg-gray-400' : 'bg-green-500' } `} />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold">{user?.name}</h2>
                                    <p className="text-gray-500">Member since {new Date(user?.createdAt || '').toLocaleDateString()}</p>
                                </div>
                                <BlockUnblockDialog />
                            </div>
                        </div>

                        {/* Right Column - User Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold mb-4">User Information</h3>
                            <div className="grid gap-4">
                                <UserInfoField
                                    icon={FaUser}
                                    label="Full Name"
                                    value={user?.name}
                                />
                                <UserInfoField
                                    icon={FaEnvelope}
                                    label="Email Address"
                                    value={user?.email}
                                />
                                <UserInfoField
                                    icon={FaPhone}
                                    label="Phone Number"
                                    value={'9855896542'}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Address Section */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Address Information</h3>
                    {address ? (
                        <div className="grid md:grid-cols-2 gap-4">
                            <UserInfoField
                                icon={FaMapMarkerAlt}
                                label="Street Address"
                                value={address.street}
                            />
                            <UserInfoField
                                icon={FaCity}
                                label="City"
                                value={address.city}
                            />
                            <UserInfoField
                                icon={FaCity}
                                label="State"
                                value={address.state}
                            />
                            <UserInfoField
                                icon={FaGlobe}
                                label="Country"
                                value={address.country}
                            />
                            <UserInfoField
                                icon={FaMapMarkerAlt}
                                label="Pincode"
                                value={address.pincode.toString()}
                            />
                            <UserInfoField
                                icon={FaMapMarkerAlt}
                                label="Location"
                                value={`${ address.latitude }, ${ address.longtitude } `}
                            />
                        </div>
                    ) : (
                        <p className="text-gray-500">No address information available</p>
                    )}
                </CardContent>
            </Card>

            {/* Certificates Section */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">User Certificates</h3>
                        <span className="text-sm text-gray-500">
                            {certificates.length} {certificates.length === 1 ? 'certificate' : 'certificates'}
                        </span>
                    </div>
                    
                    {certificates.length > 0 ? (
                        <div className="max-h-[32rem] overflow-y-auto pr-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {certificates.map((certificate: ICertificate, index: number) => (
                                    <CertificateCard key={index} certificate={certificate} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <FaCertificate className="h-12 w-12 mx-auto text-gray-400" />
                            <p className="mt-2 text-gray-500">No certificates available</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Activity Section */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <p className="text-gray-500">No recent activity</p>
                </CardContent>
            </Card>

            {/* Certificate Preview Modal */}
            {showPreview && previewUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
                        {/* Modal Header */}
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <div className="flex items-center gap-2">
                                <FaCertificate className="text-blue-500" />
                                <h3 className="font-medium text-gray-800 truncate">{previewName}</h3>
                            </div>
                            <div className="flex space-x-2">
                                <a
                                    href={previewUrl}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
                                    title="Download"
                                >
                                    <FaDownload size={14} />
                                    <span>Download</span>
                                </a>
                                <button
                                    onClick={closePreview}
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 text-sm"
                                    title="Close"
                                >
                                    <FaTimes size={14} />
                                    <span>Close</span>
                                </button>
                            </div>
                        </div>
                        
                        {/* Preview Content */}
                        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4">
                            <div className="bg-white shadow-lg rounded-lg overflow-hidden max-h-full max-w-full">
                                {previewType.toLowerCase() === 'pdf' ? (
                                    <iframe
                                        src={previewUrl}
                                        className="w-full h-[70vh] border"
                                        title="PDF Preview"
                                    ></iframe>
                                ) : (
                                    <img
                                        src={previewUrl}
                                        alt="Certificate Preview"
                                        className="max-h-[75vh] object-contain mx-auto"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserDetails;