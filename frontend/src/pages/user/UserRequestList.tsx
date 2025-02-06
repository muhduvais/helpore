import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AxiosError } from 'axios';
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
  HandHeart
} from 'lucide-react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { userService } from '@/services/userService';
import asset_picture from '../../assets/asset_picture.png';
import { Input } from '@/components/ui/input';
import { useDebounce } from 'use-debounce';
import { IAssetRequest } from '@/interfaces/userInterface';
import { FaWheelchair } from 'react-icons/fa';

interface IPaginatedResponse {
  assetRequests: IAssetRequest[];
  totalPages: number;
  totalRequests: number;
}

const limit = 4;

const UserRequests: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<IAssetRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [view, setView] = useState<'card' | 'table'>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);

  const [debouncedSearch] = useDebounce(searchQuery, 500);

  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    fetchRequests();
  }, [currentPage, debouncedSearch, filter]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await userService.fetchAssetRequests(
        currentPage,
        limit,
        debouncedSearch.trim(),
        filter !== 'all' ? filter : ''
      );

      if (response.status === 200) {
        const data: IPaginatedResponse = response.data;
        setRequests(data.assetRequests);
        setTotalPages(data.totalPages);
        setTotalRequests(data.totalRequests);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.message || 'Error fetching requests');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const RequestCard: React.FC<{ request: IAssetRequest }> = ({ request }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      >
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

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <div>
                <p className="font-medium">Requested For </p>
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

          {request.comment && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p className="font-medium">Admin Comment:</p>
              <p>{request.comment}</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Requests</h1>
        <Link to="/user/assets">
          <Button className="bg-[#688D48] hover:bg-[#557239] text-white">
            <Package className="mr-2 h-4 w-4" />
            Request New Asset
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="assets" className="w-full">
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
              <p className="text-gray-500 mb-4">
                {searchQuery || filter !== 'all'
                  ? 'No requests match your search \"criteria\"'
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
                {requests.map((request: IAssetRequest) => (
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
          <Card className="p-8 text-center">
            <HandHeart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Coming Soon</h3>
            <p className="text-gray-500">Assistance requests feature will be available soon.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserRequests;