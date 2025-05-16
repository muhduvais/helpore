import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from "sonner";
import { chatService } from '@/services/chat.service';
import { IMessageDocument } from '@/interfaces/chatInterface';
import { Socket } from 'socket.io-client';
import { useNotifications } from '@/context/notificationContext';
import { IAssistanceRequest } from '@/interfaces/adminInterface';

export const useRequestChat = (
    conversationId: string | undefined,
    request: IAssistanceRequest | null
) => {
    const [messages, setMessages] = useState<IMessageDocument[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const userId = useSelector((state: any) => state.auth.userId);
    const authToken = useSelector((state: any) => state.auth.accessToken);
    const { markAllAsRead } = useNotifications();

    useEffect(() => {
        if (request?.status === 'approved' && authToken) {
            socketRef.current = chatService.connectSocket(authToken);

            chatService.setupListeners(
                socketRef.current,
                (message) => {
                    setMessages((prevMessages) => [...prevMessages, message]);
                },
                (data) => {
                    setIsTyping(data.isTyping && data.userId !== userId);
                }
            );

            return () => {
                if (socketRef.current) {
                    chatService.disconnectSocket(socketRef.current);
                }
            };
        }
    }, [request, authToken, userId]);

    useEffect(() => {
        if (conversationId && request?.status === 'approved' && socketRef.current) {
            chatService.joinConversation(socketRef.current, conversationId);
            markAllAsRead();

            const fetchMessages = async () => {
                try {
                    setIsLoadingMessages(true);
                    const response = await chatService.getConversationMessages(conversationId);

                    if (response.status === 200) {
                        setMessages(response.data.messages);
                    }
                } catch (error) {
                    console.error('Error fetching messages:', error);
                    toast.error('Failed to load messages');
                } finally {
                    setIsLoadingMessages(false);
                }
            };

            fetchMessages();

            return () => {
                if (socketRef.current) {
                    chatService.leaveConversation(socketRef.current, conversationId);
                }
            };
        }
    }, [conversationId, request]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !request?.volunteer?._id || !conversationId) return;

        try {
            await chatService.sendMessage(
                request.volunteer._id,
                messageInput,
                conversationId,
                'volunteers',
                'users'
            );
            setMessageInput('');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessageInput(e.target.value);

        if (socketRef.current && conversationId) {
            chatService.sendTypingStatus(socketRef.current, conversationId, true);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                if (socketRef.current && conversationId) {
                    chatService.sendTypingStatus(socketRef.current, conversationId, false);
                }
            }, 2000);
        }
    };

    return {
        messages,
        messageInput,
        setMessageInput,
        isLoadingMessages,
        isTyping,
        messagesEndRef,
        handleSendMessage,
        handleInputChange
    };
};