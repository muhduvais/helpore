import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, Navigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AxiosError } from 'axios';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import profile_pic from '../../assets/profile_pic.png';
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
    HeartHandshake,
    Send,
    MessageSquare,
    Check,
    CheckIcon,
    CheckSquare,
    CheckCircle2Icon
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from "sonner";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { chatService } from '@/services/chat.service';
import { IMessageDocument } from '@/interfaces/chatInterface';
import { volunteerService } from '@/services/volunteer.service';
import { io, Socket } from 'socket.io-client';
import { useNotifications } from '@/context/notificationContext';
import { adminService } from '@/services/admin.service';

interface IAssistanceRequest {
    _id: string;
    type: 'volunteer' | 'ambulance';
    description: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    requestedDate: string;
    requestedTime: string;
    priority: 'urgent' | 'normal';
    volunteerType?: 'medical' | 'eldercare' | 'maintenance' | 'transportation' | 'general';
    volunteer?: {
        _id: string;
        name: string;
        phone: string;
        email: string;
        profilePicture: string;
    };
    user?: {
        _id: string;
        name: string;
        phone: string;
        email: string;
        profilePicture: string;
    };
    address: {
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

    const [queryParams] = useSearchParams();

    const [activeTab, setActiveTab] = useState(() => {
        return queryParams.get('tab') || 'details';
    });

    const [request, setRequest] = useState<IAssistanceRequest | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    // Chat state
    const [messages, setMessages] = useState<IMessageDocument[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const userId = useSelector((state: any) => state.auth.userId);
    const authToken = useSelector((state: any) => state.auth.accessToken);
    const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

    const { markAllAsRead } = useNotifications();

    useEffect(() => {
        const tab = queryParams.get('tab');
        if (tab) {
            setActiveTab(tab);
        }
    }, [queryParams]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const requestId = id || '';
                const response = await volunteerService.fetchAssistanceRequestDetails(requestId);

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

                    const tabParam = queryParams.get('tab');
                    if (!tabParam && response.data.requestDetails.status === 'approved') {
                        setActiveTab('details');
                    }
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

        fetchData();
    }, [id]);

    useEffect(() => {
        if (request?.status === 'approved' && authToken) {
            socketRef.current = chatService.connectSocket(authToken);

            chatService.setupListeners(
                socketRef.current,
                (message) => {
                    console.log('Message received in state update:', message);
                    setMessages((prevMessages) => [...prevMessages, message]);
                },
                (data) => {
                    setIsTyping(data.isTyping && data.userId !== userId);
                }
            );

            return () => {
                if (socketRef.current) {
                    chatService.disconnectSocket(socketRef.current);
                }
            };
        }
    }, [request, authToken, userId, activeTab]);

    useEffect(() => {
        if (activeTab === 'chat' && request?.status === 'approved' && socketRef.current && id) {
            chatService.joinConversation(socketRef.current, id);

            markAllAsRead();

            const fetchMessages = async () => {
                try {
                    setIsLoadingMessages(true);
                    const response = await chatService.getConversationMessages(id);

                    if (response.status === 200) {
                        setMessages(response.data.data);
                    }
                } catch (error) {
                    console.error('Error fetching messages:', error);
                    toast.error('Failed to load messages');
                } finally {
                    setIsLoadingMessages(false);
                }
            };

            fetchMessages();

            return () => {
                if (socketRef.current) {
                    chatService.leaveConversation(socketRef.current, id);
                }
            };
        }
    }, [activeTab, request, id]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !request?.user?._id || !id) return;

        try {
            await chatService.sendMessage(request.user._id, messageInput, id, 'volunteers', 'users');
            setMessageInput('');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessageInput(e.target.value);

        if (socketRef.current && id) {
            chatService.sendTypingStatus(socketRef.current, id, true);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                if (socketRef.current && id) {
                    chatService.sendTypingStatus(socketRef.current, id, false);
                }
            }, 2000);
        }
    };

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

    const handleCompleteRequest = async () => {
        try {
            const updateResponse = await adminService.updateAssistanceRequestStatus(request?._id || '', 'complete');
            if (updateResponse.status === 200) {
                toast.success('Status updated!');
                setRequest((request: any) => ({
                    ...request,
                    status: 'completed'
                }));
            }
        } catch (error) {
            toast.error('Error updating request');
            console.error('Error updating request:', error);
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

    const formatMessageTime = (dateString: string) => {
        return format(new Date(dateString), 'h:mm a');
    };

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

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

    const CancelDialog = () => (
        <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancel Assistance Request</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to cancel this request? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsCancelModalOpen(false)}
                    >
                        No, Keep Request
                    </Button>
                    <Button
                        variant="destructive"
                        // onClick={handleCancelRequest}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Cancelling...' : 'Yes, Cancel Request'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-4 sm:p-6"
            >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Link to="/volunteer/requests">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="text-[#688D48] h-5 w-5" />
                                </Button>
                            </motion.div>
                        </Link>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Request Details</h1>
                    </div>

                    <div className="flex gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <div className='flex items-center gap-x-2'>
                                {request?.status !== 'completed' &&
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-gray-500"
                                        onClick={handleCompleteRequest}
                                    >
                                        <CheckCircle2Icon className="mr-2 w-4 h-4 text-green-500" /> Mark as completed
                                    </Button>}
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-gray-500"
                                    onClick={handleShareRequest}
                                >
                                    <Share2 className="mr-2 w-4 h-4" /> Share
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Info */}
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
                                            <img src={request.user.profilePicture || profile_pic} alt="pic" width="120px" className='rounded-md' />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Emergency Contact Card */}
                        <Card className="p-6">
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

                    {/* Right Column - Tabs Content */}
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2"
                    >
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="w-full"
                        >
                            <TabsList className={`grid w-full ${request?.status === 'approved' ? 'grid-cols-3' : 'grid-cols-2'} bg-gray-100 p-1 rounded-xl`}>
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

                                {request?.status === 'approved' && (
                                    <TabsTrigger
                                        value="chat"
                                        className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        Chat
                                    </TabsTrigger>
                                )}
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
                                                    Your request is being reviewed. We'll notify you once it's approved.
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

                            {/* Chat Tab Content */}
                            {request?.status === 'approved' && (
                                <TabsContent value="chat">
                                    <Card className="flex flex-col h-[600px]">
                                        {/* Chat Header */}
                                        <div className="p-4 border-b flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage
                                                        src={request?.user?.profilePicture || profile_pic}
                                                        alt={request?.user?.name}
                                                    />
                                                    <AvatarFallback>
                                                        {request?.user?.name?.charAt(0) || 'V'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-medium text-gray-800">
                                                        {request?.user?.name || 'User'}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">
                                                        {isTyping ? 'Typing...' : 'Available to chat'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Messages Container */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                            {isLoadingMessages ? (
                                                <div className="flex justify-center items-center h-full">
                                                    <DotLottieReact
                                                        src="https://lottie.host/525ff46b-0a14-4aea-965e-4b22ad6a8ce7/wGcySY4DHd.lottie"
                                                        loop
                                                        autoplay
                                                        style={{ width: '50px', height: '50px' }}
                                                    />
                                                </div>
                                            ) : messages.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full text-center">
                                                    <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
                                                    <h4 className="text-lg font-medium text-gray-600">No messages yet</h4>
                                                    <p className="text-sm text-gray-500">
                                                        Start a conversation with {request?.user?.name || 'your requester'}
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    {messages.map((message, index) => (
                                                        <div
                                                            key={index}
                                                            className={`flex ${message.sender === userId ? 'justify-end' : 'justify-start'}`}
                                                        >
                                                            <div
                                                                className={`rounded-2xl px-4 py-2 max-w-[80%] ${message.sender === userId

                                                                    ? 'bg-[#688D48] text-white'
                                                                    : 'bg-gray-100 text-gray-800'
                                                                    }`}
                                                            >
                                                                <p>{message.content}</p>
                                                                <div className={`text-xs mt-1 ${message.sender === userId ? 'text-gray-200' : 'text-gray-500'
                                                                    }`}>
                                                                    {formatMessageTime(message.createdAt.toString())}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {/* Typing indicator */}
                                                    {isTyping && (
                                                        <div className="flex justify-start">
                                                            <div className="bg-gray-100 text-gray-800 rounded-2xl px-4 py-2">
                                                                <div className="flex space-x-1">
                                                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div ref={messagesEndRef} />
                                                </>
                                            )}
                                        </div>

                                        {/* Message Input */}
                                        <div className="p-4 border-t">
                                            <div className="flex items-center gap-2">
                                                <Textarea
                                                    value={messageInput}
                                                    onChange={handleInputChange}
                                                    placeholder={`Message ${request?.user?.name || 'Requester'}...`}
                                                    className="flex-1 resize-none"
                                                    rows={1}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleSendMessage();
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    onClick={handleSendMessage}
                                                    size="icon"
                                                    disabled={!messageInput.trim()}
                                                    className="bg-[#688D48] hover:bg-[#5a7a3e] text-white"
                                                >
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </TabsContent>
                            )}
                        </Tabs>
                    </motion.div>
                </div>
            </motion.div>

            <CancelDialog />
        </>
    )
}

export default AssistanceRequestDetails;