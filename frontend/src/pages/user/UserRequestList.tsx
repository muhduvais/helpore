import { useState, useEffect, useCallback } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Search,
  ListFilter,
  HandHeart,
  Ambulance,
  User
} from 'lucide-react';
import { FaAngleLeft, FaAngleRight, FaWheelchair } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { userService } from '@/services/user.service';
import asset_picture from '../../assets/asset_picture.png';
import { Input } from '@/components/ui/input';
import { useDebounce } from 'use-debounce';
import { IAssetRequest } from '@/interfaces/userInterface';
import { IAssistanceRequest } from '@/interfaces/adminInterface';
import { RootState } from '@/redux/store';
import loading_logo from "../../assets/Logo-black-short.png"

const limit = 4;

type statusType = 'pending' | 'approved' | 'rejected' | 'completed';
type requestType = 'volunteer' | 'ambulance';
type filterType = 'all' | 'pending' | 'approved' | 'rejected' | 'completed';

const getStatusColor = (status: statusType) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

const getStatusIcon = (status: statusType) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
    default:
      return <Clock className="h-4 w-4 text-yellow-600" />;
  }
};

const getTypeIcon = (type: requestType) => {
  switch (type.toLowerCase()) {
    case 'ambulance':
      return <Ambulance className="h-6 w-6" />;
    case 'volunteer':
      return <HandHeart className="h-6 w-6" />;
    default:
      return <HandHeart className="h-6 w-6" />;
  }
};

const UserRequests = () => {
  const [queryParams] = useSearchParams();
  const defaultTab = queryParams.get('tab') || 'assets';
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  // Asset request states
  const [requests, setRequests] = useState<IAssetRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('card');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);

  // Assistance request states
  const [assistanceRequests, setAssistanceRequests] = useState<IAssistanceRequest[]>([]);
  const [isAssistanceLoading, setIsAssistanceLoading] = useState(true);
  const [assistanceError, setAssistanceError] = useState<string | null>(null);
  const [assistanceFilter, setAssistanceFilter] = useState('all');
  const [assistanceSearchQuery, setAssistanceSearchQuery] = useState('');
  const [assistanceCurrentPage, setAssistanceCurrentPage] = useState(1);
  const [assistanceTotalPages, setAssistanceTotalPages] = useState(1);
  const [assistanceTotalRequests, setAssistanceTotalRequests] = useState(0);

  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [debouncedAssistanceSearch] = useDebounce(assistanceSearchQuery, 500);

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await userService.fetchMyAssetRequests(
        currentPage,
        limit,
        debouncedSearch.trim(),
        filter !== 'all' ? filter : ''
      );

      if (response.status === 200) {
        const data = response.data;
        setRequests(data.assetRequests);
        setTotalPages(data.totalPages);
        setTotalRequests(data.totalRequests);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data.message || 'Error fetching requests');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, filter]);

  const fetchAssistanceRequests = useCallback(async () => {
    try {
      setIsAssistanceLoading(true);
      const response = await userService.fetchMyAssistanceRequests(
        assistanceCurrentPage,
        limit,
        debouncedAssistanceSearch.trim(),
        assistanceFilter !== 'all' ? assistanceFilter : ''
      );

      if (response.status === 200) {
        setAssistanceRequests(response.data.assistanceRequests);
        setAssistanceTotalPages(response.data.totalPages);
        setAssistanceTotalRequests(response.data.totalRequests);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setAssistanceError(error.response?.data.message || 'Error fetching assistance requests. Please try again.');
      } else {
        setAssistanceError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsAssistanceLoading(false);
    }
  }, [assistanceCurrentPage, debouncedAssistanceSearch, assistanceFilter]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleAssistanceSearch = useCallback((value: string) => {
    setAssistanceSearchQuery(value);
    setAssistanceCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((value: filterType) => {
    setFilter(value);
    setCurrentPage(1);
  }, []);

  const handleAssistanceFilterChange = useCallback((value: filterType) => {
    setAssistanceFilter(value);
    setAssistanceCurrentPage(1);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchRequests();
    }
  }, [isLoggedIn, fetchRequests]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchAssistanceRequests();
    }
  }, [isLoggedIn, fetchAssistanceRequests]);

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  const RequestCard: React.FC<{ request: IAssetRequest }> = ({ request }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer h-full">
        <div className="p-4 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={request.asset.image || asset_picture}
                alt={'asset'}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-medium text-gray-800">{request.asset.name}</h3>
                <p className="text-sm text-gray-500">{request.asset.category}</p>
              </div>
            </div>
            <Badge className={getStatusColor(request.status)}>
              <span className="flex items-center gap-1">
                {getStatusIcon(request.status)}
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </Badge>
          </div>

          {/* Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <div>
                <p className="font-medium">Requested For</p>
                <p>{format(new Date(request.requestedDate), 'PPP')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Package className="h-4 w-4" />
              <div>
                <p className="font-medium">Quantity</p>
                <p>{request.quantity} units</p>
              </div>
            </div>
          </div>

          {/* Comment Section */}
          <div className="mt-4 flex-1 min-h-[80px]">
            {request.comment ? (
              <div className="h-full p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p className="font-medium">Admin Comment:</p>
                <p>{request.comment}</p>
              </div>
            ) : (
              <div className="h-full p-3 bg-gray-50/50 rounded-lg text-sm text-gray-400 flex items-center justify-center">
                No admin comments yet
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );

  const AssistanceRequestCard: React.FC<{ request: IAssistanceRequest }> = ({ request }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <div className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                {getTypeIcon(request.type)}
              </div>
              <div>
                <h3 className="font-medium text-gray-800">
                  {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Assistance
                </h3>
                <p className="text-sm text-gray-500">
                  {request.description && request.description.length > 50
                    ? `${request.description.substring(0, 50)}...`
                    : request.description}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(request.status)}>
              <span className="flex items-center gap-1">
                {getStatusIcon(request.status)}
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <div>
                <p className="font-medium">Requested For</p>
                <p>{format(new Date(request.requestedDate), 'PPP')}</p>
              </div>
            </div>
            {request.volunteer && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <div>
                  <p className="font-medium">Assigned Volunteer</p>
                  <p>{request.volunteer.name || 'volunteer name'}</p>
                </div>
              </div>
            )}
          </div>

          {/* View More */}
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              className="text-[#688D48] border-[#688d4855] hover:bg-[#688D48] opacity-80 hover:opacity-100 hover:text-white transition-colors"
              onClick={() => navigate(`/user/assistanceRequests/${request._id}`)}
            >
              View More
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 mt-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Requests</h1>
        <div className="flex gap-4">
          <Link to="/user/assets">
            <Button className="bg-[#688D48] hover:bg-[#557239] text-white">
              <Package className="mr-2 h-4 w-4" />
              Request New Asset
            </Button>
          </Link>
          <Link to="/user/assistanceRequest">
            <Button className="bg-[#688D48] hover:bg-[#557239] text-white">
              <HandHeart className="mr-2 h-4 w-4" />
              Request Assistance
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="assets" className="flex items-center gap-2">
            <FaWheelchair className="h-4 w-4" />
            Asset Requests
          </TabsTrigger>
          <TabsTrigger value="assistance" className="flex items-center gap-2">
            <HandHeart className="h-4 w-4" />
            Assistance Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-6">
          {/* Asset Requests Content */}
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={filter} onValueChange={handleFilterChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setView(view === 'card' ? 'table' : 'card')}
                >
                  <ListFilter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Results Summary */}
          {!isLoading && requests.length > 0 && (
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalRequests)} of {totalRequests} requests
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-center p-4">
              {error}
            </div>
          )}

          {/* Requests List */}
          {isLoading ? (
            <div className="flex justify-center items-center h-72">
              <img src={loading_logo} alt="Loading..." className='flip-animation' />
            </div>
          ) : requests.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Requests Found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || filter !== 'all'
                  ? 'No requests match your search criteria'
                  : "You haven't made any asset requests yet."}
              </p>
              <Link to="/user/assets">
                <Button className="bg-[#688D48] hover:bg-[#557239] text-white">
                  Browse Assets
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requests.map((request) => (
                  <RequestCard key={request._id} request={request} />
                ))}
              </div>

              {/* Updated Pagination */}
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

              {/* Total Count */}
              <div className="text-center text-sm text-gray-500">
                Showing {requests.length} requests
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="assistance" className="space-y-6">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search assistance requests..."
                    value={assistanceSearchQuery}
                    onChange={(e) => handleAssistanceSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Select value={assistanceFilter} onValueChange={handleAssistanceFilterChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setView(view === 'card' ? 'table' : 'card')}
                >
                  <ListFilter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Results Summary */}
          {!isAssistanceLoading && assistanceRequests.length > 0 && (
            <div className="text-sm text-gray-500">
              Showing {((assistanceCurrentPage - 1) * limit) + 1} to {Math.min(assistanceCurrentPage * limit, assistanceTotalRequests)} of {assistanceTotalRequests} requests
            </div>
          )}

          {/* Error Message */}
          {assistanceError && (
            <div className="text-red-500 text-center p-4">
              {assistanceError}
            </div>
          )}

          {/* Assistance Requests List */}
          {isAssistanceLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <DotLottieReact
                src="https://lottie.host/525ff46b-0a14-4aea-965e-4b22ad6a8ce7/wGcySY4DHd.lottie"
                loop
                autoplay
                style={{ width: '50px', height: '50px' }}
              />
            </div>
          ) : assistanceRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <HandHeart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Assistance Requests Found</h3>
              <p className="text-gray-500 mb-4">
                {assistanceSearchQuery || assistanceFilter !== 'all'
                  ? 'No requests match your search criteria'
                  : "You haven't made any assistance requests yet."}
              </p>
              <Link to="/user/request-assistance">
                <Button className="bg-[#688D48] hover:bg-[#557239] text-white">
                  Request Assistance
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assistanceRequests.map((request) => (
                  <AssistanceRequestCard key={request._id} request={request} />
                ))}
              </div>

              {/* Pagination */}
              {assistanceTotalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setAssistanceCurrentPage(assistanceCurrentPage - 1)}
                    disabled={assistanceCurrentPage === 1}
                    className="flex items-center gap-1"
                  >
                    <FaAngleLeft />
                    Prev
                  </Button>

                  <div className="flex gap-2">
                    {[...Array(assistanceTotalPages)].map((_, index) => (
                      <Button
                        key={index}
                        variant={assistanceCurrentPage === index + 1 ? "default" : "outline"}
                        onClick={() => setAssistanceCurrentPage(index + 1)}
                        className={
                          assistanceCurrentPage === index + 1
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
                    onClick={() => setAssistanceCurrentPage(assistanceCurrentPage + 1)}
                    disabled={assistanceCurrentPage === assistanceTotalPages}
                    className="flex items-center gap-1"
                  >
                    Next
                    <FaAngleRight />
                  </Button>
                </div>
              )}

              {/* Total Count */}
              <div className="text-center text-sm text-gray-500">
                Showing {assistanceRequests.length} assistance requests
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserRequests;