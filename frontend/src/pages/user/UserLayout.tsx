import React, { useState, ReactNode, useEffect, useRef } from 'react';
import { Menu, X, Home, Box, FileText, Heart, Newspaper, Users, LogOut, User, Bell } from 'lucide-react';
import { Outlet, NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import logo from '../../assets/Logo.png';
import { ToastContainer } from 'react-toastify';
import * as TimeAgoModule from 'react-timeago';
import { useNotifications } from '@/context/notificationContext';
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
  const dispatch = useDispatch();
  
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications, clearNotification } = useNotifications();

  const notificationRef = useRef<HTMLButtonElement>(null);
  const notificationDropdownRef = useRef<HTMLDivElement>(null);

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

  const handleLogout = () => {
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
  };

  const menuItems: MenuItem[] = [
    { title: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/user' },
    { title: 'Assets', icon: <Box className="w-5 h-5" />, path: '/user/assets' },
    { title: 'Requests', icon: <FileText className="w-5 h-5" />, path: '/user/requests' },
    { title: 'Donations', icon: <Heart className="w-5 h-5" />, path: '/user/donations' },
    { title: 'Blogs', icon: <Newspaper className="w-5 h-5" />, path: '/user/blogs' },
    { title: 'About Us', icon: <Users className="w-5 h-5" />, path: '/user/about' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <nav className="bg-[#688D48] text-white shadow-lg fixed w-full z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <img src={logo} alt="Logo" />
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
                      : 'text-white/90 hover:bg-[#435D2C]/70'
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
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-[#435D2C]/70 relative"
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
                                <span className="font-medium text-gray-800">
                                  {notification.type === 'message' ? 'New message' : 'System notification'}
                                </span>
                                <TimeAgo date={notification.timestamp} className="text-xs text-gray-500" />
                              </div>
                              <p className="text-sm text-gray-600 mt-1 truncate">
                                {notification.content}
                              </p>
                            </div>
                            <button
                              className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
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
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-[#435D2C]/70"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <div className="py-1">
                      <NavLink
                        to="/user/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        Profile Settings
                      </NavLink>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
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
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-[#435D2C]/70"
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
                      : 'text-white/90 hover:bg-[#435D2C]/70'
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
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#435D2C]/70 relative"
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
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-white hover:bg-[#435D2C]/70"
              >
                <User className="w-5 h-5" />
                <span className="ml-2">Profile</span>
              </NavLink>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-100 hover:bg-red-800/30"
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