import { useEffect, useState } from 'react';
import axios from 'axios';
import { IUser } from '../../interfaces/userInterface';
import { userService } from '../../services/user.service';
import { Activity, DollarSign, FileText, Bell } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { blockToggle } from '@/redux/slices/authSlice';
import { NavLink } from 'react-router-dom';

const UserDashboard: React.FC = () => {

  const dispatch = useDispatch();

  const [user, setUser] = useState<IUser>();

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

  const summaryCards = [
    {
      title: 'Total Requests',
      value: '8',
      icon: <Activity className="w-8 h-8 text-white/80" />,
      gradient: 'from-[#435D2C] to-[#688D48]'
    },
    {
      title: 'Donations Made',
      value: '$1,200',
      icon: <DollarSign className="w-8 h-8 text-white/80" />,
      gradient: 'from-[#6A4D8B] to-[#9670B6]'
    },
    {
      title: 'Published Blogs',
      value: '4',
      icon: <FileText className="w-8 h-8 text-white/80" />,
      gradient: 'from-[#2A76B5] to-[#6FADE3]'
    },
    {
      title: 'Notifications',
      value: '5',
      icon: <Bell className="w-8 h-8 text-white/80" />,
      gradient: 'from-[#E84C3D] to-[#F27D72]'
    }
  ];

  const recentActivities = [
    { id: 1, description: 'Requested an asset on Jan 15, 2025', type: 'Asset Request' },
    { id: 2, description: 'Assistance request submitted on Jan 12, 2025', type: 'Assistance Request' },
    { id: 3, description: 'Published a blog on Jan 10, 2025', type: 'Blog' },
  ];

  return (
    <>
      <div className="p-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white shadow-lg rounded-xl p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome Back, {user ? user.name.split(' ')[0] : 'User'}! 👋
              </h1>
              <p className="text-gray-600">
                Here's a summary of your recent activity and key information at a glance.
              </p>
            </div>
            {user && user.profilePicture ? (
              <NavLink to="/user/profile" className="hidden md:flex items-center space-x-3 relative group">
                <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-[0.5px] border-[#d2d2d2] relative">
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
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
            ) :
              user?.name && (
                <div className="hidden md:flex items-center space-x-3">
                  <div className="w-12 h-12 bg-[#688D48] rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {summaryCards.map((card, index) => (
            <div
              key={index}
              className={`bg-gradient-to-r ${card.gradient} rounded-xl shadow-lg p-6 text-white transform transition-transform duration-200 hover:scale-105`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold mb-2">{card.title}</h2>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
                {card.icon}
              </div>
            </div>
          ))}
        </div>

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
                      {new Date().toLocaleDateString()}
                    </span>
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