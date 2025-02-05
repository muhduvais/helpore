import React, { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { IUser } from '../../interfaces/userInterface';
import { userService } from '../../services/userService';
import { Activity, DollarSign, FileText, Bell } from 'lucide-react';

const UserDashboard: React.FC = () => {
  const [user, setUser] = useState<IUser>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchUserDetails = async () => {
    try {
      setIsLoading(true);
      const response = await userService.fetchUserDetails();

      if (response.status === 200) {
        const { userDetails } = response.data;
        setUser(userDetails.user);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log('Error fetching user details:', error.response?.data?.message || error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
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
          {user?.name && (
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
  );
};

export default UserDashboard;