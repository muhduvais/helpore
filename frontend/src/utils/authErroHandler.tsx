import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export const AuthErrorHandler: React.FC<{ role: string }> = ({ role }) => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isLoggedIn);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate(`/${role}/login`);
        }
    }, [isAuthenticated, navigate]);

    return <Outlet />;
};