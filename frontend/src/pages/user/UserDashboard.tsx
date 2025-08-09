import { useEffect, useState } from 'react';
import axios from 'axios';
import { IUser } from '../../interfaces/userInterface';
import { userService } from '../../services/user.service';
import { Activity, FileText, Bell, IndianRupee } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { blockToggle } from '@/redux/slices/authSlice';
import { NavLink } from 'react-router-dom';
import { donationService } from '@/services/donation.service';
// import { meetingService } from '@/services/meeting.service';
import { useNotifications } from '@/context/notificationContext';
// import { IAssistanceRequest } from '@/interfaces/adminInterface';
import { IDonation } from '@/interfaces/donation.interface';
import SummaryCardSkeleton from '@/components/Skeletons/SummaryCardSkeleton';
import profile_pic from '../../assets/profile_pic.png';

const UserDashboard: React.FC = () => {

  const dispatch = useDispatch();

  const [summaryCards, setSummaryCards] = useState([
    {
      title: 'Total Requests',
      value: 0,
      icon: <Activity className="w-8 h-8 text-white/80" />,
      gradient: 'from-[#435D2C] to-[#688D48]'
    },
    {
      title: 'Donations Made',
      value: '₹0',
      icon: <IndianRupee className="w-8 h-8 text-white/80" />,
      gradient: 'from-[#6A4D8B] to-[#9670B6]'
    },
    {
      title: 'Published Blogs',
      value: '0',
      icon: <FileText className="w-8 h-8 text-white/80" />,
      gradient: 'from-[#2A76B5] to-[#6FADE3]'
    },
    {
      title: 'Notifications',
      value: 0,
      icon: <Bell className="w-8 h-8 text-white/80" />,
      gradient: 'from-[#E84C3D] to-[#F27D72]'
    }
  ]);
  // const [meetings, setMeetings] = useState<any>([]);
  // const [donations, setDonations] = useState<IDonation[]>([]);
  const [recentDonation, setRecentDonation] = useState<{ amount: number, date: string, campaign: string }>(
    {
      amount: 0,
      date: new Date().toLocaleDateString(),
      campaign: '',
    }
  );
  // const [assistanceRequests, setAssistanceRequests] = useState<{ assistanceRequests: IAssistanceRequest[] }>({
  //   assistanceRequests: [],
  // });
  const [user, setUser] = useState<IUser>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);

  const { unreadCount } = useNotifications();

  ////////////////////////////////////////////////////

  useEffect(() => {
    if (typeof unreadCount === 'number') {
      setNotificationCount(unreadCount);
      fetchDashboardData(unreadCount);
    }
  }, [unreadCount]);

  useEffect(() => {
    if (typeof unreadCount === 'number' && unreadCount > 0) {
      setNotificationCount(unreadCount);
    }
  }, [unreadCount]);

  useEffect(() => {
    if (notificationCount !== null) {
      setSummaryCards((prev: any) => {
        if (!prev || prev.length < 4) return prev;

        const updated = [...prev];
        updated[3] = {
          ...updated[3],
          value: notificationCount
        };
        return updated;
      });
    }
  }, [notificationCount]);


  const fetchDashboardData = async (notificationCountParam: number) => {
    setIsLoading(true);
    try {
      const [
        // meetingsResponse,
        donationsResponse,
        assistanceRequestsResponse,
      ] = await Promise.all([
        // meetingService.getUserMeetings(1, '', 'all'),
        donationService.fetchDonationHistory(),
        userService.fetchMyAssistanceRequests(1, 0, '', 'all'),
      ]);

      // Meetings data
      // const { meetings, totalPages, totalItems } = meetingsResponse;
      // const transformMeetings = (meetings: any) => {
      //   return meetings.map((meeting: any) => {
      //     const meetingDate = new Date(meeting.scheduledTime);
      //     return {
      //       id: meeting._id,
      //       title: meeting.title,
      //       date: meetingDate.toISOString().split('T')[0],
      //       time: meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
      //       requestedBy: meeting.requestedBy
      //     };
      //   });
      // };
      // setMeetings(transformMeetings(meetings));

      const latestDonations = donationsResponse.data.donations || [];
      // setDonations(latestDonations);

      const { totalRequests: totalAssistanceRequests } = assistanceRequestsResponse.data || [];

      // setAssistanceRequests({
      //   assistanceRequests: assistanceRequests.filter((req: any) => req.type === 'volunteer' || req.type === 'ambulance'),
      // });

      // Calculates stats values
      const totalDonations = latestDonations.reduce((sum: number, donation: IDonation) => sum + donation.amount, 0);
      setRecentDonation({
        amount: latestDonations[0].amount,
        date: new Date(latestDonations[0].date).toLocaleDateString(),
        campaign: latestDonations[0].campaign,
      });

      // Stats with the calculated values
      setSummaryCards([
        {
          title: 'Total Requests',
          value: totalAssistanceRequests,
          icon: <Activity className="w-8 h-8 text-white/80" />,
          gradient: 'from-[#435D2C] to-[#688D48]'
        },
        {
          title: 'Donations Made',
          value: `₹${totalDonations}`,
          icon: <IndianRupee className="w-8 h-8 text-white/80" />,
          gradient: 'from-[#6A4D8B] to-[#9670B6]'
        },
        {
          title: 'Published Blogs',
          value: 'Feature Coming Soon',
          icon: <FileText className="w-8 h-8 text-white/80" />,
          gradient: 'from-[#2A76B5] to-[#6FADE3]'
        },
        {
          title: 'Notifications',
          value: notificationCountParam,
          icon: <Bell className="w-8 h-8 text-white/80" />,
          gradient: 'from-[#E84C3D] to-[#F27D72]'
        }
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  ////////////////////////////////////////////////////

  const fetchUserDetails = async () => {
    try {
      const response = await userService.fetchUserDetails();
      if (response.status === 200) {
        setUser(response.data.user);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('Error fetching user details:', error.response?.data?.message || error.message);
      }
    }
  };

  useEffect(() => {
    fetchUserDetails();

    if (user) {
      dispatch(blockToggle(user.isBlocked));
    }
  }, []);

  const formattedDate = new Date(recentDonation.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const recentActivities = [
    { id: 1, description: 'Requested an asset on Jan 15, 2025', type: 'Asset Request', date: null },
    // { id: 2, description: 'Assistance request submitted on Jan 12, 2025', type: 'Assistance Request' },
    { id: 2, description: `Donated ₹${recentDonation.amount} on ${formattedDate} to ${recentDonation.campaign} campaign`, type: 'Donation', date: recentDonation.date },
    { id: 3, description: 'Published a blog on Jan 10, 2025', type: 'Blog', date: null },
  ];

  return (
    <>
      <div className="p-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${!user ? 'text-gray-500' : 'text-gray-800'} mb-2`}>
                Welcome Back, {user ? user.name.split(' ')[0] + '!' : '...'} 👋
              </h1>
              <p className="text-gray-600">
                Here's a summary of your recent activity and key information at a glance.
              </p>
            </div>
            <NavLink to="/user/profile" className="hidden md:flex items-center space-x-3 relative group">
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-[0.5px] border-[#d2d2d2] relative">
                {user ? (
                  <img
                    src={user.profilePicture ? user.profilePicture : profile_pic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />) :
                  (
                    <div className={`bg-gray-200 animate-pulse ${'w-full h-full object-cover'}`}>
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-1/3 h-1/3 text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    </div>
                  )}
                <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                  <div className="text-white text-[12px] font-semibold flex flex-col items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-1"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                    <span>Visit Profile</span>
                  </div>
                </div>
              </div>
            </NavLink>
          </div>
        </div>

        {/* Summary Cards */}
        {isLoading && <SummaryCardSkeleton />}

        {!isLoading && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {summaryCards.map((card, index) => (
            <div
              key={index}
              className={`bg-gradient-to-r ${card.gradient} rounded-xl shadow-lg p-6 text-white transform transition-transform duration-200 hover:scale-105`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold mb-2">{card.title}</h2>
                  <p className={`${card.title === 'Published Blogs' ? 'text-sm text-gray-200 italic' : 'text-3xl font-bold'}`}>{card.value}</p>
                </div>
                {card.icon}
              </div>
            </div>
          ))}
        </div>}

        {/* Recent Activities */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Activities</h2>
            <button className="text-[#688D48] hover:text-[#435D2C] font-medium">
              View All
            </button>
          </div>
          {recentActivities.length > 0 ? (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-800 font-medium">{activity.description}</p>
                      <span className="text-sm text-gray-500">{activity.type}</span>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                      {activity.date ? new Date(activity.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activities to show.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default UserDashboard;