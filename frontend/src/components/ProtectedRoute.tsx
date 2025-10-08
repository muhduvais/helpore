import { logout } from "@/redux/slices/authSlice";
import { authService } from "@/services/auth.service";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ProtectedRouteProps {
  roleRequired: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roleRequired }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoggedIn, role, isBlocked, userId } = useSelector(
    (state: any) => state.auth
  );

  useEffect(() => {
    const authenticated = async () => {
      try {
        await authService.authenticateUser(userId);
      } catch (error) {
        throw error;
      }
    };

    if (!authenticated) {
      console.log("Not authenticated");
      navigate(`/${roleRequired}/login`, { replace: true });
      return;
    }

    if (!isLoggedIn) {
      navigate(`/home`, { replace: true });
      return;
    }

    const handleLogout = async (): Promise<void> => {
      const response = await authService.logout();
      if (response.status === 200) {
        toast.info("Session timed out. Please login again");
      }
      dispatch(logout());
    };

    if (isBlocked && role !== "admin") {
      handleLogout();
      return;
    }

    if (role && role !== roleRequired) {
      navigate(`/${role}/404`, { replace: true });
    }
  }, [isLoggedIn, role, roleRequired, isBlocked, navigate]);

  if (!isLoggedIn || isBlocked) {
    return null;
  }

  return <Outlet />;
};

export default ProtectedRoute;
