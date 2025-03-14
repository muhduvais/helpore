import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Link, useSearchParams } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useDebounce } from 'use-debounce';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FaAngleLeft,
  FaAngleRight,
  FaPlus,
  FaEye,
  FaWarehouse
} from 'react-icons/fa';
import { CiSearch } from 'react-icons/ci';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { adminService } from '@/services/admin.service';
import { IAsset } from '@/interfaces/adminInterface';
import asset_picture from '../../assets/asset_picture.png';

const AdminAssetManagement = () => {

  const [pageParams] = useSearchParams();
  const currentPageNum = Number(pageParams.get('page')) || 1;
  console.log('page: ', currentPageNum)

  const [assets, setAssets] = useState<IAsset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(currentPageNum);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to={'/admin/login'} />;
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = asset_picture;
  };

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.fetchAssets(currentPage, 8, searchTerm.trim());

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
  }, [currentPage, debouncedSearchTerm]);

  return (
    <div className="p-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <FaWarehouse className="text-2xl text-[#688D48]" />
          <h1 className="text-2xl font-semibold text-gray-800">Asset Management</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
            <Input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>

          <Link to="/admin/addAsset">
            <Button className="w-full sm:w-auto bg-[#688D48] hover:bg-[#557239] text-white">
              <FaPlus className="mr-2" />
              Add Asset
            </Button>
          </Link>
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
            <Card key={asset._id} className="overflow-hidden hover:shadow-lg transition-shadow relative h-[370px]">
              <div className="aspect-video w-full overflow-hidden bg-gray-100">
                <img
                  src={asset.image || asset_picture}
                  alt={asset.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-semibold text-lg text-gray-800 max-w-[200px] truncate">
                    {asset.name}
                  </h3>
                  <Badge variant="outline" className="bg-[#688D48] text-white shrink-0">
                    {asset.stocks} in stock
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm h-[40px] line-clamp-2 overflow-hidden">
                  {asset.description}
                </p>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm text-gray-500">
                    Added {new Date(asset.createdAt).toLocaleDateString()}
                  </span>
                  <Link to={`/admin/assets/${asset._id}?page=${currentPage}`}>
                    <Button variant="outline" size="sm" className="text-[#688D48] hover:text-white hover:bg-[#688D48]">
                      <FaEye className="mr-2" />
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
          <FaWarehouse className="mx-auto text-4xl text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">No Assets Found</h3>
          <p className="text-gray-500">Try adjusting your search or add new assets.</p>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6">
          {currentPage > 1 && (
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              className="flex items-center gap-1"
            >
              <FaAngleLeft />
              Prev
            </Button>
          )}

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

          {currentPage < totalPages && (
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              className="flex items-center gap-1"
            >
              Next
              <FaAngleRight />
            </Button>
          )}
        </div>
      )}

      {/* Total Count */}
      {!isLoading && (
        <div className="text-center text-sm text-gray-500">
          Showing {assets.length} assets
        </div>
      )}
    </div>
  );
};

export default AdminAssetManagement;