import { useNavigate } from "react-router-dom";
import { MdMessage } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice";
import { IoMdLogOut } from "react-icons/io";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

const Topbar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const response = await authService.logout();
    if (response.status === 200) {
      toast.success(response.data.message);
    }
    dispatch(logout());
    navigate("/admin/login");
  };

  return (
    <div className="header fixed top-0 w-[100%] h-[50px] bg-[#D9D9D9] z-0 flex items-center justify-end py-1 px-10 gap-x-5">
      <div className="comments">
        <button className="flex items-center justify-center">
          <MdMessage className="text-2xl text-[#5F5F5F] hover:text-[#000] transition-all duration-300 ease-in-out" />
        </button>
      </div>
      <div className="notifications">
        <button className="flex items-center justify-center">
          <IoNotifications className="text-2xl text-[#5F5F5F] hover:text-[#000] transition-all duration-300 ease-in-out" />
        </button>
      </div>
      <div className="profile">
        <button className="flex items-center justify-center">
          <FaUserCircle className="text-2xl text-[#5F5F5F] hover:text-[#000] transition-all duration-300 ease-in-out" />
        </button>
      </div>
      <button
        className="logout bg-[#fff] text-black py-1 px-3 rounded font-bold flex items-center justify-center gap-x-1"
        onClick={handleLogout}
      >
        <span>Logout</span>
        <IoMdLogOut className="text-[#5F5F5F] hover:text-[#000]" />
      </button>
    </div>
  );
};

export default Topbar;
