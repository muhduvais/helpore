import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { customAxios } from '../utils/apiClient';

interface INotificationResponse {
    success: boolean;
    data: any
}

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
    showNewNotifications: boolean;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAllNotifications: () => void;
    clearNotification: (id: string) => void;
    closeShowNewNotifications: () => void;
}

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

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
    const [showNewNotifications, setShowNewNotifications] = useState<boolean>(false);
    const auth = useSelector((state: any) => state.auth);

    // Calculate unread count
    const unreadCount = notifications.filter(notification => !notification.read).length;

    // Fetch existing notifications on mount
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!auth.accessToken) return;

            try {
                const response = await customAxios.get<INotificationResponse>('/api/notifications');
                if (response.data.success) {
                    const transformedNotifications = response.data.data.map((notif: any) => ({
                        ...notif,
                        timestamp: new Date(notif.timestamp || notif.createdAt)
                    }));
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

        const newSocket = io(SERVER_URL);

        newSocket.on('connect', () => {
            console.log('Notification socket connected');
            newSocket.emit('join-notification-room', auth.userId);
        });

        newSocket.on('new-notification', (notification: Omit<Notification, 'timestamp'>) => {
            addNotification(notification);
            setShowNewNotifications(true);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [auth.accessToken, auth.userId]);

    // Function to add a new notification
    const addNotification = (notification: Omit<Notification, 'timestamp'>) => {
        const newNotification: Notification = {
            ...notification,
            _id: notification._id || Math.random().toString(36).substring(2, 11),
            timestamp: new Date()
        };

        setNotifications(prev => [newNotification, ...prev]);
        /////

        // Play sound
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(e => console.log('Error playing notification sound', e));

        // Show browser notification if supported
        // if ('Notification' in window && Notification.permission === 'granted') {
        //     new Notification('New message', {
        //         body: notification.content,
        //     });
        // }
    };

    const closeShowNewNotifications = () => {
        setShowNewNotifications(false);
    }

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
            showNewNotifications,
            addNotification,
            markAsRead,
            markAllAsRead,
            clearAllNotifications,
            clearNotification,
            closeShowNewNotifications,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};