import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, CalendarDays, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format, startOfDay } from "date-fns";
import loading_logo from "../../assets/Logo-black-short.png";
import {
  ArrowLeft,
  PackageOpen,
  History,
  ClipboardList,
  Share2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MinusCircle,
  PlusCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { userService } from "@/services/user.service";
import asset_picture from "../../assets/asset_picture.png";
import { FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import "react-toastify/dist/ReactToastify.css";
import { IAsset } from "@/interfaces/adminInterface";
import { IAssetRequest } from "@/interfaces/userInterface";

// Request Modal Component
const RequestModal = ({
  isOpen,
  onClose,
  selectedAsset,
  selectedDate,
  setSelectedDate,
  isSubmitting,
  handleRequest,
}: any) => {
  const [qty, setQty] = useState(1);
  const maxStocks =
    selectedAsset && selectedAsset.stocks > 3 ? 3 : selectedAsset?.stocks || 0;
  const today = useMemo(() => startOfDay(new Date()), []);

  const incrementQty = () => qty < maxStocks && setQty(qty + 1);
  const decrementQty = () => qty > 1 && setQty(qty - 1);
  const handleQtyChange = (e: any) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= maxStocks) setQty(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Asset</DialogTitle>
          <DialogDescription>
            Select a date and quantity for when you need the{" "}
            {selectedAsset?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
              </span>
            </div>

            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < today}
              className="rounded-md border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">{`Quantity (Max: ${maxStocks})`}</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decrementQty}
                disabled={qty <= 1}
                className="h-8 w-8"
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={qty}
                min="1"
                max={maxStocks}
                onChange={handleQtyChange}
                className="w-20 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={incrementQty}
                disabled={qty >= maxStocks}
                className="h-8 w-8"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => handleRequest(qty)}
            disabled={!selectedDate || isSubmitting}
            className="bg-[#688D48] hover:bg-[#557239] text-white"
          >
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const UserAssetDetails: React.FC = () => {
  const { id } = useParams();
  const [asset, setAsset] = useState<IAsset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentRequest, setCurrentRequest] = useState<IAssetRequest | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);
  const navigate = useNavigate();

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const assetId = id || "";
        const [assetResponse, requestResponse] = await Promise.all([
          userService.fetchAssetDetails(assetId),
          userService.fetchAssetRequestDetails(assetId).catch((error) => error),
        ]);

        if (assetResponse.status === 200) {
          setAsset(assetResponse.data.asset);
        } else if (requestResponse.status === 400) {
          setCurrentRequest(null);
        } else if (requestResponse instanceof Error) {
          throw requestResponse;
        }

        if (requestResponse.status === 200) {
          setCurrentRequest(requestResponse.data.assetRequestDetails);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data.message || "Error fetching asset details"
          );
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = asset_picture;
  };

  const handleShareAsset = () => {
    if (navigator.share) {
      navigator
        .share({
          title: asset?.name,
          text: asset?.description,
          url: window.location.href,
        })
        .catch(console.error);
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert("Link copied to clipboard!"))
        .catch(console.error);
    }
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getRequestStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-72">
        <img src={loading_logo} alt="Loading..." className="flip-animation" />
      </div>
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
        <PackageOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-2xl font-bold text-gray-600 mb-2">
          Asset Not Found
        </h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link to="/user/assets">
          <Button
            variant="outline"
            className="hover:bg-[#688D48] hover:text-white transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assets
          </Button>
        </Link>
      </motion.div>
    );
  }

  // Modal Handlers
  const openRequestModal = () => {
    setSelectedDate(undefined);
    setIsRequestModalOpen(true);
  };

  // Handle request
  const handleRequest = async (qty: number) => {
    if (!selectedDate) return;

    try {
      setIsSubmitting(true);
      const assetId = asset?.id || "";
      const response = await userService.requestAsset(assetId, {
        requestedDate: format(selectedDate, "yyyy-MM-dd"),
        quantity: qty,
      });
      if (response.status === 200) {
        toast.success("Asset requested successfully!", {
          duration: 3000,
          onAutoClose: () => window.location.reload(),
        });
      }
    } catch (error) {
      setIsRequestModalOpen(false);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error requesting asset!");
      } else {
        toast.error("Error requesting asset!");
        console.error("Error requesting asset:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Image Expansion Modal */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
            onClick={() => setExpandedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-[40vw] max-h-[40vw]"
            >
              <motion.img
                src={expandedImage}
                alt="Expanded Asset"
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 text-white text-2xl bg-gray-300 hover:bg-gray-400 p-1 rounded-md"
                onClick={() => setExpandedImage(null)}
              >
                <FaTimes />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4 sm:p-6"
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link to="/user/assets">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="text-[#688D48] h-5 w-5" />
                </Button>
              </motion.div>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
              Asset Details
            </h1>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleShareAsset}
              variant="outline"
              className="border-[#688D48] text-[#688D48] hover:bg-[#688D48] hover:text-white"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Asset
            </Button>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Image and Quick Info */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div
                className="aspect-video w-full overflow-hidden bg-gray-100 relative cursor-pointer"
                onClick={() => setExpandedImage(asset?.image || asset_picture)}
              >
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  src={asset?.image || asset_picture}
                  alt={asset?.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h2 className="font-semibold text-xl text-gray-800">
                    {asset?.name}
                  </h2>
                  <Badge
                    variant={asset?.stocks === 0 ? "destructive" : "secondary"}
                  >
                    {asset?.stocks === 0
                      ? "Out of Stock"
                      : `${asset?.stocks} Available`}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" /> Category:{" "}
                    {asset?.category}
                  </p>
                  <p className="text-sm text-gray-500">
                    Added:{" "}
                    {new Date(asset?.createdAt || "").toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Request Status Card */}

            {/* Request Button */}
            {!currentRequest && (
              <Button
                onClick={() => openRequestModal()}
                className="w-full bg-[#688D48] hover:bg-[#557239] text-white"
                disabled={asset?.stocks === 0}
              >
                Request Asset
              </Button>
            )}
          </motion.div>

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
                  <PackageOpen className="h-4 w-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="availability"
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
                >
                  <History className="h-4 w-4" />
                  Availability
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <Card>
                  <div className="p-6 space-y-7">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Description
                      </h3>
                      <p className="text-gray-600">{asset?.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Specifications
                        </h3>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="text-gray-500">Category:</span>{" "}
                            <span className="text-gray-700">
                              {asset?.category}
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-500">Condition:</span>{" "}
                            <span className="text-gray-700">{"Good"}</span>
                          </p>
                          <p className="text-sm">
                            <span className="text-gray-500">Location:</span>{" "}
                            <span className="text-gray-700">
                              {"Main Storage"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Status
                        </h3>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="text-gray-500">
                              Current Stock:
                            </span>{" "}
                            <span className="text-gray-700">
                              {asset?.stocks} units
                            </span>
                          </p>
                          <div className="text-sm">
                            <span className="text-gray-500">Availability:</span>{" "}
                            {asset && (
                              <Badge
                                variant="outline"
                                className={
                                  asset?.stocks === 0
                                    ? "bg-red-100 text-red-800"
                                    : asset?.stocks <= 2
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }
                              >
                                {asset?.stocks === 0
                                  ? "Out of Stock"
                                  : asset?.stocks <= 2
                                  ? "Limited Stock"
                                  : "Available"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <hr />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Current Request Status
                        </h3>
                        {currentRequest ? (
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="text-gray-500">Status:</span>{" "}
                              <Badge
                                className={getRequestStatusColor(
                                  currentRequest?.status || ""
                                )}
                              >
                                <span className="flex items-center gap-1">
                                  {getRequestStatusIcon(
                                    currentRequest?.status || ""
                                  )}
                                  {currentRequest?.status || ""}
                                </span>
                              </Badge>
                            </p>
                            <p className="text-sm flex items-center gap-x-3">
                              <span className="text-gray-500">
                                Requested for:
                              </span>{" "}
                              <span className="text-gray-700 flex items-center gap-x-1">
                                <CalendarDays className="h-4 w-4" />
                                {new Date(
                                  currentRequest?.requestedDate || Date.now()
                                ).toLocaleDateString()}
                              </span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-500">Quantity:</span>{" "}
                              <span className="text-gray-700">
                                {currentRequest?.quantity || ""}
                                {currentRequest?.quantity
                                  ? currentRequest?.quantity > 1
                                    ? " units"
                                    : " unit"
                                  : ""}
                              </span>
                            </p>
                            <div className="links flex flex-col items-start justify-center">
                              <button
                                onClick={() => navigate(`/user/requests`)}
                                className="flex items-center text-blue-700 underline italic text-sm font-semibold py-2"
                              >
                                <span>View Requests</span>
                                <ArrowUpRight size={17} />
                              </button>
                              {asset && asset?.stocks > 0 && (
                                <span>
                                  <button
                                    onClick={() => setIsRequestModalOpen(true)}
                                    className="text-blue-700 underline italic text-sm font-semibold py-2"
                                  >
                                    Make another request
                                  </button>
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600">
                              You have no current requests for this asset.
                            </p>
                            {!currentRequest && asset && asset?.stocks > 0 && (
                              <span className="mt-4">
                                <button
                                  onClick={() => setIsRequestModalOpen(true)}
                                  className="text-blue-700 underline italic text-sm font-semibold py-2"
                                >
                                  Make a request
                                </button>
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="availability">
                <Card>
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Operating Hours */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-800">
                            Operating Hours
                          </h3>
                          <p className="text-sm text-gray-600">
                            Monday - Friday, 9:00 AM - 5:00 PM
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          Available
                        </Badge>
                      </div>

                      {/* Request Processing */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-800">
                            Request Processing
                          </h3>
                          <p className="text-sm text-gray-600">
                            1-2 business days
                          </p>
                        </div>
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      </div>

                      {/* Asset Rules */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-2">
                          Asset Rules
                        </h3>
                        <ul className="space-y-2">
                          <li className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="min-w-3">•</span>
                            Maximum request duration: 30 days
                          </li>
                          <li className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="min-w-3">•</span>
                            Must be returned in the same condition
                          </li>
                          <li className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="min-w-3">•</span>
                            Damage or loss may result in replacement charges
                          </li>
                        </ul>
                      </div>

                      {/* Contact Information */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-2">
                          Need Help?
                        </h3>
                        <p className="text-sm text-gray-600">
                          For urgent inquiries or assistance, contact the asset
                          management team:
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          Email: helpore@welfare.org
                        </p>
                        <p className="text-sm text-gray-600">
                          Phone: (974) 648-3041
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </motion.div>

      {/* Request Modal */}
      <RequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        selectedAsset={asset}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        isSubmitting={isSubmitting}
        handleRequest={handleRequest}
      />
    </>
  );
};

export default UserAssetDetails;
