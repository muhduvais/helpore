import { useEffect, useRef } from "react";
import { Calendar, ChartNoAxesGantt, FileText, Handshake, HeartHandshake, LayoutDashboard, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logo from '../assets/Logo-black.png';
import logo_short from '../assets/Logo-black-short.png';
import gsap from 'gsap';
import { useSidebar } from "@/context/sidebarContext";

const AdminSidebar = () => {

    const location = useLocation();

    const { sidebarState } = useSidebar();

    const sidebarRef = useRef<HTMLDivElement>(null);
    const oneRef = useRef(null);
    const twoRef = useRef(null);
    const threeRef = useRef(null);
    const fourRef = useRef(null);
    const fiveRef = useRef(null);
    const sixRef = useRef(null);
    const sevenRef = useRef(null);

    const currentPage = location.pathname.split("/")[2] || "dashboard";

    useEffect(() => {
        if (oneRef.current && twoRef.current && threeRef.current && fourRef.current) {
            gsap.fromTo(oneRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
            gsap.fromTo(twoRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" });
            gsap.fromTo(threeRef.current, { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 1.3, ease: "power2.out" });
            gsap.fromTo(fourRef.current, { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 1.5, ease: "power2.out" });
            gsap.fromTo(fiveRef.current, { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 1.6, ease: "power2.out" });
            gsap.fromTo(sixRef.current, { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 1.6, ease: "power2.out" });
            gsap.fromTo(sevenRef.current, { opacity: 0, y: -50 }, { opacity: 1, y: 0, duration: 1.6, ease: "power2.out" });
        }
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(max-width: 768px)');

        if (mediaQuery.matches) {
            if (sidebarRef.current) {
                sidebarRef.current.style.display = sidebarState ? 'block' : 'none';
                sidebarRef.current.style.padding = sidebarState ? '8px' : '';
            }
            gsap.to(sidebarRef.current, {
                width: sidebarState ? '230px' : '0px',
                duration: 0.3,
                ease: "power2.out"
            });
        } else {
            if (sidebarRef.current) {
                sidebarRef.current.style.display = 'block';
            }
            gsap.to(sidebarRef.current, {
                width: sidebarState ? '290px' : '80px',
                duration: 0.3,
                ease: "power2.out"
            });
        }
    }, [sidebarState]);

    return (
        <div
            ref={sidebarRef}
            className={`sidebar ${sidebarState ? 'p-5' : 'px-5 pb-5 pt-2'} shadow-[2px_0_8px_0_rgba(0,0,0,0.15)]`}
        >
            <ul className={`sideMenu w-full flex flex-col ${sidebarState ? 'items-start' : 'items-center'} justify-center gap-y-2 text-white text-sm text-nowrap`}>
                <div className={`${sidebarState ? 'px-3 pb-5' : 'mb-5'} main-logo w-full`}>
                    <Link to="/admin/dashboard">
                        {sidebarState ?
                            <img src={logo} alt="" />
                            : <img src={logo_short} alt="" />}
                    </Link>
                </div>

                <Link ref={oneRef} className={`${currentPage === "dashboard" ? 'bg-[#435D2C]' : 'bg-[#688D48]'} px-2 py-2 w-full rounded`} to="/admin/dashboard">
                    <li className={`flex items-center ${sidebarState ? 'justify-start' : 'justify-center'} gap-x-2`}>
                        <LayoutDashboard size={20} />
                        <span className={`${sidebarState ? 'block' : 'hidden'}`}>Dashboard</span>
                    </li>
                </Link>

                <Link ref={twoRef} className={`${currentPage === "userManagement"  || currentPage === "userDetails" ? 'bg-[#435D2C]' : 'bg-[#688D48]'} px-2 py-2 w-full rounded`} to="/admin/userManagement">
                    <li className={`flex items-center ${sidebarState ? 'justify-start' : 'justify-center'} gap-x-2`}>
                        <Users size={20} />
                        <span className={`${sidebarState ? 'block' : 'hidden'}`}>User Management</span>
                    </li>
                </Link>

                <Link ref={threeRef} className={`${currentPage === "volunteerManagement"  || currentPage === "volunteerDetails" ? 'bg-[#435D2C]' : 'bg-[#688D48]'} px-2 py-2 w-full rounded`} to="/admin/volunteerManagement">
                    <li className={`flex items-center ${sidebarState ? 'justify-start' : 'justify-center'} gap-x-2`}>
                        <Handshake size={20} />
                        <span className={`${sidebarState ? 'block' : 'hidden'}`}>Volunteer Management</span>
                    </li>
                </Link>

                <Link ref={fourRef} className={`${currentPage === "assetManagement"  || currentPage === "assets" ? 'bg-[#435D2C]' : 'bg-[#688D48]'} px-2 py-2 w-full rounded`} to="/admin/assetManagement">
                    <li className={`flex items-center ${sidebarState ? 'justify-start' : 'justify-center'} gap-x-2`}>
                        <ChartNoAxesGantt size={20} />
                        <span className={`${sidebarState ? 'block' : 'hidden'}`}>Asset Management</span>
                    </li>
                </Link>

                <Link ref={fiveRef} className={`${currentPage === "requestManagement"  || currentPage === "assistanceRequests" ? 'bg-[#435D2C]' : 'bg-[#688D48]'} px-2 py-2 w-full rounded`} to="/admin/requestManagement">
                    <li className={`flex items-center ${sidebarState ? 'justify-start' : 'justify-center'} gap-x-2`}>
                        <FileText size={20} />
                        <span className={`${sidebarState ? 'block' : 'hidden'}`}>Request Management</span>
                    </li>
                </Link>

                <Link ref={sixRef} className={`${currentPage === "donations" ? 'bg-[#435D2C]' : 'bg-[#688D48]'} px-2 py-2 w-full rounded`} to="/admin/donations">
                    <li className={`flex items-center ${sidebarState ? 'justify-start' : 'justify-center'} gap-x-2`}>
                        <HeartHandshake size={20} />
                        <span className={`${sidebarState ? 'block' : 'hidden'}`}>Donations</span>
                    </li>
                </Link>

                <Link ref={sevenRef} className={`${currentPage === "meetings" ? 'bg-[#435D2C]' : 'bg-[#688D48]'} px-2 py-2 w-full rounded`} to="/admin/meetings">
                    <li className={`flex items-center ${sidebarState ? 'justify-start' : 'justify-center'} gap-x-2`}>
                        <Calendar size={20} />
                        <span className={`${sidebarState ? 'block' : 'hidden'}`}>Meetings</span>
                    </li>
                </Link>
            </ul>
        </div>
    )
}

export default AdminSidebar;