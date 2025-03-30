const AdminDashboardSkeleton = () => {
    return (
        <div className="p-6 w-full bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

            {/* Dashboard Stats Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-md flex items-center gap-x-4">
                        <div className="bg-gray-100 p-3 rounded-full animate-pulse">
                            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="w-full">
                            <div className="h-3 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                            <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upcoming Meetings Skeleton */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center mb-4">
                            <div className="w-5 h-5 bg-gray-200 rounded-full mr-2 animate-pulse"></div>
                            <div className="h-5 bg-gray-200 rounded w-40 animate-pulse"></div>
                        </div>
                        <div className="w-32 h-8 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="border-b border-gray-100 pb-3">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                                <div className="flex justify-between">
                                    <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse"></div>
                                    <div className="h-3 bg-gray-100 rounded w-1/5 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Donations Skeleton */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center mb-4">
                            <div className="w-5 h-5 bg-gray-200 rounded-full mr-2 animate-pulse"></div>
                            <div className="h-5 bg-gray-200 rounded w-40 animate-pulse"></div>
                        </div>
                        <div className="w-48 h-8 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="border-b border-gray-100 pb-3">
                                <div className="flex justify-between mb-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse"></div>
                                    <div className="h-3 bg-gray-100 rounded w-1/5 animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pending Requests Skeleton */}
            <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                    <div className="flex items-center mb-4">
                        <div className="w-5 h-5 bg-gray-200 rounded-full mr-2 animate-pulse"></div>
                        <div className="h-5 bg-gray-200 rounded w-40 animate-pulse"></div>
                    </div>
                    <div className="w-48 h-8 bg-gray-100 rounded animate-pulse"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Assistance Requests Skeleton */}
                    <div>
                        <div className="h-4 bg-gray-200 rounded w-36 mb-3 animate-pulse"></div>
                        <div className="space-y-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="p-2 bg-gray-50 rounded border-l-4 border-gray-200 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="flex justify-between">
                                        <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                                        <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Asset Requests Skeleton */}
                    <div>
                        <div className="h-4 bg-gray-200 rounded w-28 mb-3 animate-pulse"></div>
                        <div className="space-y-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="p-2 bg-gray-50 rounded border-l-4 border-gray-200 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="flex justify-between">
                                        <div className="h-3 bg-gray-100 rounded w-1/5"></div>
                                        <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardSkeleton;