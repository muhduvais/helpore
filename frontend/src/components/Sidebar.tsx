import { FaUsers } from "react-icons/fa";
import { FaUsersLine } from "react-icons/fa6";
import { MdDashboard } from "react-icons/md";
import { AiFillProduct } from "react-icons/ai";
import { Link } from "react-router-dom";
import logo from '.././assets/Logo-black.png'

const Sidebar: React.FC<{ activeLink: string }> = ({ activeLink }) => {
    
    const menuItems = [
        { label: "Dashboard", icon: <MdDashboard />, path: "/admin/dashboard" },
        { label: "User Management", icon: <FaUsers />, path: "/admin/userManagement" },
        { label: "Volunteer Management", icon: <FaUsersLine />, path: "/admin/volunteerManagement" },
        { label: "Asset Management", icon: <AiFillProduct />, path: "/admin/assetManagement" },
    ];

    return (
        <div className="sidebar fixed left-0 z-20 h-[100%] w-[250px] bg-[#F4F4F4] shadow-[10px_0_50px_rgba(0,0,0,0.2)] px-5 py-3 flex flex-col items-center justify-start">
            <div className="logo flex items-center justify-between mb-4">
                <img src={logo} alt="logo" />
            </div>
            <ul className="buttons w-[100%] flex flex-col gap-y-3">
                {menuItems.map((item) => (
                    <li key={item.label}>
                        <Link to={item.path}>
                            <button
                                className={`w-[100%] text-white px-4 py-2 text-start text-sm rounded flex items-center gap-x-2 ${activeLink === item.path ? 'bg-[#435D2C]' : 'bg-[#688D48]'}`}
                            >
                                {item.icon} <span>{item.label}</span>
                            </button>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Sidebar;