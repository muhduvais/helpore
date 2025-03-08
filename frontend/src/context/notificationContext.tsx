import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { customAxios } from '../utils/apiClient';

interface Notification {
    _id: string;
    type: 'message' | 'system';
    content: string;
    read: boolean;
    timestamp: Date;
    requestId?: string;
    senderId?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAllNotifications: () => void;
    clearNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const auth = useSelector((state: any) => state.auth);

    // Calculate unread count
    const unreadCount = notifications.filter(notification => !notification.read).length;

    // Fetch existing notifications on mount
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!auth.accessToken) return;

            try {
                const response = await customAxios.get('/api/notifications');
                if (response.data.success) {
                    // Transform backend _id to id for frontend consistency
                    const transformedNotifications = response.data.data.map((notif: any) => ({
                        ...notif,
                        timestamp: new Date(notif.timestamp || notif.createdAt)
                    }));
                    console.log('transformed: ', transformedNotifications)
                    setNotifications(transformedNotifications);
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        };

        fetchNotifications();
    }, [auth.accessToken]);

    // Set up socket connection
    useEffect(() => {
        if (!auth.accessToken) return;

        const newSocket = io('http://localhost:5000');

        newSocket.on('connect', () => {
            console.log('Notification socket connected');
            // Join user-specific room for notifications
            newSocket.emit('join-notification-room', auth.userId);
        });

        newSocket.on('new-notification', (notification: Omit<Notification, 'timestamp'>) => {
            addNotification(notification);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [auth.accessToken, auth.userId]);

    // Function to add a new notification
    const addNotification = (notification: Omit<Notification, 'timestamp'>) => {
        const newNotification: Notification = {
            ...notification,
            _id: notification._id || Math.random().toString(36).substring(2, 11), // Handle both id formats
            timestamp: new Date()
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Play sound
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(e => console.log('Error playing notification sound', e));

        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('New message', {
                body: notification.content,
            });
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId: string) => {
        try {
            await customAxios.put(`/api/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(notif =>
                    notif._id === notificationId ? { ...notif, read: true } : notif
                )
            );
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            await customAxios.put('/api/notifications/read-all');
            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read: true }))
            );
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    // Clear all notifications
    const clearAllNotifications = async () => {
        try {
            await customAxios.delete('/api/notifications');
            setNotifications([]);
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    };

    const clearNotification = async (id: string) => {
        try {
            await customAxios.delete(`/api/notifications/${id}`);
            setNotifications(prev => prev.filter(notification => notification._id !== id));
        } catch (error) {
            console.error('Failed to clear the notification:', error);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearAllNotifications,
            clearNotification,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};