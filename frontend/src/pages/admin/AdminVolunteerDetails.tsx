import { Navigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaAngleRight, FaUser, FaEnvelope, FaPhone } from "react-icons/fa";
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
import { IVolunteer } from '@/components/AssignVolunteerModal';

const AdminVolunteerDetails = () => {
    const params = useParams();
    const volunteerId = params.id || '';

    const [volunteer, setVolunteer] = useState<IVolunteer | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

    if (!isLoggedIn) {
        return <Navigate to={'/admin/login'} />;
    }

    const fetchVolunteerDetails = async () => {
        try {
            setIsLoading(true);
            setError('');
            const response = await adminService.fetchVolunteerDetails(volunteerId);
            if (response.status === 200) {
                setVolunteer(response.data.volunteer);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || 'Error fetching volunteer details');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleBlockUnblock = async () => {
        try {
            if (!volunteer) return;
            const action = volunteer.isBlocked ? 'unblock' : 'block';
            const response = await adminService.volunteerBlockToggle(volunteerId, action);
            if (response.status === 200) {
                setVolunteer({
                    ...volunteer,
                    isActive: volunteer.isBlocked || false,
                    isBlocked: !volunteer.isBlocked,
                });
            }
        } catch (error) {
            setError('Error updating volunteer status');
        }
    };

    useEffect(() => {
        fetchVolunteerDetails();
    }, [volunteerId]);

    const VolunteerInfoField = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number | undefined }) => (
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
                    variant={volunteer?.isBlocked ? "destructive" : "outline"}
                    className="w-full max-w-xs"
                >
                    {volunteer?.isBlocked ? 'Unblock Volunteer' : 'Block Volunteer'}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {volunteer?.isBlocked ? 'Unblock Volunteer' : 'Block Volunteer'}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {volunteer?.isBlocked
                            ? `Are you sure you want to unblock ${volunteer?.name}? They will regain access to all features.`
                            : `Are you sure you want to block ${volunteer?.name}? This will prevent them from accessing the platform.`}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBlockUnblock} className='bg-[#688D48]'>
                        {volunteer?.isBlocked ? 'Yes, unblock' : 'Yes, block'}
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
                <Link to="/admin/volunteerManagement" className="text-gray-500 hover:text-gray-700">
                    Volunteer Management
                </Link>
                <FaAngleRight className="text-gray-500" />
                <span className="text-gray-700">{volunteer?.name || 'Volunteer Details'}</span>
            </div>

            <Card>
                <CardContent className="p-6 relative">

                    <span className={`active-status absolute top-3 left-3 px-4 text-white text-sm ${volunteer?.isActive ? 'bg-green-600' : 'bg-red-500'} rounded`}>
                        {volunteer?.isActive ? 'Active' : 'Inactive'}
                    </span>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Left Column - Profile Picture and Status */}
                        <div className="space-y-4">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="relative">
                                    <img
                                        src={volunteer?.profilePicture || profile_pic}
                                        alt="Profile"
                                        className="w-48 h-48 rounded-full object-cover border-4 border-gray-100"
                                    />
                                    <span className={`absolute bottom-2 right-2 w-4 h-4 rounded-full ${volunteer?.isBlocked ? 'bg-gray-400' : 'bg-green-500'}`} />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold">{volunteer?.name}</h2>
                                    <p className="text-gray-500">Member since {new Date(volunteer?.createdAt || '').toLocaleDateString()}</p>
                                </div>
                                <BlockUnblockDialog />
                            </div>
                        </div>

                        {/* Right Column - Volunteer Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold mb-4">Volunteer Information</h3>
                            <div className="grid gap-4">
                                <VolunteerInfoField
                                    icon={FaUser}
                                    label="Full Name"
                                    value={volunteer?.name}
                                />
                                <VolunteerInfoField
                                    icon={FaEnvelope}
                                    label="Email Address"
                                    value={volunteer?.email}
                                />
                                <VolunteerInfoField
                                    icon={FaPhone}
                                    label="Phone Number"
                                    value={volunteer?.phone || 'N/A'}
                                />
                            </div>
                        </div>
                    </div>
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

export default AdminVolunteerDetails;