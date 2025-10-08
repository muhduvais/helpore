import { useState, ReactNode, useEffect, useRef } from 'react';
import { Menu, X, Home, Box, FileText, Heart, Newspaper, LogOut, User, Bell, Upload, UserIcon, User2 } from 'lucide-react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import logo from '../../assets/Logo-black.png';
import 'react-toastify/dist/ReactToastify.css';
import * as TimeAgoModule from 'react-timeago';
import { useNotifications } from '@/context/notificationContext';
import { IUser } from '@/interfaces/userInterface';
import { userService } from '@/services/user.service';
import { AxiosError } from 'axios';
import profile_pic from '../../assets/profile_pic.png';
import { MdPassword } from 'react-icons/md';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
const TimeAgo = (TimeAgoModule as any).default;

interface MenuItem {
  title: string;
  icon: ReactNode;
  path?: string;
  onClick?: () => void;
}

interface Notification {
  _id: string;
  type: 'message' | 'system';
  content: string;
  read: boolean;
  timestamp: Date;
  requestId?: string;
  senderId?: string;
}

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState<IUser>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications, clearNotification } = useNotifications();

  const notificationRef = useRef<HTMLButtonElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUserDetails();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;

      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(target) &&
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUserDetails = async () => {
    try {
      const response = await userService.fetchUserDetails();
      if (response.status === 200) {
        setUser(response.data.user);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error('Error fetching user details:', error.response?.data || error.message);
      } else {
        console.error('Unexpected error:', error);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    const response = await authService.logout();
    if (response.status === 200) {
      toast.success(response.data.message);
    }
    dispatch(logout());
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setIsProfileDropdownOpen(false);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification._id) {
      markAsRead(notification._id);
    }

    if (notification.type === 'message' && notification.requestId) {
      window.location.href = `/user/assistanceRequests/${notification.requestId}?tab=chat`;
      setShowNotifications(false);
    }

    if (notification.type === 'system' && notification.requestId) {
      window.location.href = `/user/meetings`;
      setShowNotifications(false);
    }
  };

  const timeFormatter = (value: number, unit: string, suffix: string) => {
    if (unit === 'second') {
      return 'Just now';
    }
    return `${value} ${unit}${value !== 1 ? 's' : ''} ${suffix}`;
  };

  const menuItems: MenuItem[] = [
    { title: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/user' },
    { title: 'Assets', icon: <Box className="w-5 h-5" />, path: '/user/assets' },
    { title: 'Requests', icon: <FileText className="w-5 h-5" />, path: '/user/requests' },
    { title: 'Donations', icon: <Heart className="w-5 h-5" />, path: '/user/donations' },
    { title: 'Meetings', icon: <Newspaper className="w-5 h-5" />, path: '/user/meetings' },
    // { title: 'About Us', icon: <Users className="w-5 h-5" />, path: '/user/about' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#ffffff] text-[#435D2C] shadow-lg fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <button onClick={() => navigate('/user/dashboard')}>
              <img src={logo} alt="Logo" />
            </button>
            {!logo && (
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    LOGO
                  </div>
                  <span className="ml-3 font-semibold text-lg">Welfare App</span>
                </div>
              </div>
            )}

            <div className="hidden md:flex items-center space-x-4">
              {menuItems.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.path || ''}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive
                      ? 'bg-[#435D2C] text-white'
                      : 'text-[#435D2C] hover:text-white hover:bg-[#435D2C]/80'
                    }`
                  }
                >
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </NavLink>
              ))}

              {/* Notifications Button */}
              <div className="relative">
                <button
                  ref={notificationRef}
                  onClick={toggleNotifications}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:text-white hover:bg-[#435D2C]/80 relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div
                    ref={notificationDropdownRef}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 max-h-96 overflow-y-auto"
                  >
                    <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="font-bold text-gray-800">Notifications</h3>
                      {notifications.length > 0 && (
                        <button
                          className="text-sm text-blue-500 hover:text-blue-700"
                          onClick={markAllAsRead}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      <div>
                        <div className="p-2 border-b border-gray-200 flex justify-end">
                          <button
                            className="text-sm text-red-500 hover:text-red-700"
                            onClick={clearAllNotifications}
                          >
                            Clear all
                          </button>
                        </div>
                        {notifications.map((notification, index) => (
                          <div
                            key={index}
                            className={`p-3 border-b border-gray-100 hover:bg-gray-50 relative ${!notification.read ? 'bg-blue-50' : ''}`}
                          >
                            <div
                              className="cursor-pointer"
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex justify-between pr-6">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-800">
                                    {notification.type === 'message' ? 'New message' : 'Meeting Scheduled'}
                                  </span>
                                  {notification.media && notification.media.length > 0 && (
                                    <div className="flex items-center space-x-1">
                                      <svg className="h-3 w-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                      </svg>
                                      <span className="text-xs text-blue-600 font-medium">
                                        {notification.media.length}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <TimeAgo date={notification.timestamp} formatter={timeFormatter} className="text-xs text-gray-500" />
                              </div>

                              <p className="text-sm text-gray-600 mt-1 truncate">
                                {notification.content}
                              </p>

                              {/* Media Preview */}
                              {notification.media && notification.media.length > 0 && (
                                <div className="mt-3 mb-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs text-gray-500 font-medium">
                                      {notification.media.length} attachment{notification.media.length > 1 ? 's' : ''}
                                    </span>
                                  </div>

                                  {notification.media.length === 1 ? (

                                    <div className="relative group">
                                      <img
                                        src={notification.media[0]}
                                        alt="Media attachment"
                                        className="w-full h-20 object-cover rounded-lg border border-gray-200 group-hover:opacity-90 transition-opacity"

                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';

                                          const sibling = target.nextElementSibling as HTMLElement;
                                          sibling.style.display = 'flex';
                                        }}
                                      />
                                      <div className="hidden w-full h-20 bg-gray-100 rounded-lg border border-gray-200 items-center justify-center">
                                        <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                      </div>
                                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200"></div>
                                    </div>
                                  ) : (
                                    /* Multiple Media Preview */
                                    <div className="grid grid-cols-3 gap-1">
                                      {notification.media.slice(0, 3).map((mediaUrl, mediaIndex) => (
                                        <div key={mediaIndex} className="relative group">
                                          <img
                                            src={mediaUrl}
                                            alt={`Media ${mediaIndex + 1}`}
                                            className="w-full h-16 object-cover rounded border border-gray-200 group-hover:opacity-90 transition-opacity"

                                            onError={(e) => {
                                              const target = e.target as HTMLImageElement;
                                              target.style.display = 'none';

                                              const sibling = target.nextElementSibling as HTMLElement;
                                              sibling.style.display = 'flex';
                                            }}
                                          />
                                          <div className="hidden w-full h-16 bg-gray-100 rounded border border-gray-200 items-center justify-center">
                                            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                          </div>
                                          {mediaIndex === 2 && notification.media.length > 3 && (
                                            <div className="absolute inset-0 bg-black bg-opacity-60 rounded flex items-center justify-center">
                                              <span className="text-white text-xs font-semibold">
                                                +{notification.media.length - 3}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Media Type Indicator */}
                                  <div className="mt-2 flex items-center justify-between">
                                    <div className="flex items-center space-x-1">
                                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                      <span className="text-xs text-gray-500">Media message</span>
                                    </div>
                                    <span className="text-xs text-blue-600 font-medium hover:underline cursor-pointer">
                                      View all
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                clearNotification(notification._id);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(!isProfileDropdownOpen);
                    setShowNotifications(false);
                  }}
                  className="flex items-center px-3 py-2 rounded-md text-sm hover:text-white font-medium"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    {user?.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full border-[1px] border-transparent hover:border-[#435D2C]/80"
                      />
                    ) : (
                      <User2 className="w-5 h-5" />
                    )}
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-2xl bg-white ring-1 ring-black ring-opacity-5 z-10"
                    ref={profileDropdownRef}>
                    <div className="py-1">
                      <NavLink
                        to="/user/profile"
                        className="group block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex flex-col gap-1'>
                            <span className='font-bold hover:underline'>{user?.name}</span>
                            <span className='text-xs text-gray-500'>{user?.email}</span>
                          </div>
                          <div className="w-[50px] h-[50px] rounded-full overflow-hidden border-[0.5px] border-[#d2d2d2] relative">
                            {user ? (
                              <img
                                src={user.profilePicture ? user.profilePicture : profile_pic}
                                alt="Profile"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
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
                          </div>
                        </div>
                      </NavLink>
                      <hr />
                      <NavLink
                        to="/user/profile"
                        className="group flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}>
                        <UserIcon className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-125 group-hover:text-gray-900" />
                        <span>Profile Settings</span>
                      </NavLink>
                      <NavLink
                        to="/user/profile/info?tab=uploads"
                        className="group flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <Upload className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-125 group-hover:text-gray-900" />
                        <span>Manage Uploads</span>
                      </NavLink>
                      <NavLink
                        to="/user/profile/info?tab=password"
                        className="group flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}>
                        <MdPassword className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-125 group-hover:text-gray-900" />
                        <span>Change Password</span>
                      </NavLink>
                      <hr />
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="group w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-125" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-[#435D2C] hover:text-white border-[1px] border-[#435D2C]/20 hover:border-none hover:bg-[#435D2C]/70"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.path || ''}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center w-full px-3 py-2 rounded-md text-base font-medium
                    ${isActive
                      ? 'bg-[#435D2C] text-white'
                      : 'text-[#435D2C] hover:text-white/90 hover:bg-[#435D2C]/90'
                    }`
                  }
                >
                  {item.icon}
                  <span className="ml-2">{item.title}</span>
                </NavLink>
              ))}
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-[#435D2C] hover:text-white hover:bg-[#435D2C]/90 relative"
              >
                <Bell className="w-5 h-5" />
                <span className="ml-2">Notifications</span>
                {unreadCount > 0 && (
                  <div className="absolute left-7 top-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </button>
              <NavLink
                to="/user/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-[#435D2C] hover:text-white hover:bg-[#435D2C]/90"
              >
                <User className="w-5 h-5" />
                <span className="ml-2">Profile</span>
              </NavLink>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-700 hover:text-white hover:bg-red-800/90"
              >
                <LogOut className="w-5 h-5" />
                <span className="ml-2">Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mt-16">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;