import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export const AuthErrorHandler = () => {
    const navigate = useNavigate();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isLoggedIn);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/user/login');
        }
    }, [isAuthenticated, navigate]);

    return <Outlet />;
};