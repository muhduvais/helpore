import React, { useState, ReactNode } from 'react';
import { Menu, X, Home, Box, FileText, Heart, Newspaper, Users, LogOut, User } from 'lucide-react';
import { Outlet, NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import logo from '../../assets/Logo.png';
import { ToastContainer } from 'react-toastify';

interface MenuItem {
  title: string;
  icon: ReactNode;
  path?: string;
  onClick?: () => void;
}

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
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

      <nav className="bg-[#688D48] text-white shadow-lg">
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

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-[#435D2C]/70"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
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
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;