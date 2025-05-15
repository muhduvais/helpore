import { useState, useEffect } from "react";
import { Users, Handshake, Calendar, Clock, AlertTriangle, IndianRupee, ArrowUpRight } from "lucide-react";
import { meetingService } from "@/services/meeting.service";
import { donationService } from "@/services/donation.service";
import { IAssistanceRequest } from "@/interfaces/adminInterface";
import { IDonation } from "@/interfaces/donation.interface";
import { IAssetRequest, IUser } from "@/interfaces/userInterface";
import { adminService } from "@/services/admin.service";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AdminDashboardSkeleton from "@/components/Skeletons/AdminDashboardSkeleton";
import { IVolunteer } from "@/components/AssignVolunteerModal";

const AdminDashboard = () => {
    const [stats, setStats] = useState([
        { title: "Total Users", value: 0, icon: <Users size={24} />, color: "blue" },
        { title: "Active Volunteers", value: 0, icon: <Handshake size={24} />, color: "green" },
        { title: "Donations Received", value: "₹0", icon: <IndianRupee size={24} />, color: "amber" },
        { title: "Pending Requests", value: 0, icon: <Clock size={24} />, color: "red" }
    ]);

    const [upcomingMeetings, setUpcomingMeetings] = useState<any>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [recentDonations, setRecentDonations] = useState<IDonation[]>([]);
    const [pendingRequests, setPendingRequests] = useState<{ assistanceRequests: IAssistanceRequest[], assetRequests: IAssetRequest[] }>({
        assistanceRequests: [],
        assetRequests: []
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const [
                meetingsResponse,
                usersResponse,
                volunteersResponse,
                donationsResponse,
                recentDonationsResponse,
                assistanceRequestsResponse,
                assetRequestsResponse
            ] = await Promise.all([
                meetingService.getUpcomingMeetings(),
                adminService.fetchUsers(1, Infinity, ''),
                adminService.fetchVolunteers(1, Infinity, ''),
                donationService.fetchRecentDonations(),
                donationService.fetchRecentDonations(),
                adminService.fetchPendingAssistanceRequests(),
                adminService.fetchAssetRequests(1, 10, '', 'pending', 'all', 'all', 'newest')
            ]);

            // Meetings data
            const meetings = meetingsResponse.data.upcomingMeetings;
            const transformMeetings = (meetings: any) => {
                return meetings.map((meeting: any) => {
                    const meetingDate = new Date(meeting.scheduledTime);
                    return {
                        id: meeting._id,
                        title: meeting.title,
                        date: meetingDate.toISOString().split('T')[0],
                        time: meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
                        requestedBy: meeting.requestedBy
                    };
                });
            };
            setUpcomingMeetings(transformMeetings(meetings));

            const users = usersResponse.data.users || [];

            const volunteers = volunteersResponse.data.volunteers || [];

            const donations = donationsResponse.data.donations || [];

            const recentDonations = recentDonationsResponse.data.donations || [];
            setRecentDonations(recentDonations);

            const assistanceRequests = assistanceRequestsResponse.data.pendingRequests || [];

            const assetRequests = assetRequestsResponse.data.assetRequests;

            setPendingRequests({
                assistanceRequests: assistanceRequests.filter((req: any) => req.type === 'volunteer' || req.type === 'ambulance'),
                assetRequests: assetRequests.filter((req: any) => req.status === 'pending')
            });

            // Calculates stats values
            const totalDonations = donations.reduce((sum: number, donation: IDonation) => sum + donation.amount, 0);
            const activeUsers = users.reduce((count: number, user: IUser) => count + (!user.isBlocked ? 1 : 0), 0);
            const activeVolunteers = volunteers.reduce((count: number, volunteer: IVolunteer) => count + (!volunteer.isBlocked ? 1 : 0), 0);
            const totalPendingRequests =
                assistanceRequests.filter((req: IAssistanceRequest) => req.status === 'pending').length +
                assetRequests.filter((req: IAssetRequest) => req.status === 'pending').length;

            // Stats with the calculated values
            setStats([
                {
                    title: "Active Users",
                    value: activeUsers,
                    icon: <Users size={24} />,
                    color: "blue"
                },
                {
                    title: "Active Volunteers",
                    value: activeVolunteers,
                    icon: <Handshake size={24} />,
                    color: "green"
                },
                {
                    title: "Donations Received",
                    value: `₹${totalDonations.toLocaleString()}`,
                    icon: <IndianRupee size={24} />,
                    color: "amber"
                },
                {
                    title: "Pending Requests",
                    value: totalPendingRequests,
                    icon: <Clock size={24} />,
                    color: "red"
                }
            ]);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: any) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (isLoading) {
        return <AdminDashboardSkeleton />;
    }

    return (
        <div className="p-6 w-full bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-white p-4 rounded-lg shadow-md flex items-center gap-x-4"
                    >
                        <div className={`text-${stat.color}-600 bg-${stat.color}-100 p-3 rounded-full`}>
                            {stat.icon}
                        </div>
                        <div>
                            <h4 className="text-gray-500 text-sm">{stat.title}</h4>
                            <p className="text-xl font-semibold text-gray-800">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upcoming Meetings */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center mb-4">
                            <Calendar className="text-blue-600 mr-2" size={20} />
                            <h2 className="text-lg font-semibold text-gray-800">Upcoming Meetings</h2>
                        </div>
                        <Link to={'/admin/meetings'}>
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-gray-500"
                            >
                                <ArrowUpRight className="mr-2 w-4 h-4 text-green-500" /> Go to Meetings
                            </Button>
                        </Link>
                    </div>
                    {upcomingMeetings.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {upcomingMeetings.slice(0, 5).map((meeting: any, index: number) => (
                                <li key={index} className="py-3">
                                    <p className="font-medium text-gray-800">{meeting.title}</p>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>{formatDate(meeting.date)}</span>
                                        <span>{meeting.time}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic">No upcoming meetings</p>
                    )}
                </div>

                {/* Recent Donations */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center mb-4">
                            <IndianRupee className="text-green-600 mr-2" size={20} />
                            <h2 className="text-lg font-semibold text-gray-800">Recent Donations</h2>
                        </div>
                        <Link to={'/admin/donations'}>
                            <Button
                                size="sm"
                                variant="outline"
                                // onClick={}
                                className="text-gray-500"
                            >
                                <ArrowUpRight className="mr-2 w-4 h-4 text-green-500" /> Go to Donation Management
                            </Button>
                        </Link>
                    </div>
                    {recentDonations.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {recentDonations.slice(0, 5).map((donation, index) => (
                                <li key={index} className="py-3">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-800">
                                            {donation.isAnonymous ? "Anonymous" : donation.userId ? donation.userId.name : "Anonymous"}
                                        </span>
                                        <span className="font-semibold text-green-600">₹{donation.amount}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>{donation.campaign}</span>
                                        <span>{formatDate(donation.date)}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 italic">No recent donations</p>
                    )}
                </div>
            </div>

            {/* Pending Requests */}
            <div className="mt-6 bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                    <div className="flex items-center mb-4">
                        <AlertTriangle className="text-amber-600 mr-2" size={20} />
                        <h2 className="text-lg font-semibold text-gray-800">Pending Requests</h2>
                    </div>
                    <Link to={'/admin/requestManagement'}>
                        <Button
                            size="sm"
                            variant="outline"
                            // onClick={}
                            className="text-gray-500"
                        >
                            <ArrowUpRight className="mr-2 w-4 h-4 text-green-500" /> Go to Request Management
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Assistance Requests */}
                    <div>
                        <h3 className="font-medium text-gray-700 mb-2">Assistance Requests</h3>
                        {pendingRequests && pendingRequests.assistanceRequests.length > 0 ? (
                            <ul className="space-y-2">
                                {pendingRequests.assistanceRequests.slice(0, 4).map((request: any, index: number) => (
                                    <li key={index} className="p-2 bg-gray-50 rounded border-l-4 border-amber-500">
                                        <p className="font-medium">{request.type === 'volunteer' ? 'Volunteer' : 'Ambulance'} Request</p>
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Priority: {request.priority}</span>
                                            <span>{formatDate(request.requestedDate)}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">No pending assistance requests</p>
                        )}
                    </div>

                    {/* Asset Requests */}
                    <div>
                        <h3 className="font-medium text-gray-700 mb-2">Asset Requests</h3>
                        {pendingRequests && pendingRequests.assetRequests.length > 0 ? (
                            <ul className="space-y-2">
                                {pendingRequests.assetRequests.slice(0, 4).map((request: IAssetRequest, index: number) => (
                                    <li key={index} className="p-2 bg-gray-50 rounded border-l-4 border-blue-500">
                                        <p className="font-medium">{request.asset.name}</p>
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Qty: {request.quantity || 1}</span>
                                            <span>{formatDate(request.requestedDate)}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">No pending asset requests</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;