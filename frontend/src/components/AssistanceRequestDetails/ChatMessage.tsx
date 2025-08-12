import { IMessageDocument } from "@/interfaces/chatInterface"

export const ChatMessage: React.FC<{
    key: string | number,
    message: IMessageDocument,
    isOwnMessage: boolean,
    formatTime: any
}> = ({
    key,
    message,
    isOwnMessage,
    formatTime
}) => {
        return (
            <>
                <div
                    key={key}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`rounded-2xl px-4 py-2 max-w-[80%] ${isOwnMessage

                            ? 'bg-[#688D48] text-white'
                            : 'bg-gray-100 text-gray-800'
                            }`}
                    >
                        <p>{message.content}</p>
                        <div className="flex justify-between items-center mt-2">
                            <div className={`text-xs mt-1 ${isOwnMessage ? 'text-gray-200' : 'text-gray-500'
                                }`}>
                                {formatTime(message.createdAt.toString())}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }