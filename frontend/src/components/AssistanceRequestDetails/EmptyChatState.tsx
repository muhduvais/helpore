import { MessageSquare } from "lucide-react"

export const EmptyChatState: React.FC<{ volunteerName: string }> = ({ volunteerName }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mb-2" />
            <h4 className="text-lg font-medium text-gray-600">No messages yet</h4>
            <p className="text-sm text-gray-500">
                Start a conversation with {volunteerName || 'your requester'}
            </p>
        </div>
    )
}