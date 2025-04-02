import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  Search,
  HandHeart,
  ChevronDown,
  ChevronUp,
  User,
  AlertCircle,
  Mail,
  Phone,
  MapPin,
  Shield,
  UserCheck,
  UserX,
  Coffee,
  Ambulance
} from 'lucide-react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useDebounce } from 'use-debounce';
import asset_picture from '../../assets/asset_picture.png';
import { adminService } from '@/services/admin.service';
import { IAssistanceRequestResponse } from '@/interfaces/adminInterface';
import { AxiosError } from 'axios';
// import { IAssetRequest } from '@/interfaces/userInterface';

// interface IPaginatedResponse {
//   assetRequests: IAssetRequest[];
//   totalPages: number;
//   totalRequests: number;
// }

interface IAssistancePaginatedResponse {
  assistanceRequests: IAssistanceRequestResponse[];
  totalPages: number;
  totalRequests: number;
}

const limit = 4;

const AdminRequests = () => {

  const [queryParams] = useSearchParams();
  const defaultTab = queryParams.get('tab') || 'assets';

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [expandedCard, setExpandedCard] = useState(null);
  const [totalDisplay, setTotalDisplay] = useState(totalRequests);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'approved' | 'rejected' | null;
    request: any | null;
  }>({
    open: false,
    type: null,
    request: null
  });
  const [actionComment, setActionComment] = useState('');
  const [userDetailsDialog, setUserDetailsDialog] = useState({
    open: false,
    userId: null
  });
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  // Assistance request states
  const [assistanceRequests, setAssistanceRequests] = useState<IAssistanceRequestResponse[]>([]);
  const [isAssistanceLoading, setIsAssistanceLoading] = useState(true);
  const [assistanceError, setAssistanceError] = useState<string | null>(null);
  const [assistanceFilter, setAssistanceFilter] = useState<string>('all');
  const [assistanceSearchQuery, setAssistanceSearchQuery] = useState<string>('');
  const [assistancePriorityFilter, setAssistancePriorityFilter] = useState<string>('all');
  const [assistanceSortBy, setAssistanceSortBy] = useState<string>('newest');
  const [assistanceCurrentPage, setAssistanceCurrentPage] = useState(1);
  const [assistanceTotalPages, setAssistanceTotalPages] = useState(1);
  const [assistanceTotalRequests, setAssistanceTotalRequests] = useState(0);

  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [debouncedAssistanceSearch] = useDebounce(assistanceSearchQuery, 500);

  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

  setUserFilter('all');

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" />;
  }

  useEffect(() => {
    fetchRequests();
  }, [currentPage, debouncedSearch, statusFilter, priorityFilter, userFilter, sortBy]);

  useEffect(() => {
    fetchAssistanceRequests();
  }, [assistanceCurrentPage, debouncedAssistanceSearch, assistanceSortBy, assistanceFilter, assistancePriorityFilter]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      console.log(sortBy)
      const response = await adminService.fetchAssetRequests(
        currentPage,
        limit,
        debouncedSearch,
        statusFilter,
        priorityFilter,
        userFilter,
        sortBy
      );
      const data = await response.data;
      setRequests(data.assetRequests);
      setTotalPages(data.totalPages);
      setTotalRequests(data.totalRequests);
      if (defaultTab !== 'assistance') setTotalDisplay(data.totalRequests);
    } catch (error: any) {
      // setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssistanceRequests = async () => {
    try {
      setIsAssistanceLoading(true);
      const response = await adminService.fetchAssistanceRequests(
        assistanceCurrentPage,
        limit,
        debouncedAssistanceSearch.trim(),
        assistanceFilter !== 'all' ? assistanceFilter : '',
        assistancePriorityFilter,
        assistanceSortBy
      );

      if (response.status === 200) {
        const data: IAssistancePaginatedResponse = response.data;
        setAssistanceRequests(data.assistanceRequests);
        setAssistanceTotalPages(data.totalPages);
        setAssistanceTotalRequests(data.totalRequests);
        if (defaultTab === 'assistance') setTotalDisplay(data.totalRequests);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setAssistanceError(error.response?.data.message || 'Error fetching assistance requests. Please try again.');
      } else {
        setAssistanceError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsAssistanceLoading(false);
    }
  };

  const fetchUserDetails = async (userId: string) => {
    setIsLoadingUser(true);
    try {
      const response = await adminService.fetchUserDetails(userId);

      if (response.status === 200) {
        setUserDetails(response.data.user);
      }
    } catch (error: any) {
      // setError(error.message);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleAction = async (type: any, request: any) => {
    if (!type || !request) return;
    try {
      await adminService.updateAssetRequestStatus(request._id, type, actionComment)
      setActionDialog({ open: false, type: null, request: null });
      setActionComment('');
      fetchRequests();
    } catch (error: any) {
      // setError(error.message);
    }
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    const styles = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-blue-100 text-blue-800"
    };
    return styles[priority] || "bg-gray-100 text-gray-800";
  };

  const getAssistancePriorityBadge = (priority: 'normal' | 'urgent') => {
    const styles = {
      normal: "bg-blue-100 text-blue-800",
      urgent: "bg-red-100 text-red-800",
    };
    return styles[priority] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 mr-1 text-red-600" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 mr-1 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 mr-1 text-yellow-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ambulance':
        return <Ambulance className="h-6 w-6" />;
      case 'volunteer':
        return <HandHeart className="h-6 w-6" />;
      default:
        return <HandHeart className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleAssistanceSearch = (value: string) => {
    setAssistanceSearchQuery(value);
  };

  const handleAssistanceFilterChange = (value: string) => {
    console.log('value: ', value)
    setAssistanceFilter(value);
  };

  const handleAssistanceSortChange = (value: string) => {
    setAssistanceSortBy(value);
  };

  const handleAssistancePriorityChange = (value: string) => {
    setAssistancePriorityFilter(value);
  };

  // const handleTotalRequests = (value: number) => {
  //   setTotalDisplay(value);
  // };
 
  const UserDetailsModal = () => {
    const user = userDetails?.user;
    const address = userDetails?.address;

    if (isLoadingUser) {
      return (
        <Dialog open={userDetailsDialog.open}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Loading User Details</DialogTitle>
              <DialogDescription>
                Please wait while we fetch the user information...
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center items-center min-h-[400px]">
              <DotLottieReact
                src="https://lottie.host/525ff46b-0a14-4aea-965e-4b22ad6a8ce7/wGcySY4DHd.lottie"
                loop
                autoplay
                style={{ width: '100px', height: '100px' }}
              />
            </div>
          </DialogContent>
        </Dialog>
      );
    }

    if (!user) return null;

    return (
      <Dialog
        open={userDetailsDialog.open}
        onOpenChange={(open: any) => !open && setUserDetailsDialog({ open: false, userId: null })}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about {user.name}'s profile and account status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.profilePicture || ''} />
                <AvatarFallback className="bg-primary/10">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                  {user.isVerified && (
                    <Badge variant="default" className="bg-green-500">Verified</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Basic Information
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Coffee className="h-4 w-4 text-gray-400" />
                    <span>{user.age} years old</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Joined {format(new Date(user.createdAt), 'PPP')}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Account Status
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? (
                        <UserCheck className="h-3 w-3 mr-1" />
                      ) : (
                        <UserX className="h-3 w-3 mr-1" />
                      )}
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.isBlocked ? "destructive" : "default"}>
                      {user.isBlocked ? (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <Shield className="h-3 w-3 mr-1" />
                      )}
                      {user.isBlocked ? 'Blocked' : 'Not Blocked'}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>

            {address && (
              <Card className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-500">Full Name:</span>
                      <p className="font-medium">{address.fname} {address.lname}</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Street:</span>
                      <p className="font-medium">{address.street}</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">City:</span>
                      <p className="font-medium">{address.city}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-gray-500">State:</span>
                      <p className="font-medium">{address.state}</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Country:</span>
                      <p className="font-medium">{address.country}</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Pincode:</span>
                      <p className="font-medium">{address.pincode}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserDetailsDialog({ open: false, userId: null })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  const RequestCard: React.FC<any> = ({ request }) => {
    const isExpanded = expandedCard === request._id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="hover:shadow-lg transition-shadow">
          <div className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={request.asset.image || asset_picture}
                  alt={'asset'}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-medium text-gray-800">{request.asset.name}</h3>
                  <div className="flex gap-2 items-center">
                    <User className="h-4 w-4 text-gray-400" />
                    <button
                      onClick={() => {
                        setUserDetailsDialog({ open: true, userId: request.user._id });
                        fetchUserDetails(request.user._id);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {request.user.name}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <Badge className={getStatusColor(request.status)}>
                  {getStatusIcon(request.status)}
                  {request.status}
                </Badge>
                <Badge className={getPriorityBadge(request.priority)}>
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {request.priority} Priority
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
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
                  <p className="font-medium">Time Elapsed</p>
                  <p>{formatDistanceToNow(new Date(request.createdAt))} ago</p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setExpandedCard(isExpanded ? null : request._id)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 mr-2" />
              ) : (
                <ChevronDown className="h-4 w-4 mr-2" />
              )}
              {isExpanded ? 'Show Less' : 'Show Details'}
            </Button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <h4 className="font-medium text-gray-700">Request Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Category</p>
                          <p className="font-medium">{request.asset.category}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Quantity</p>
                          <p className="font-medium">{request.quantity} unit(s)</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Contact</p>
                          <p className="font-medium">{request.user.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Request ID</p>
                          <p className="font-medium">{request._id}</p>
                        </div>
                      </div>
                    </div>

                    {request.reason && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-2">Request Reason</h4>
                        <p className="text-sm text-gray-600">{request.reason}</p>
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => setActionDialog({
                            open: true,
                            type: 'approved',
                            request
                          })}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve Request
                        </Button>
                        <Button
                          className="flex-1 bg-red-600 hover:bg-red-700"
                          onClick={() => setActionDialog({
                            open: true,
                            type: 'rejected',
                            request
                          })}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject Request
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
    );
  };

  const AssistanceRequestCard: React.FC<{ request: IAssistanceRequestResponse }> = ({ request }) => {
    const navigate = useNavigate();

    return (
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
              <div className="flex flex-col gap-2 items-end">
                <Badge className={getStatusColor(request.status)}>
                  {getStatusIcon(request.status)}
                  {request.status}
                </Badge>
                <Badge className={getAssistancePriorityBadge(request.priority)}>
                  {request.priority}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <div>
                  <p className="font-medium">Requested For</p>
                  <p>{format(new Date(request.requestedDate), 'PPP')}</p>
                </div>
              </div>
              {request.volunteer ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Assigned Volunteer</p>
                    <p className='font-semibold'>{request.volunteer.name}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Assigned Volunteer</p>
                    <p className='text-gray-400'>{'Not assigned yet!'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* View More */}
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                className="text-[#688D48] border-[#688d4855] hover:bg-[#688D48] opacity-80 hover:opacity-100 hover:text-white transition-colors"
                onClick={() => navigate(`/admin/assistanceRequests/${request._id}`)}
              >
                View More
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Requests</h1>
        <div className="text-sm text-gray-500">
          Total Requests: {totalDisplay}
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="assets" className="flex items-center gap-2" >
            <Package className="h-4 w-4" />
            Asset Requests
          </TabsTrigger>
          <TabsTrigger value="assistance" className="flex items-center gap-2" >
            <HandHeart className="h-4 w-4" />
            Assistance Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-6">
          <Card className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by asset name, user, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {!isLoading && requests.length > 0 && (
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalRequests)} of {totalRequests} requests
            </div>
          )}

          {isLoading ? (
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
              <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Requests Found</h3>
              <p className="text-gray-500">
                {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'No requests match your search criteria'
                  : 'There are no asset requests at the moment'}
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {requests.map((request: any) => (
                  <RequestCard key={request._id} request={request} />
                ))}
              </div>

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
        </TabsContent>

        <TabsContent value="assistance" className="space-y-6">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by user, or ID..."
                    value={assistanceSearchQuery}
                    onChange={(e) => handleAssistanceSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Select value={assistanceFilter} onValueChange={(value) => handleAssistanceFilterChange(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={assistancePriorityFilter} onValueChange={(value) => handleAssistancePriorityChange(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={assistanceSortBy} onValueChange={(value) => handleAssistanceSortChange(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
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
                style={{ width: '100px', height: '100px' }}
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
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assistanceRequests.map((request: IAssistanceRequestResponse) => (
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

      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog({ open: false, type: null, request: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'approved' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === 'approved'
                ? 'Are you sure you want to approve this request?'
                : 'Are you sure you want to reject this request?'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Add a comment (optional)
              </label>
              <Textarea
                placeholder="Enter your comment here..."
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, type: null, request: null })}
            >
              Cancel
            </Button>
            <Button
              className={
                actionDialog.type === 'approved'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
              onClick={() => handleAction(actionDialog.type, actionDialog.request)}
            >
              {actionDialog.type === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UserDetailsModal />
    </div>
  );
};

export default AdminRequests;