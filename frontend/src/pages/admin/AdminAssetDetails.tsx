import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AxiosError } from 'axios';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    FaWarehouse,
    FaArrowLeft,
    FaEdit,
    FaHistory,
    FaBoxOpen,
    FaClipboardList,
    FaQrcode
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { adminService } from '@/services/adminService';
import { IAsset } from '@/interfaces/adminInterface';
import asset_picture from '../../assets/asset_picture.png';
import EditAssetModal from '@/components/AdminEditAsset';

const AdminAssetDetails = () => {
    const { id } = useParams();
    const [asset, setAsset] = useState<IAsset | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const isLoggedIn = useSelector((state: any) => state.auth.isLoggedIn);

    if (!isLoggedIn) {
        return <Navigate to={'/admin/login'} />;
    }

    useEffect(() => {
        const fetchAssetDetails = async () => {
            try {
                setIsLoading(true);
                const assetId = id || '';
                const response = await adminService.fetchAssetDetails(assetId);
                if (response.status === 200) {
                    setAsset(response.data.asset);
                }
            } catch (error) {
                if (error instanceof AxiosError) {
                    setError(error.response?.data.message || 'Error fetching asset details');
                } else {
                    setError('An unexpected error occurred');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchAssetDetails();
    }, [id]);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = asset_picture;
    };

    const generateQRCode = () => {
        alert('QR Code generation coming soon!');
    };

    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="flex justify-center items-center h-screen"
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

    const handleAssetUpdated = (updatedAsset: IAsset) => {
        setAsset(updatedAsset);
        setIsEditModalOpen(false);
    };

    if (error) {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="p-8 text-center"
            >
                <FaWarehouse className="mx-auto text-6xl text-gray-300 mb-4 animate-pulse" />
                <h3 className="text-2xl font-bold text-gray-600 mb-2">Oops! Asset Not Found</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <Link to="/admin/assets">
                    <Button variant="outline" className="hover:bg-[#688D48] hover:text-white transition-all">
                        <FaArrowLeft className="mr-2" />
                        Back to Assets
                    </Button>
                </Link>
            </motion.div>
        );
    }

    return (
        <>
            {isEditModalOpen &&
                <EditAssetModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    asset={asset}
                    onAssetUpdated={handleAssetUpdated}
                />
            }

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="p-4 sm:p-8 max-w-7xl mx-auto"
            >
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Link to="/admin/assetManagement">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                <Button variant="ghost" size="icon">
                                    <FaArrowLeft className="text-[#688D48]" />
                                </Button>
                            </motion.div>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Asset Details</h1>
                    </div>

                    <div className="flex gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                onClick={generateQRCode}
                                variant="outline"
                                className="border-[#688D48] text-[#688D48] hover:bg-[#688D48] hover:text-white"
                            >
                                <FaQrcode className="mr-2" />
                                Generate QR
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                className="bg-[#688D48] hover:bg-[#557239] text-white"
                                onClick={() => setIsEditModalOpen(true)}
                            >
                                <FaEdit className="mr-2" />
                                Edit Asset
                            </Button>
                        </motion.div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Image and Quick Info */}
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-1"
                    >
                        <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <div className="aspect-video w-full overflow-hidden bg-gray-100 relative">
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
                                    <h2 className="font-semibold text-xl text-gray-800">{asset?.name}</h2>
                                    <Badge variant="outline" className="bg-[#688D48] text-white">
                                        {asset?.stocks} in stock
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500 flex items-center gap-2">
                                        <FaClipboardList /> Asset ID: {asset?._id}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Added: {new Date(asset?.createdAt || '').toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Last Updated: {new Date(asset?.updatedAt || '').toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Right Column - Detailed Information */}
                    <motion.div
                        initial={{ x: 50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2"
                    >
                        <Tabs defaultValue="details" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-gray-200 p-1 rounded-xl">
                                <TabsTrigger
                                    value="details"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
                                >
                                    <FaBoxOpen />
                                    Details
                                </TabsTrigger>
                                <TabsTrigger
                                    value="history"
                                    className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg transition-all"
                                >
                                    <FaHistory />
                                    History
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="details">
                                <Card>
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                                            <p className="text-gray-600">{asset?.description}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Specifications</h3>
                                                <div className="space-y-2">
                                                    <p className="text-sm">
                                                        <span className="text-gray-500">Category:</span>{' '}
                                                        <span className="text-gray-700">{asset?.category}</span>
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="text-gray-500">Condition:</span>{' '}
                                                        <span className="text-gray-700">{'condition'}</span>
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="text-gray-500">Location:</span>{' '}
                                                        <span className="text-gray-700">{'location'}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Inventory Details</h3>
                                                <div className="space-y-2">
                                                    <p className="text-sm">
                                                        <span className="text-gray-500">Current Stock:</span>{' '}
                                                        <span className="text-gray-700">{asset?.stocks} units</span>
                                                    </p>
                                                    <p className="text-sm">
                                                        <span className="text-gray-500">Minimum Stock:</span>{' '}
                                                        <span className="text-gray-700">{2} units</span>
                                                    </p>
                                                    {asset?.stocks !== undefined &&
                                                        <span className="text-sm">
                                                            <span className="text-gray-500">Status:</span>{' '}
                                                            <Badge variant="outline" className={
                                                                asset.stocks === 0 ? 'bg-red-100 text-red-800' :
                                                                    asset?.stocks <= 2 ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-green-100 text-green-800'
                                                            }>
                                                                {asset?.stocks === 0 ? 'Out of Stock' :
                                                                    asset?.stocks <= 2 ? 'Low Stock' :
                                                                        'In Stock'}
                                                            </Badge>
                                                        </span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="history">
                                <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
                                    <div className="p-6">
                                        <div className="space-y-4">
                                            {[1, 2, 3].map((item) => (
                                                <motion.div
                                                    key={item}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: item * 0.1 }}
                                                    className="flex items-start gap-4 pb-4 border-b last:border-0 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                                >
                                                    <div className="w-2 h-2 mt-2 rounded-full bg-[#688D48]" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">Stock Updated</p>
                                                        <p className="text-sm text-gray-600">Quantity changed from 15 to 20</p>
                                                        <p className="text-xs text-gray-500 mt-1">2024-02-01 14:30</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
};

export default AdminAssetDetails;