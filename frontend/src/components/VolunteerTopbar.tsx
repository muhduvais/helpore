import { useNavigate } from "react-router-dom";
import { IoNotifications } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { IoMdLogOut } from "react-icons/io";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { PanelLeftDashed } from "lucide-react";
import logo from '../assets/Logo-black.png';
import gsap from 'gsap';
import { useSidebar } from "@/context/sidebarContext";
import { useNotifications } from "@/context/notificationContext";
import * as TimeAgoModule from 'react-timeago';
const TimeAgo = (TimeAgoModule as any).default;

interface Notification {
    _id: string;
    type: 'message' | 'system';
    content: string;
    read: boolean;
    timestamp: Date;
    requestId?: string;
    senderId?: string;
}

const VolunteerTopbar: React.FC<any> = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { sidebarState, toggleSidebar } = useSidebar();
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAllNotifications, clearNotification } = useNotifications();

    // State for notification dropdown
    const [showNotifications, setShowNotifications] = useState(false);

    const messageRef = useRef(null);
    const profileRef = useRef(null);
    const notificationRef = useRef<HTMLButtonElement | null>(null);
    const logoutRef = useRef(null);
    const topBarLogoRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLDivElement>(null);
    const notificationDropdownRef = useRef<HTMLDivElement>(null);

    // Close notification dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node | null;

            if (notificationDropdownRef.current &&
                !notificationDropdownRef.current.contains(target) &&
                notificationRef.current &&
                !notificationRef.current.contains(target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Original animations
    useEffect(() => {
        gsap.fromTo(messageRef.current,
            {
                opacity: 0,
                y: -30,
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out"
            }
        );

        gsap.fromTo(profileRef.current,
            {
                opacity: 0,
                y: -30,
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.9,
                ease: "power2.out"
            }
        );

        gsap.fromTo(notificationRef.current,
            {
                opacity: 0,
                y: -30,
            },
            {
                opacity: 1,
                y: 0,
                duration: 1.3,
                ease: "power2.out"
            }
        );

        gsap.fromTo(logoutRef.current,
            {
                opacity: 0,
                y: -30,
            },
            {
                opacity: 1,
                y: 0,
                duration: 1.5,
                ease: "power2.out"
            }
        );

        gsap.fromTo(toggleRef.current,
            {
                opacity: 0,
                x: -30,
            },
            {
                opacity: 1,
                x: 0,
                duration: 0.8,
                ease: "power2.out"
            }
        );

        const mediaQuery = window.matchMedia('(max-width: 768px)');

        if (mediaQuery.matches && !sidebarState) {
            if (topBarLogoRef.current) {
                gsap.fromTo(
                    topBarLogoRef.current,
                    { opacity: 0, x: -30 },
                    { opacity: 1, x: 0, duration: 1.3, ease: "power2.out" }
                );
            }
        }
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');

        if (mediaQuery.matches) {
            if (topBarLogoRef.current) {
                topBarLogoRef.current.style.display = sidebarState ? 'none' : 'block'
            }
        } else {
            if (topBarLogoRef.current) {
                topBarLogoRef.current.style.display = 'none'
            }
        }
    }, [sidebarState]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/admin/login');
    };

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const handleNotificationClick = (notification: Notification) => {
        if (notification._id) {
            markAsRead(notification._id);
        }

        if (notification.type === 'message' && notification.requestId) {
            navigate(`/volunteer/assistanceRequests/${notification.requestId}?tab=chat`);
            setShowNotifications(false);
        }

        if (notification.type === 'system' && notification.requestId) {
            window.location.href = `/volunteer/meetings`;
            setShowNotifications(false);
          }
    };

    return (
        <div className="header sticky top-0 left-0 right-0 h-[50px] bg-[#D9D9D9] z-10 flex items-center justify-between">
            <div className="start flex items-center justify-center py-1 pl-3 pr-10 gap-x-1 md:gap-x-5">
                <div ref={toggleRef} className="profile">
                    <PanelLeftDashed className="text-[#777777] cursor-pointer" onClick={() => toggleSidebar()}
                        strokeWidth={2.5} />
                </div>
                <div ref={topBarLogoRef} className="logo-topbar-small ml-2">
                    <img src={logo} width="85px" alt="logo" />
                </div>
            </div>
            <div className="end flex items-center justify-center py-1 px-3 md:p-10 gap-x-3 md:gap-x-5">
                <div className="profile">
                    <Link to="/volunteer/profile">
                        <button ref={profileRef} className='flex items-center justify-center'>
                            <FaUserCircle className='text-2xl text-[#5F5F5F] hover:text-[#000] transition-all duration-300 ease-in-out' />
                        </button>
                    </Link>
                </div>
                <div className="notifications relative">
                    <button
                        ref={notificationRef}
                        className='flex items-center justify-center relative'
                        onClick={toggleNotifications}
                    >
                        <IoNotifications className='text-2xl text-[#5F5F5F] hover:text-[#000] transition-all duration-300 ease-in-out' />
                        {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </div>
                        )}
                    </button>

                    {showNotifications && (
                        <div
                            ref={notificationDropdownRef}
                            className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 max-h-96 overflow-y-auto"
                        >
                            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="font-bold">Notifications</h3>
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
                                            onClick={() => clearAllNotifications()}
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                    {notifications.map((notification: any, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 border-b border-gray-100 hover:bg-gray-50 relative ${!notification.read ? 'bg-blue-50' : ''}`}
                                        >
                                            <div
                                                className="cursor-pointer"
                                                onClick={() => handleNotificationClick(notification)}
                                            >
                                                <div className="flex justify-between pr-6">
                                                    <span className="font-medium">
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
                                                    // Use the correct id for clearNotification
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
                <button
                    ref={logoutRef}
                    className='logout bg-[#fff] text-black py-1 px-3 rounded font-bold flex items-center justify-center gap-x-1'
                    onClick={handleLogout}
                >
                    <span className="hidden md:block">Logout</span>
                    <IoMdLogOut className='text-[#5F5F5F] hover:text-[#000]' />
                </button>
            </div>
        </div>
    );
}

export default VolunteerTopbar;