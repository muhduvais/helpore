import React, { useState, ReactNode } from 'react';
import { Menu, X, Home, Box, FileText, Heart, Newspaper, Users } from 'lucide-react';
import { Outlet, NavLink } from 'react-router-dom';
import logo from '../../assets/Logo.png'
import { ToastContainer } from 'react-toastify';

interface MenuItem {
  title: string;
  icon: ReactNode;
  path: string;
}

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

      {/* Top Navigation Bar */}
      <nav className="bg-[#688D48] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            {/* Logo and Brand */}
            <img src={logo} alt="Logo" />
            {!logo &&
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    LOGO
                  </div>
                  <span className="ml-3 font-semibold text-lg">Welfare App</span>
                </div>
              </div>}

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
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
            </div>

            {/* Mobile menu button */}
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

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
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
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
