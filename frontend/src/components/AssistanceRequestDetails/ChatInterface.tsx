import { Card } from "@/components/ui/card";
import { format } from 'date-fns';
import { IMessageDocument } from '@/interfaces/chatInterface';
import { IAssistanceRequest } from '@/interfaces/adminInterface';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import profile_pic from '../../assets/profile_pic.png';
import { LoadingSpinner } from "../LoadingSpinner";
import { EmptyChatState } from "./EmptyChatState";
import { TypingIndicator } from "./TypingIndicator";
import { ChatMessage } from "./ChatMessage";
import { MessageInput } from "./MessageInput";
import { RootState } from "@/redux/store";
import React, { useEffect, useRef, useState } from "react";
import { ObjectId } from "mongoose";

interface Volunteer {
    name?: string;
    profilePicture?: string;
}

interface ChatInterfaceProps {
    request: IAssistanceRequest | null;
    messages: IMessageDocument[];
    isLoading: boolean;
    isTyping: boolean;
    messageInput: string;
    handleSendMessage: () => Promise<void>;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    messagesEndRef?: React.RefObject<HTMLDivElement>;
    sendError?: string;
    isSending?: boolean;
}

const ChatHeader: React.FC<{ volunteer: Volunteer, isTyping: boolean }> = ({ volunteer, isTyping }) => {
    return (
        <div className="p-4 border-b flex items-center justify-between" aria-label="Chat header">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage
                        src={volunteer?.profilePicture || profile_pic}
                        alt={volunteer?.name}
                    />
                    <AvatarFallback>
                        {volunteer?.name?.charAt(0) || 'V'}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-medium text-gray-800">
                        {volunteer?.name || 'Volunteer'}
                    </h3>
                    <p className="text-xs text-gray-500" aria-live="polite">
                        {isTyping ? 'Typing...' : 'Available to chat'}
                    </p>
                </div>
            </div>
        </div>
    )
}

function useAutoScroll(dep: any, ref: React.RefObject<HTMLDivElement>) {
    useEffect(() => {
        if (ref && ref.current) {
            ref.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [dep, ref]);
}

// 6. Performance: Virtualization (simple, for demo; use react-window for large lists)
const VirtualizedMessages: React.FC<{
    messages: IMessageDocument[];
    userId: string | ObjectId;
    formatTime: (dateString: string) => string;
}> = ({ messages, userId, formatTime }) => {
    // For real virtualization, use react-window or similar
    return (
        <>
            {messages.map((message: IMessageDocument) => (
                <ChatMessage
                    key={message.id || message.createdAt.toString()}
                    message={message}
                    isOwnMessage={message.sender === userId}
                    formatTime={formatTime}
                />
            ))}
        </>
    );
};

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    request,
    messages,
    isLoading,
    isTyping,
    messageInput,
    handleSendMessage,
    handleInputChange,
    messagesEndRef,
    sendError,
    isSending
}) => {
    const userId = useSelector((state: RootState) => state.auth.userId);

    useAutoScroll(messages, messagesEndRef || useRef<HTMLDivElement>(null));

    const [localSending, setLocalSending] = useState(false);
    const handleSend = async () => {
        setLocalSending(true);
        await handleSendMessage();
        setLocalSending(false);
    };

    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        if (
            date.getDate() !== today.getDate() ||
            date.getMonth() !== today.getMonth() ||
            date.getFullYear() !== today.getFullYear()
        ) {
            return format(date, 'MMM d, h:mm a');
        }
        return format(date, 'h:mm a');
    };

    return (
        <Card className="flex flex-col h-[600px]" role="region" aria-label="Chat interface">

            <ChatHeader volunteer={request?.volunteer || {}} isTyping={isTyping} />

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" aria-live="polite" aria-label="Messages">
                {isLoading ? (
                    <LoadingSpinner />
                ) : messages.length === 0 ? (
                    <EmptyChatState volunteerName={request?.volunteer?.name || ''} />
                ) : (
                    <>
                        <VirtualizedMessages
                            messages={messages}
                            userId={userId || ''}
                            formatTime={formatMessageTime}
                        />

                        {isTyping && <TypingIndicator />}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {sendError && (
                <div className="text-red-500 text-xs px-4 py-1" role="alert">
                    {sendError}
                </div>
            )}

            <MessageInput
                value={messageInput}
                onChange={handleInputChange}
                onSend={handleSend}
                placeholder={`Message ${request?.volunteer?.name || 'Requester'}...`}
                disabled={localSending || isSending}
                aria-label="Type your message"
            />
        </Card>
    );
};