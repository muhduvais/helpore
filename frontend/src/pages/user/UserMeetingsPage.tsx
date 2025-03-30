import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    Copy,
    Info,
    List,
    Video
} from 'lucide-react';

import { meetingService } from '@/services/meeting.service';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { IMeeting } from '@/interfaces/meeting.interface';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { MeetingDetailsModal } from '@/components/MeetingDetailsModal';

const UserMeetingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { userId } = useSelector((state: any) => state.auth);

    const [meetings, setMeetings] = useState<IMeeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedMeeting, setSelectedMeeting] = useState<IMeeting | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    useEffect(() => {
        const fetchUserMeetings = async () => {
            try {
                const userMeetingsResponse = await meetingService.getUserMeetings();
                setMeetings(userMeetingsResponse.meetings);
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to fetch user meetings:', error);
                toast.error('Failed to load your meetings');
                setIsLoading(false);
            }
        };

        fetchUserMeetings();
    }, [userId]);

    const handleJoinMeeting = async (meetingId: string) => {
        try {
            navigate(`/user/meetings/${meetingId}`);
        } catch (error) {
            console.error('Failed to join meeting:', error);
            toast.error('Could not join meeting');
        }
    };

    const canJoinMeeting = (scheduledTime: string | Date, status: string) => {
        const meetingTime = new Date(scheduledTime);
        const now = new Date();
        return meetingTime <= now && status !== 'completed';
    };

    const openDetailsModal = (meeting: IMeeting) => {
        setSelectedMeeting(meeting);
        setIsDetailsModalOpen(true);
    };

    const handleCopyLink = (meetingId: string) => {
        const meetingUrl = `${import.meta.env.VITE_BASE_URL}/user/meetings/${meetingId}`;

        navigator.clipboard.writeText(meetingUrl)
            .then(() => toast.success("Meeting link copied!"))
            .catch(() => toast.error("Failed to copy link"));
    };

    const renderMeetingStatus = (status: string, scheduledTime: string | Date) => {
        switch (status) {
            case 'scheduled':
                return canJoinMeeting(scheduledTime, status)
                    ? <Badge variant="default">Ready to Join</Badge>
                    : <Badge variant="secondary">Upcoming</Badge>;
            case 'active':
                return <Badge variant="outline">In Progress</Badge>;
            case 'completed':
                return <Badge variant="destructive">Completed</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge>Unknown</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <DotLottieReact
                    src="https://lottie.host/525ff46b-0a14-4aea-965e-4b22ad6a8ce7/wGcySY4DHd.lottie"
                    loop
                    autoplay
                    style={{ width: '60px', height: '60px' }}
                />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Meetings</h1>
            </div>

            {meetings && meetings.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-10">
                        <Clock className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-600">You don't have any scheduled meetings</p>
                    </CardContent>
                </Card>
            ) : (
                <div>
                    <Card className='mb-2'>
                        <CardHeader>
                            <CardTitle className='text-xl'>Upcoming and Ongoing Meetings</CardTitle>
                        </CardHeader>
                        <CardContent className='max-h-[400px] overflow-y-auto'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Scheduled Time</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                        <TableHead>Link</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {meetings.map((meeting) => (
                                        (meeting.status === 'scheduled' || meeting.status === 'active') &&
                                        <TableRow key={meeting._id}>
                                            <TableCell>{meeting.title}</TableCell>
                                            <TableCell>
                                                {format(new Date(meeting.scheduledTime), 'PPp')}
                                            </TableCell>
                                            <TableCell>
                                                {renderMeetingStatus(meeting.status, meeting.scheduledTime)}
                                            </TableCell>
                                            <TableCell className="space-x-2">
                                                {canJoinMeeting(meeting.scheduledTime, meeting.status) ? (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleJoinMeeting(meeting._id)}
                                                    >
                                                        <Video className="mr-2 w-4 h-4 text-green-500" /> Join
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openDetailsModal(meeting)}
                                                    >
                                                        <Info className="mr-2 w-4 h-4" /> Details
                                                    </Button>
                                                )}
                                            </TableCell>
                                            <TableCell className="">
                                                <button
                                                    onClick={() => handleCopyLink(meeting._id)}>
                                                    <Copy className="mr-2 w-4 h-4 opacity-70 hover:opacity-100 active:-scale-[80%]" />
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className='text-xl'>Completed and Cancelled Meetings</CardTitle>
                        </CardHeader>
                        <CardContent className='max-h-[400px] overflow-y-auto'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Scheduled Time</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {meetings.map((meeting) => (
                                        (meeting.status === 'completed' || meeting.status === 'cancelled') &&
                                        <TableRow key={meeting._id}>
                                            <TableCell>{meeting.title}</TableCell>
                                            <TableCell>
                                                {format(new Date(meeting.scheduledTime), 'PPp')}
                                            </TableCell>
                                            <TableCell>
                                                {renderMeetingStatus(meeting.status, meeting.scheduledTime)}
                                            </TableCell>
                                            <TableCell className="space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openDetailsModal(meeting)}
                                                >
                                                    <Info className="mr-2 w-4 h-4" /> Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            <MeetingDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                meeting={selectedMeeting}
                users={[]}
                volunteers={[]}
            />
        </div>
    );
};

export default UserMeetingsPage;