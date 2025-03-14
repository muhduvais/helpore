import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
    MapPin,
    Clock,
    User,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Search,
    ListFilter,
    Calendar
} from 'lucide-react';
import {
    Card,
    CardHeader,
    CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { volunteerService } from '@/services/volunteer.service';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { useDebounce } from 'use-debounce';

type VolunteerType = 'medical' | 'eldercare' | 'maintenance' | 'transportation' | 'default' | 'ambulance';

const limit = 6;

const VolunteerRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRequests, setTotalRequests] = useState(0);

    const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

    const debouncedSearch = useDebounce(searchQuery, 500);

    const fetchNearbyRequests = async () => {
        try {
            setLoading(true);
            const response = await volunteerService.fetchAssistanceRequests(
                currentPage,
                limit,
                searchQuery.trim(),
                filter !== 'all' ? filter : ''
            );

            setRequests(response.data.nearbyRequests || []);
            setTotalPages(response.data.totalPages);
            setTotalRequests(response.data.documentsCount);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch nearby requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNearbyRequests();
    }, [currentPage, searchQuery, filter]);

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    const handleRequestAction = async (requestId: string, action: string) => {
        try {
            const updateResponse = await volunteerService.updateRequestStatus(requestId, action);
            if (updateResponse.data.success) {
                toast.success(`Request ${action === 'approve' ? 'accepted' : 'declined'} successfully`);
            } else {
                toast.error(updateResponse.data.message);
            }
            fetchNearbyRequests();
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to ${action} request`);
        }
    };

    const getStatusColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'urgent':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    const getTypeIcon = (volunteerType: VolunteerType) => {
        const types = {
            medical: 'bg-red-100 text-red-800',
            ambulance: 'bg-red-100 text-red-800',
            eldercare: 'bg-purple-100 text-purple-800',
            maintenance: 'bg-yellow-100 text-yellow-800',
            transportation: 'bg-green-100 text-green-800',
            default: 'bg-gray-100 text-gray-800'
        };
        return types[volunteerType] || types.default;
    };

    const RequestCard: React.FC<{ request: any }> = ({ request }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="p-4 border-b">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-medium text-gray-900">{request.user?.name || 'Anonymous User'}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                                <MapPin className="h-4 w-4" />
                                <span>{request.distance} km away</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {request.volunteerType ? (<Badge className={getTypeIcon(request.volunteerType)}>
                                {request.volunteerType.charAt(0).toUpperCase() + request.volunteerType.slice(1)}
                            </Badge>) : (<Badge className={getTypeIcon('ambulance')}>
                                {'Ambulance'}
                            </Badge>)}
                            <Badge className={getStatusColor(request.priority)}>
                                <div className="flex items-center gap-1">
                                    {request.priority === 'urgent' && <AlertCircle className="h-4 w-4" />}
                                    {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                                </div>
                            </Badge>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-4">
                    <p className="text-gray-700 mb-4">{request.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <div>
                                <p className="font-medium">Requested For</p>
                                <p>{format(new Date(request.requestedDate), 'PPP')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <div>
                                <p className="font-medium">Estimated Time</p>
                                <p>{request.estimatedTravelTime}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-between gap-4">
                        <Button
                            onClick={() => handleRequestAction(request._id, 'approve')}
                            className="flex-1 bg-[#688D48] hover:bg-[#557239] text-white"
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Accept
                        </Button>
                        <Button
                            onClick={() => handleRequestAction(request._id, 'reject')}
                            variant="outline"
                            className="flex-1"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Decline
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <div className="p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Nearby Assistance Requests</h1>
                <Button
                    onClick={fetchNearbyRequests}
                    className="bg-[#688D48] hover:bg-[#557239] text-white"
                >
                    Refresh List
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search requests..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="ambulance">Ambulance</SelectItem>
                                <SelectItem value="medical">Medical</SelectItem>
                                <SelectItem value="eldercare">Eldercare</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                <SelectItem value="transportation">Transportation</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>

            {/* Results Summary */}
            {!loading && requests.length > 0 && (
                <div className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalRequests)} of {totalRequests} requests
                </div>
            )}

            {/* Requests List */}
            {loading ? (
                <div className="flex justify-center items-center min-h-[400px]">
                    <DotLottieReact
                        src="https://lottie.host/525ff46b-0a14-4aea-965e-4b22ad6a8ce7/wGcySY4DHd.lottie"
                        loop
                        autoplay
                        style={{ width: '100px', height: '100px' }}
                    />
                </div>
            ) : requests.length === 0 ? (
                <Card className="p-8 text-center">
                    <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Nearby Requests</h3>
                    <p className="text-gray-500 mb-4">
                        {searchQuery || filter !== 'all'
                            ? 'No requests match your search criteria'
                            : 'There are currently no assistance requests in your area'}
                    </p>
                </Card>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {requests && requests.map((request: any) => (
                            <RequestCard key={request._id} request={request} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 pt-6">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1"
                            >
                                <FaAngleLeft />
                                Prev
                            </Button>

                            <div className="flex gap-2">
                                {[...Array(totalPages)].map((_, index) => (
                                    <Button
                                        key={index}
                                        variant={currentPage === index + 1 ? "default" : "outline"}
                                        onClick={() => setCurrentPage(index + 1)}
                                        className={
                                            currentPage === index + 1
                                                ? "bg-[#688D48] hover:bg-[#557239]"
                                                : "hover:bg-gray-100"
                                        }
                                    >
                                        {index + 1}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1"
                            >
                                Next
                                <FaAngleRight />
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VolunteerRequests;