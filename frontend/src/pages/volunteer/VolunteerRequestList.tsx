import { useState, useEffect } from 'react';
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
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { Input } from '@/components/ui/input';
import { useDebounce } from 'use-debounce';
import { IAssistanceRequestResponse } from '@/interfaces/userInterface';
import { volunteerService } from '@/services/volunteer.service';

interface IAssistancePaginatedResponse {
  processingRequests: IAssistanceRequestResponse[];
  totalPages: number;
  totalRequests: number;
}

const limit = 4;

const VolunteerRequests: React.FC = () => {

  // Asset request states
  const [view, setView] = useState<'card' | 'table'>('card');

  // Assistance request states
  const [assistanceRequests, setAssistanceRequests] = useState<IAssistanceRequestResponse[]>([]);
  const [isAssistanceLoading, setIsAssistanceLoading] = useState(true);
  const [assistanceError, setAssistanceError] = useState<string | null>(null);
  const [assistanceFilter, setAssistanceFilter] = useState<string>('all');
  const [assistanceSearchQuery, setAssistanceSearchQuery] = useState<string>('');
  const [assistanceCurrentPage, setAssistanceCurrentPage] = useState(1);
  const [assistanceTotalPages, setAssistanceTotalPages] = useState(1);
  const [assistanceTotalRequests, setAssistanceTotalRequests] = useState(0);

  const [debouncedAssistanceSearch] = useDebounce(assistanceSearchQuery, 500);

  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    fetchAssistanceRequests();
  }, [assistanceCurrentPage, debouncedAssistanceSearch, assistanceFilter]);

  const fetchAssistanceRequests = async () => {
    try {
      console.log('calling requests')
      setIsAssistanceLoading(true);
      const response = await volunteerService.fetchProcessingRequests(
        assistanceCurrentPage,
        limit,
        debouncedAssistanceSearch.trim(),
        assistanceFilter !== 'all' ? assistanceFilter : ''
      );

      if (response.status === 200) {
        const data: IAssistancePaginatedResponse = response.data;
        setAssistanceRequests(data.processingRequests);
        setAssistanceTotalPages(data.totalPages);
        setAssistanceTotalRequests(data.totalRequests);
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

  const handleAssistanceSearch = (value: string) => {
    setAssistanceSearchQuery(value);
    setAssistanceCurrentPage(1);
  };

  const handleAssistanceFilterChange = (value: string) => {
    setAssistanceFilter(value);
    setAssistanceCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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
                onClick={() => navigate(`/volunteer/assistanceRequests/${request._id}`)}
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Processing Requests</h1>
      </div>

      {/* Main Content */}
      <Tabs defaultValue={"processing"} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="processing" className="flex items-center gap-2">
            <HandHeart className="h-4 w-4" />
            Processing Requests
          </TabsTrigger>
          {/* <TabsTrigger value="completed" className="flex items-center gap-2">
            <HandHeart className="h-4 w-4" />
            Completed Requests
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="processing" className="space-y-6">
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
                    <SelectItem value="ambulance">Ambulance</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="eldercare">Eldercare</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="general">General</SelectItem>
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
          {!isAssistanceLoading && assistanceRequests && assistanceRequests.length > 0 && (
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
          ) : assistanceRequests && assistanceRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <HandHeart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Processing Requests Found</h3>
              <p className="text-gray-500 mb-4">
                {assistanceSearchQuery || assistanceFilter !== 'all'
                  ? 'No requests match your search criteria'
                  : "You haven't made any assistance requests yet."}
              </p>
              <Link to="/volunteer/assistanceRequests">
                <Button className="bg-[#688D48] hover:bg-[#557239] text-white">
                  Check new requests
                </Button>
              </Link>
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

        {/* Completed */}
        <TabsContent value="completed" className="space-y-6">
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
                    <SelectItem value="ambulance">Ambulance</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="eldercare">Eldercare</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="general">General</SelectItem>
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
          {!isAssistanceLoading && assistanceRequests && assistanceRequests.length > 0 && (
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
          ) : assistanceRequests && assistanceRequests.length === 0 ? (
            <Card className="p-8 text-center">
              <HandHeart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Completed Requests Found</h3>
              <p className="text-gray-500 mb-4">
                {assistanceSearchQuery || assistanceFilter !== 'all'
                  ? 'No requests match your search criteria'
                  : "You haven't made any assistance requests yet."}
              </p>
              <Link to="/volunteer/assistanceRequests">
                <Button className="bg-[#688D48] hover:bg-[#557239] text-white">
                  Check new requests
                </Button>
              </Link>
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
                Showing {assistanceRequests.length} completed requests
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VolunteerRequests;