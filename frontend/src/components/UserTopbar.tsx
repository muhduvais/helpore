import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { IoMdLogOut } from "react-icons/io";
import { useEffect, useRef } from "react";
import { PanelLeftDashed } from "lucide-react";
import logo from "../assets/Logo-black.png";
import gsap from "gsap";
import { useSidebar } from "@/context/sidebarContext";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

const UserTopbar: React.FC<any> = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { sidebarState, toggleSidebar } = useSidebar();
  const messageRef = useRef(null);
  const profileRef = useRef(null);
  const logoutRef = useRef(null);
  const topBarLogoRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);

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

    // gsap.fromTo(notificationRef.current,
    //     {
    //         opacity: 0,
    //         y: -30,
    //     },
    //     {
    //         opacity: 1,
    //         y: 0,
    //         duration: 1.3,
    //         ease: "power2.out"
    //     }
    // );

    gsap.fromTo(
      logoutRef.current,
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
      toast.info('Logout successful');
    }
    dispatch(logout());
    navigate("/admin/login");
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

export default UserTopbar;
