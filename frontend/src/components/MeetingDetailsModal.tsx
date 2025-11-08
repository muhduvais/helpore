import { format } from 'date-fns';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { IMeeting } from '@/interfaces/meeting.interface';
import {
    Calendar,
    Clock,
    Users,
    User,
    CheckCircle2,
    XCircle,
    CalendarClock,
    Copy,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

interface MeetingDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    meeting: IMeeting | null;
    users?: Array<{ id: string, name: string }>;
    volunteers?: Array<{ id: string, name: string }>;
}

export const MeetingDetailsModal: React.FC<MeetingDetailsModalProps> = ({
    isOpen,
    onClose,
    meeting,
    users = [],
    volunteers = []
}: MeetingDetailsModalProps) => {

    const { role } = useSelector((state: any) => state.auth);

    if (!meeting) return null;

    const allParticipants = [...users, ...volunteers];

    const hasParticipantData = users.length > 0 || volunteers.length > 0;

    const participantInfo = meeting.participants.map((participantId: string) => {
        if (hasParticipantData) {
            const participant = allParticipants.find(p => p.id === participantId.toString());
            return participant ? participant.name : `Unknown (ID: ${participantId})`;
        }
    });

    const handleCopyLink = (meetingId: string) => {
        const meetingUrl = `${import.meta.env.VITE_BASE_URL}/${role}/meetings/${meetingId}`;

        navigator.clipboard.writeText(meetingUrl)
            .then(() => toast.success("Meeting link copied!"))
            .catch(() => toast.error("Failed to copy link"));
    };

    // Helper function to render status badge
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case 'scheduled':
                return <Badge variant="secondary">Scheduled</Badge>;
            case 'active':
                return <Badge variant="outline">In Progress</Badge>;
            case 'completed':
                return <Badge variant="completed">Completed</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge>Unknown</Badge>;
        }
    };

    // Helper function to get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'scheduled':
                return <CalendarClock className="w-5 h-5 text-gray-500" />;
            case 'active':
                return <Clock className="w-5 h-5 text-blue-500" />;
            case 'completed':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'cancelled':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {getStatusIcon(meeting.status)}
                        {meeting.title}
                    </DialogTitle>
                    <DialogDescription>
                        Meeting details and information
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className='flex items-center gap-2'>
                            {renderStatusBadge(meeting.status)}
                            {meeting.status === 'cancelled' &&
                                <p className="text-[13px] text-red-500">This meeting has been cancelled.</p>
                            }
                        </div>
                        <div className='flex items-center gap-[3px] cursor-pointer group'
                            onClick={() => handleCopyLink(meeting.id)}>
                            <Copy className="w-4 h-4 opacity-70 hover:opacity-100 group-active:scale-[80%] transition-transform duration-150" />
                            <span className='text-xs'>Copy Link</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">
                                Scheduled for: {format(new Date(meeting.scheduledTime), 'PPP')}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">
                                Time: {format(new Date(meeting.scheduledTime), 'p')}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">
                                {hasParticipantData ? (
                                    <>Created by: {users.find(u => u.id === meeting.adminId)?.name || `Admin ID: ${meeting.adminId}`}</>
                                ) : (
                                    <>{role === 'admin' ? `Admin ID: ${meeting.adminId}` : 'Host: Admin'}</>
                                )}
                            </span>
                        </div>

                        <div className="flex items-start gap-2">
                            <Users className="w-4 h-4 text-gray-500 mt-1" />
                            <div className="text-sm">
                                <div>Participants:</div>
                                {(participantInfo.length > 0 && role === 'admin') ? (
                                    (<ul className={`list-disc list-inside mt-1 pl-2 w-72 ${participantInfo.length > 5 ? 'max-h-72 overflow-y-auto' : ''}`}>
                                        {participantInfo.map((info, index) => (
                                            <li key={index} className='text-gray-700'>{info}</li>
                                        ))}
                                    </ul>)
                                ) : (
                                    <span className="text-gray-500 ml-2">{role === 'admin' ? 'No participants' : participantInfo.length + ' ' + 'Participants'}</span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">
                                Created on: {format(new Date(meeting.createdAt), 'PPp')}
                            </span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};