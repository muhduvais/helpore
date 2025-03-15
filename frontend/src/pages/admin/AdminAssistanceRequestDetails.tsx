import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AxiosError } from 'axios';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import profile_pic from '../../assets/profile_pic.png';
import AssignVolunteerModal from '../../components/AssignVolunteerModal';
import {
    ArrowLeft,
    Share2,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Calendar,
    MapPin,
    Mail,
    Phone,
    AlertTriangle,
    UserCheck,
    History as HistoryIcon,
    FileText,
    Ambulance,
    HeartHandshake
} from 'lucide-react';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from "sonner";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { adminService } from '@/services/admin.service';

interface IAssistanceRequest {
    _id: string;
    type: 'volunteer' | 'ambulance';
    description: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedDate: string;
    requestedTime: string;
    priority: 'urgent' | 'normal';
    volunteerType?: 'medical' | 'eldercare' | 'maintenance' | 'transportation' | 'general';
    user?: {
        _id: string;
        name: string;
        phone: string;
        email: string;
        profilePicture: string;
    };
    volunteer?: {
        _id: string;
        name: string;
        phone: string;
        email: string;
        profilePicture: string;
    };
    address: {
        _id: string;
        street: string;
        city: string;
        state: string;
        zipCode: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface HistoryEntry {
    date: string;
    action: string;
    details: string;
}

const AssistanceRequestDetails: React.FC = () => {

    const { id } = useParams();
    const [request, setRequest] = useState<IAssistanceRequest | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const requestId = id || '';
            const response = await adminService.fetchAssistanceRequestDetails(requestId);

            if (response.status === 200) {
                setRequest(response.data.requestDetails);
                setHistory([
                    {
                        date: new Date().toISOString(),
                        action: 'Status Update',
                        details: `Request ${response.data.requestDetails.status}`
                    },
                    {
                        date: response.data.requestDetails.createdAt,
                        action: 'Request Created',
                        details: 'Assistance request submitted'
                    }
                ]);
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.response?.data.message || 'Error fetching request details');
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleShareRequest = () => {
        if (navigator.share) {
            navigator.share({
                title: `Assistance Request - ${request?.type}`,
                text: request?.description,
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(window.location.href)
                .then(() => toast.success('Link copied to clipboard!'))
                .catch(console.error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved':
                return <CheckCircle2 className="h-4 w-4" />;
            case 'rejected':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const getPriorityBadge = (priority: string) => {
        return (
            <Badge variant="outline" className={
                priority === 'urgent'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
            }>
                {priority.toUpperCase()}
            </Badge>
        );
    };

    const getTypeIcon = (type: string) => {
        return type === 'ambulance'
            ? <Ambulance className="h-5 w-5 text-red-500" />
            : <HeartHandshake className="h-5 w-5 text-green-500" />;
    };

    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center items-center min-h-[60vh]"
            >
                <DotLottieReact
                    src="https://lottie.host/525ff46b-0a14-4aea-965e-4b22ad6a8ce7/wGcySY4DHd.lottie"
                    loop
                    autoplay
                    style={{ width: '100px', height: '100px' }}
                />
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="p-8 text-center"
            >
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">Request Not Found</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <Link to="/user/requests">
                    <Button variant="outline" className="hover:bg-[#688D48] hover:text-white transition-all">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Requests
                    </Button>
                </Link>
            </motion.div>
        );
    }

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-4 sm:p-6"
            >
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Link to="/admin/requestManagement?tab=assistance">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="text-[#688D48] h-5 w-5" />
                                </Button>
                            </motion.div>
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Request Details</h1>
                    </div>

                    <div className="flex gap-2">
                        {request?.status === 'pending' && (
                            <AssignVolunteerModal
                                requestId={request?._id}
                                onAssign={() => {
                                    fetchData();
                                }}
                            />
                        )}
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                onClick={handleShareRequest}
                                variant="outline"
                                className="border-[#688D48] text-[#688D48] hover:bg-[#688D48] hover:text-white"
                            >
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                            </Button>
                        </motion.div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Quick Info */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="p-6 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        {getTypeIcon(request?.type || 'volunteer')}
                                        {request && <h2 className="font-semibold text-xl text-gray-800">
                                            {request?.type.charAt(0).toUpperCase() + request?.type.slice(1)} Request
                                        </h2>}
                                    </div>
                                    {getPriorityBadge(request?.priority || 'normal')}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Status</span>
                                        {request && <Badge className={getStatusColor(request?.status || 'pending')}>
                                            <span className="flex items-center gap-1">
                                                {getStatusIcon(request?.status || 'pending')}
                                                {request?.status.charAt(0).toUpperCase() + request?.status.slice(1)}
                                            </span>
                                        </Badge>}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="h-4 w-4" />
                                            <span>{format(new Date(request?.requestedDate || ''), 'PPP')}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Clock className="h-4 w-4" />
                                            <span>{request?.requestedTime}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* User Details */}
                                {request?.user && (
                                    <div className="border-t pt-4 flex items justify-between">
                                        <div className="left">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Requester Details</h3>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <UserCheck className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-700">{request.user.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-700">{request.user.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-700">{request.user.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="right flex items-start justify-end">
                                            <img
                                                src={request.user.profilePicture || profile_pic}
                                                alt="Requester"
                                                className="w-[100px] h-[100px] rounded-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Volunteer Details */}
                                {request?.volunteer && (
                                    <div className="border-t pt-4 flex items justify-between">
                                        <div className="left">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Assigned Volunteer</h3>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <UserCheck className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-700">{request.volunteer.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-700">{request.volunteer.phone}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-gray-500" />
                                                    <span className="text-gray-700">{request.volunteer.email}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="right flex items-start justify-end">
                                            <img
                                                src={request.volunteer.profilePicture || profile_pic}
                                                alt="Volunteer"
                                                className="w-[100px] h-[100px] rounded-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                    </motion.div>

                    {/* Right Column - Tabs Content */}
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2"
                    >
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
                                <TabsTrigger
                                    value="details"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
                                >
                                    <FileText className="h-4 w-4" />
                                    Details
                                </TabsTrigger>
                                <TabsTrigger
                                    value="history"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
                                >
                                    <HistoryIcon className="h-4 w-4" />
                                    History
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="details">
                                <Card>
                                    <div className="p-6 space-y-6">
                                        {/* Description Section */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                                            <p className="text-gray-600">{request?.description}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Request Details */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Request Details</h3>
                                                <div className="space-y-2">
                                                    <p className="text-sm">
                                                        <span className="text-gray-500">Type:</span>{' '}
                                                        <span className="text-gray-700">{request?.type}</span>
                                                    </p>
                                                    {request?.volunteerType && (
                                                        <p className="text-sm">
                                                            <span className="text-gray-500">Volunteer Type:</span>{' '}
                                                            <span className="text-gray-700">{request.volunteerType}</span>
                                                        </p>
                                                    )}
                                                    <p className="text-sm">
                                                        <span className="text-gray-500">Priority:</span>{' '}
                                                        <span className="text-gray-700">{request?.priority}</span>
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="text-gray-500">Created:</span>{' '}
                                                        <span className="text-gray-700">
                                                            {format(new Date(request?.createdAt || ''), 'PPP')}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Location Details */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Location</h3>
                                                <div className="space-y-2">
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                                                        <div>
                                                            <p className="text-gray-700">{request?.address.street}</p>
                                                            <p className="text-gray-600">
                                                                {request?.address.city}, {request?.address.state} {request?.address.zipCode}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status Alert */}
                                        {request?.status === 'pending' && (
                                            <Alert>
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertTitle>Request Pending</AlertTitle>
                                                <AlertDescription>
                                                    The request is waiting to complete the review process. Please update the status after reviewing.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="history">
                                <Card>
                                    <div className="p-6">
                                        <div className="space-y-6">
                                            <h3 className="text-lg font-semibold text-gray-800">Request Timeline</h3>
                                            <div className="space-y-4">
                                                {history.map((entry, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-start gap-4 pb-4 border-l-2 border-gray-200 pl-4 relative"
                                                    >
                                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#688D48]" />
                                                        <div className="flex-1 space-y-1">
                                                            <p className="text-sm font-medium text-gray-800">
                                                                {entry.action}
                                                            </p>
                                                            <p className="text-sm text-gray-600">{entry.details}</p>
                                                            <p className="text-xs text-gray-400">
                                                                {format(new Date(entry.date), 'PPP p')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        {/* Emergency Contact Card */}
                        <Card className="p-6 mt-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Emergency Contact</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600">helpore@support.com</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600">9746483041</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div >
            </motion.div >

            {/* Cancel Request Modal */}
            {/* < CancelDialog /> */}
        </>
    );
};

export default AssistanceRequestDetails;