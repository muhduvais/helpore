import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
    roleRequired: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roleRequired }) => {
    const navigate = useNavigate();

    const { isLoggedIn, role } = useSelector((state: any) => state.auth);

    console.log("Inside ProtectedRoute, values:", { isLoggedIn, role });

    useEffect(() => {
        if (!isLoggedIn) {
            navigate(`/${roleRequired}/login`);
            return;
        }

        if (role && role !== roleRequired) {
            navigate(`/${role}/404`);
        }
    }, [isLoggedIn, role, roleRequired, navigate]);

    if (!isLoggedIn || (role && role !== roleRequired)) {
        return null;
    }

    return <Outlet />;
};

export default ProtectedRoute;
