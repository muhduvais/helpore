import { useNavigate } from "react-router-dom";
import { IoNotifications } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { IoMdLogOut } from "react-icons/io";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { PanelLeftDashed } from "lucide-react";
import logo from "../assets/Logo-black.png";
import gsap from "gsap";
import { useSidebar } from "@/context/sidebarContext";
import { useNotifications } from "@/context/notificationContext";
import * as TimeAgoModule from "react-timeago";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
const TimeAgo = (TimeAgoModule as any).default;

interface Notification {
  _id: string;
  type: "message" | "system";
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
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    clearNotification,
  } = useNotifications();

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

      if (
        notificationDropdownRef.current &&
        !notificationDropdownRef.current.contains(target) &&
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Original animations
  useEffect(() => {
    gsap.fromTo(
      messageRef.current,
      {
        opacity: 0,
        y: -30,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      }
    );

    gsap.fromTo(
      profileRef.current,
      {
        opacity: 0,
        y: -30,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power2.out",
      }
    );

    gsap.fromTo(
      notificationRef.current,
      {
        opacity: 0,
        y: -30,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1.3,
        ease: "power2.out",
      }
    );

    gsap.fromTo(
      logoutRef.current,
      {
        opacity: 0,
        y: -30,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: "power2.out",
      }
    );

    gsap.fromTo(
      toggleRef.current,
      {
        opacity: 0,
        x: -30,
      },
      {
        opacity: 1,
        x: 0,
        duration: 0.8,
        ease: "power2.out",
      }
    );

    const mediaQuery = window.matchMedia("(max-width: 768px)");

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
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    if (mediaQuery.matches) {
      if (topBarLogoRef.current) {
        topBarLogoRef.current.style.display = sidebarState ? "none" : "block";
      }
    } else {
      if (topBarLogoRef.current) {
        topBarLogoRef.current.style.display = "none";
      }
    }
  }, [sidebarState]);

  const handleLogout = async () => {
    const response = await authService.logout();
    if (response.status === 200) {
      toast.success(response.data.message);
    }
    dispatch(logout());
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification._id) {
      markAsRead(notification._id);
    }

    if (notification.type === "message" && notification.requestId) {
      navigate(
        `/volunteer/assistanceRequests/${notification.requestId}?tab=chat`
      );
      setShowNotifications(false);
    }

    if (notification.type === "system" && notification.requestId) {
      window.location.href = `/volunteer/meetings`;
      setShowNotifications(false);
    }
  };

  // --- Add this formatter for "Just now" ---
  const timeFormatter = (value: number, unit: string, suffix: string) => {
    if (unit === "second") {
      return "Just now";
    }
    return `${value} ${unit}${value !== 1 ? "s" : ""} ${suffix}`;
  };

  return (
    <div className="header sticky top-0 left-0 right-0 h-[50px] bg-[#D9D9D9] z-10 flex items-center justify-between">
      <div className="start flex items-center justify-center py-1 pl-3 pr-10 gap-x-1 md:gap-x-5">
        <div ref={toggleRef} className="profile">
          <PanelLeftDashed
            className="text-[#777777] cursor-pointer"
            onClick={() => toggleSidebar()}
            strokeWidth={2.5}
          />
        </div>
        <div ref={topBarLogoRef} className="logo-topbar-small ml-2">
          <img src={logo} width="85px" alt="logo" />
        </div>
      </div>
      <div className="end flex items-center justify-center py-1 px-3 md:p-10 gap-x-3 md:gap-x-5">
        <div className="profile">
          <Link to="/volunteer/profile">
            <button
              ref={profileRef}
              className="flex items-center justify-center"
            >
              <FaUserCircle className="text-2xl text-[#5F5F5F] hover:text-[#000] transition-all duration-300 ease-in-out" />
            </button>
          </Link>
        </div>
        <div className="notifications relative">
          <button
            ref={notificationRef}
            className="flex items-center justify-center relative"
            onClick={toggleNotifications}
          >
            <IoNotifications className="text-2xl text-[#5F5F5F] hover:text-[#000] transition-all duration-300 ease-in-out" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            )}
          </button>

          {showNotifications && (
            <div
              ref={notificationDropdownRef}
              className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 max-h-96 overflow-y-auto"
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
                      onClick={() => clearAllNotifications()}
                    >
                      Clear all
                    </button>
                  </div>
                  {notifications.map((notification: any, index) => (
                    <div
                      key={index}
                      className={`p-3 border-b border-gray-100 hover:bg-gray-50 relative ${
                        !notification.read ? "bg-blue-50" : ""
                      }`}
                    >
                      <div
                        className="cursor-pointer"
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex justify-between pr-6">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-800">
                              {notification.type === "message"
                                ? "New message"
                                : "Meeting Scheduled"}
                            </span>
                            {notification.media &&
                              notification.media.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  <svg
                                    className="h-3 w-3 text-blue-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                    />
                                  </svg>
                                  <span className="text-xs text-blue-600 font-medium">
                                    {notification.media.length}
                                  </span>
                                </div>
                              )}
                          </div>
                          <TimeAgo
                            date={notification.timestamp}
                            formatter={timeFormatter}
                            className="text-xs text-gray-500"
                          />
                        </div>

                        <p className="text-sm text-gray-600 mt-1 truncate">
                          {notification.content}
                        </p>

                        {/* Media Preview */}
                        {notification.media &&
                          notification.media.length > 0 && (
                            <div className="mt-3 mb-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <svg
                                  className="h-4 w-4 text-gray-500"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                <span className="text-xs text-gray-500 font-medium">
                                  {notification.media.length} attachment
                                  {notification.media.length > 1 ? "s" : ""}
                                </span>
                              </div>

                              {notification.media.length === 1 ? (
                                <div className="relative group">
                                  <img
                                    src={notification.media[0]}
                                    alt="Media attachment"
                                    className="w-full h-20 object-cover rounded-lg border border-gray-200 group-hover:opacity-90 transition-opacity"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                      const sibling =
                                        target.nextElementSibling as HTMLElement;
                                      if (sibling)
                                        sibling.style.display = "flex";
                                    }}
                                  />
                                  <div className="hidden w-full h-20 bg-gray-100 rounded-lg border border-gray-200 items-center justify-center">
                                    <svg
                                      className="h-8 w-8 text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                      />
                                    </svg>
                                  </div>
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200"></div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-3 gap-1">
                                  {notification.media
                                    .slice(0, 3)
                                    .map(
                                      (
                                        mediaUrl: string,
                                        mediaIndex: number
                                      ) => (
                                        <div
                                          key={mediaIndex}
                                          className="relative group"
                                        >
                                          <img
                                            src={mediaUrl}
                                            alt={`Media ${mediaIndex + 1}`}
                                            className="w-full h-16 object-cover rounded border border-gray-200 group-hover:opacity-90 transition-opacity"
                                            onError={(e) => {
                                              const target =
                                                e.target as HTMLImageElement;
                                              target.style.display = "none";
                                              const sibling =
                                                target.nextElementSibling as HTMLElement;
                                              if (sibling)
                                                sibling.style.display = "flex";
                                            }}
                                          />
                                          <div className="hidden w-full h-16 bg-gray-100 rounded border border-gray-200 items-center justify-center">
                                            <svg
                                              className="h-6 w-6 text-gray-400"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                              />
                                            </svg>
                                          </div>
                                          {mediaIndex === 2 &&
                                            notification.media.length > 3 && (
                                              <div className="absolute inset-0 bg-black bg-opacity-60 rounded flex items-center justify-center">
                                                <span className="text-white text-xs font-semibold">
                                                  +
                                                  {notification.media.length -
                                                    3}
                                                </span>
                                              </div>
                                            )}
                                        </div>
                                      )
                                    )}
                                </div>
                              )}

                              <div className="mt-2 flex items-center justify-between">
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                  <span className="text-xs text-gray-500">
                                    Media message
                                  </span>
                                </div>
                                <span className="text-xs text-blue-600 font-medium hover:underline cursor-pointer">
                                  View all
                                </span>
                              </div>
                            </div>
                          )}
                      </div>
                      <button
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(notification._id);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
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
          className="logout bg-[#fff] text-black py-1 px-3 rounded font-bold flex items-center justify-center gap-x-1"
          onClick={handleLogout}
        >
          <span className="hidden md:block">Logout</span>
          <IoMdLogOut className="text-[#5F5F5F] hover:text-[#000]" />
        </button>
      </div>
    </div>
  );
};

export default VolunteerTopbar;
