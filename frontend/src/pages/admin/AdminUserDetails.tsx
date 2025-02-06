import { Navigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { FaAngleRight, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity, FaGlobe } from "react-icons/fa";
import { IUser } from '../../interfaces/userInterface';
import profile_pic from '../../assets/profile_pic.png';
import { Link } from 'react-router-dom';
import { adminService } from '@/services/adminService';
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

interface IAddress {
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: number;
    latitude: string;
    longtitude: string;
}

const AdminUserDetails = () => {
    const params = useParams();
    const userId = params.id || '';

    const [user, setUser] = useState<IUser | null>(null);
    const [address, setAddress] = useState<IAddress | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

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
                setAddress(response.data.address);
            }
        } catch (error) {
            if (error instanceof AxiosError) {
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
        } catch (error) {
            setError('Error updating user status');
        }
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
                            ? `Are you sure you want to unblock ${user?.name}? They will regain access to all features.`
                            : `Are you sure you want to block ${user?.name}? This will prevent them from accessing the platform.`}
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
                                    <span className={`absolute bottom-2 right-2 w-4 h-4 rounded-full ${user?.isBlocked ? 'bg-gray-400' : 'bg-green-500'}`} />
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
                                value={`${address.latitude}, ${address.longtitude}`}
                            />
                        </div>
                    ) : (
                        <p className="text-gray-500">No address information available</p>
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
        </div>
    );
};

export default AdminUserDetails;