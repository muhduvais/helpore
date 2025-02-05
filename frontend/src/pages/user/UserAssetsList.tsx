import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useDebounce } from 'use-debounce';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FaAngleLeft, FaAngleRight, FaBox, FaCalendar } from 'react-icons/fa';
import { CiSearch } from 'react-icons/ci';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { userService } from '@/services/userService';
import { IAsset } from '@/interfaces/adminInterface';
import asset_picture from '../../assets/asset_picture.png';
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const AssetListing = () => {

  const [assets, setAssets] = useState<IAsset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [filterByAvailability, setFilterByAvailability] = useState('all');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<IAsset | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  // Image Error Handling
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = asset_picture;
  };

  // Fetch Assets
  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const response = await userService.fetchAssets(
        currentPage, 
        8, 
        debouncedSearchTerm.trim(), 
        sortBy, 
        filterByAvailability
      );

      if (response.status === 200) {
        setAssets(response.data.assets);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching the assets:', error.response?.data.message);
      } else {
        console.error('Unknown error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [currentPage, debouncedSearchTerm, sortBy, filterByAvailability]);

  // Modal Handlers
  const openRequestModal = (asset: IAsset) => {
    setSelectedAsset(asset);
    setSelectedDate(undefined);
    setIsRequestModalOpen(true);
  };

  const handleRequest = async () => {
    if (!selectedAsset || !selectedDate) return;

    try {
      setIsSubmitting(true);
      await userService.requestAsset(selectedAsset._id, {
        requestedDate: format(selectedDate, 'yyyy-MM-dd')
      });
      setIsRequestModalOpen(false);
      toast.success('Asset requested successfully!');
    } catch (error) {
      toast.success('Error requesting asset!');
      console.error('Error requesting asset:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Request Modal Component
  const RequestModal = () => (
    <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Asset</DialogTitle>
          <DialogDescription>
            Select a date for when you need the {selectedAsset?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <FaCalendar className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {selectedDate ? format(selectedDate, 'PPP') : 'Select a date'}
              </span>
            </div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsRequestModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRequest}
            disabled={!selectedDate || isSubmitting}
            className="bg-[#688D48] hover:bg-[#557239] text-white"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <FaBox className="text-2xl text-[#688D48]" />
          <h1 className="text-2xl font-semibold text-gray-800">Available Assets</h1>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <Input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name (A-Z)</SelectItem>
              <SelectItem value="-name">Name (Z-A)</SelectItem>
              <SelectItem value="-stocks">Most Available</SelectItem>
              <SelectItem value="stocks">Least Available</SelectItem>
              <SelectItem value="-createdAt">Newest First</SelectItem>
              <SelectItem value="createdAt">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterByAvailability}
            onValueChange={setFilterByAvailability}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assets</SelectItem>
              <SelectItem value="available">Available Now</SelectItem>
              <SelectItem value="limited">Limited Stock</SelectItem>
              <SelectItem value="unavailable">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <DotLottieReact
            src="https://lottie.host/525ff46b-0a14-4aea-965e-4b22ad6a8ce7/wGcySY4DHd.lottie"
            loop
            autoplay
            style={{ width: '50px', height: '50px' }}
          />
        </div>
      )}

      {/* Assets Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {assets.map((asset) => (
            <Card key={asset._id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200 relative h-[400px] flex flex-col">
              <div className="aspect-video w-full overflow-hidden bg-gray-100">
                <img
                  src={asset.image || asset_picture}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-semibold text-lg text-gray-800 max-w-[200px] truncate">
                    {asset.name}
                  </h3>
                  <Badge 
                    variant={asset.stocks > 5 ? "default" : asset.stocks > 0 ? "secondary" : "destructive"}
                    className={asset.stocks > 0 ? "bg-[#688D48]"  : ""}
                  >
                    {asset.stocks > 0 ? `${asset.stocks} available` : 'Out of stock'}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm flex-grow line-clamp-3">
                  {asset.description}
                </p>
                <div className="flex flex-col gap-2 mt-4">
                  <Button
                    onClick={() => openRequestModal(asset)}
                    className="w-full bg-[#688D48] hover:bg-[#557239] text-white"
                    disabled={asset.stocks === 0}
                  >
                    Request Asset
                  </Button>
                  <Link to={`/user/assetDetails/${asset._id}`} className="w-full">
                    <Button 
                      variant="outline" 
                      className="w-full text-[#688D48] hover:text-white hover:bg-[#688D48]"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && assets.length === 0 && (
        <div className="text-center py-12">
          <FaBox className="mx-auto text-4xl text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">No Assets Found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
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
      {!isLoading && (
        <div className="text-center text-sm text-gray-500">
          Showing {assets.length} assets
        </div>
      )}

      {/* Request Modal */}
      <RequestModal />
    </div>
  );
};

export default AssetListing;