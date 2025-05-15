import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Download, RefreshCw } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { FaDownload } from 'react-icons/fa';
import { donationService } from '@/services/donation.service';
import { IDonation } from '@/interfaces/donation.interface';

const CAMPAIGN_OPTIONS = [
  {
    key: "All",
    value: "all"
  },
  {
    key: "General",
    value: "general"
  },
  {
    key: "Education",
    value: "education"
  },
  {
    key: "Health",
    value: "health"
  },
  {
    key: "Food",
    value: "food"
  },
  {
    key: "Shelter",
    value: "shelter"
  },
];

const DonationManagementPage: React.FC = () => {
  const [donations, setDonations] = useState<IDonation[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(1);

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.fetchAllDonations(
        debouncedSearchTerm,
        selectedCampaign,
        currentPage,
      );
      setDonations(response.data.donations);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems);
    } catch (error) {
      console.error("Error fetching donations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [debouncedSearchTerm, selectedCampaign, currentPage]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleDownloadReceipt = async (donationId: string, userId: string) => {
    try {
      await donationService.downloadDonationReceipt(donationId, userId);
    } catch (error) {
      console.error('Failed to download receipt:', error);
    }
  };

  const exportDonations = async () => {
    try {
      const response = await adminService.exportDonations(
        debouncedSearchTerm,
        selectedCampaign,
        currentPage,
      );
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `donations_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting donations:", error);
    }
  };

  return (
    <Card className="w-full shadow">
      <CardHeader className="bg-white border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold text-gray-800">Donation Management</CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              View and manage all donations to your organization
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={exportDonations}
            >
              <Download size={16} />
              Export
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={() => fetchDonations()}
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search by payment ID or message..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <Select
              value={selectedCampaign}
              onValueChange={setSelectedCampaign}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Campaign" />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_OPTIONS.map((campaign) => (
                  <SelectItem key={campaign.key} value={campaign.value}>
                    {campaign.key}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw size={24} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-6">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="whitespace-nowrap">Date</TableHead>
                    <TableHead className="whitespace-nowrap">Payment ID</TableHead>
                    <TableHead className="whitespace-nowrap">Amount</TableHead>
                    <TableHead className="whitespace-nowrap">Campaign</TableHead>
                    <TableHead className="whitespace-nowrap">Donor</TableHead>
                    <TableHead className="whitespace-nowrap">Message</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.length > 0 ? (
                    donations.map((donation) => (
                      <TableRow key={donation._id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {format(new Date(donation.date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {donation.stripePaymentId}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(donation.amount)}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize">{donation.campaign}</span>
                        </TableCell>
                        <TableCell>
                          {donation.isAnonymous || !donation.userId ? (
                            <span className="text-sm text-gray-500 italic">Anonymous</span>
                          ) : (
                            <span className="text-sm">{donation.userId?.name}</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          <span className="text-sm text-gray-600">
                            {donation.message || '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusBadgeColor(donation.status)} capitalize`}>
                            {donation.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReceipt(donation._id, donation.userId?._id as string)}
                            className="text-[#688D48] border-[#688D48] hover:bg-[#688D48]/10"
                          >
                            <FaDownload className="mr-2" /> Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No donations found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {donations.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <span className="text-sm text-gray-600">
                  Showing {Math.min((currentPage - 1) * 10 + 1, totalItems)} to {Math.min(currentPage * 10, totalItems)} of {totalItems} donations
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DonationManagementPage;