
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

interface ChatInterfaceProps {
    request: IAssistanceRequest | null;
    messages: IMessageDocument[];
    isLoading: boolean;
    isTyping: boolean;
    messageInput: string;
    handleSendMessage: () => Promise<void>;
    handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    messagesEndRef?: React.RefObject<HTMLDivElement>;
}

interface IVolunteer {
    _id: string;
    name: string;
    phone: string;
    email: string;
    profilePicture: string;
}

const ChatHeader: React.FC<{ volunteer: any, isTyping: boolean }> = ({ volunteer, isTyping }) => {
    return (
        <div className="p-4 border-b flex items-center justify-between">
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
                    <p className="text-xs text-gray-500">
                        {isTyping ? 'Typing...' : 'Available to chat'}
                    </p>
                </div>
            </div>
        </div>
    )
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
    request,
    messages,
    isLoading,
    isTyping,
    messageInput,
    handleSendMessage,
    handleInputChange,
    messagesEndRef
}) => {
    const userId = useSelector((state: any) => state.auth.userId);

    const formatMessageTime = (dateString: string) => {
        return format(new Date(dateString), 'h:mm a');
    };

    return (
        <Card className="flex flex-col h-[600px]">

            <ChatHeader volunteer={request?.volunteer} isTyping={isTyping} />

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <LoadingSpinner />
                ) : messages.length === 0 ? (
                    <EmptyChatState volunteerName={request?.volunteer?.name || ''} />
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <ChatMessage
                                key={index}
                                message={message}
                                isOwnMessage={message.sender === userId}
                                formatTime={formatMessageTime}
                            />
                        ))}

                        {isTyping && <TypingIndicator />}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <MessageInput
                value={messageInput}
                onChange={handleInputChange}
                onSend={handleSendMessage}
                placeholder={`Message ${request?.volunteer?.name || 'Requester'}...`}
            />
        </Card>
    );
};