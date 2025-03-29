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
    Info,
    List,
    UserPlus,
    Video,
    XCircle
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";

import { CreateMeetingModal } from '@/components/VideoCall.tsx/CreateMeetingModal';
import { meetingService } from '@/services/meeting.service';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { adminService } from '@/services/admin.service';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { IMeeting } from '@/interfaces/meeting.interface';
import { MeetingDetailsModal } from '@/components/MeetingDetailsModal';

const MeetingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { userId } = useSelector((state: any) => state.auth);

    const [meetings, setMeetings] = useState<IMeeting[]>([]);
    const [users, setUsers] = useState<Array<{ id: string, name: string }>>([]);
    const [volunteers, setVolunteers] = useState<Array<{ id: string, name: string }>>([]);
    const [isCreateMeetingModalOpen, setIsCreateMeetingModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [cancelMeetingId, setCancelMeetingId] = useState<string | null>(null);
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

    const [selectedMeeting, setSelectedMeeting] = useState<IMeeting | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    useEffect(() => {
        const fetchMeetingsAndUsers = async () => {
            try {
                const meetingsResponse = await meetingService.getMeetings();

                const filteredMeetings = meetingsResponse.filter((meeting: any) =>
                    meeting.adminId === userId ||
                    meeting.participants.includes(userId)
                );

                setMeetings(filteredMeetings);

                const usersResponse = await adminService.fetchUsers(1, 0, '');
                const volunteersResponse = await adminService.fetchVolunteers(1, 0, '');

                setUsers(
                    usersResponse.data.users.map((user: any) => ({
                        id: user._id,
                        name: user.name
                    }))
                );

                setVolunteers(
                    volunteersResponse.data.volunteers.map((volunteer: any) => ({
                        id: volunteer._id,
                        name: volunteer.name
                    }))
                );

                setIsLoading(false);
            } catch (error) {
                console.error('Failed to fetch meetings:', error);
                toast.error('Failed to load meetings');
                setIsLoading(false);
            }
        };

        fetchMeetingsAndUsers();
    }, [userId]);

    const handleJoinMeeting = async (meetingId: string) => {
        try {
            await meetingService.updateMeetingStatus(meetingId, 'active');

            navigate(`/admin/meetings/${meetingId}`);
        } catch (error) {
            console.error('Failed to join meeting:', error);
            toast.error('Could not join meeting');
        }
    };

    const handleCancelMeeting = async () => {
        if (!cancelMeetingId) return;

        try {
            await meetingService.updateMeetingStatus(cancelMeetingId, 'cancelled');

            setMeetings(meetings.map(meeting => {
                if (meeting._id === cancelMeetingId) {
                    const updatedMeeting = meeting;
                    updatedMeeting.status = 'cancelled';
                    return updatedMeeting;
                }
                return meeting;
            }));

            toast.success('Meeting cancelled!');
        } catch (error) {
            console.error('Failed to cancel meeting:', error);
            toast.error('Could not cancel the meeting!');
        } finally {
            setIsCancelDialogOpen(false);
            setCancelMeetingId(null);
        }
    };

    const openCancelDialog = (meetingId: string) => {
        setCancelMeetingId(meetingId);
        setIsCancelDialogOpen(true);
    };

    const openDetailsModal = (meeting: IMeeting) => {
        setSelectedMeeting(meeting);
        setIsDetailsModalOpen(true);
    };

    const canJoinMeeting = (scheduledTime: string | Date, status: string) => {
        const meetingTime = new Date(scheduledTime);
        const now = new Date();
        return meetingTime <= now && status !== 'completed' && status !== 'cancelled';
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
                <Button
                    onClick={() => setIsCreateMeetingModalOpen(true)}
                    className="bg-[#688D48] hover:bg-[#435D2C]"
                >
                    <UserPlus className="mr-2" /> Schedule Meeting
                </Button>
            </div>

            {meetings.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-10">
                        <Clock className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-600">No meetings scheduled</p>
                    </CardContent>
                </Card>
            ) : (
                <div>
                    <Card className='mb-2'>
                        <CardHeader>
                            <CardTitle className='text-xl'>Upcoming and Ongoing Meetings</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                                                {canJoinMeeting(meeting.scheduledTime, meeting.status) && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleJoinMeeting(meeting._id)}
                                                    >
                                                        <Video className="mr-2 w-4 h-4" /> Join
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className='text-red-500 hover:text-red-700'
                                                    onClick={() => openCancelDialog(meeting._id)}
                                                >
                                                    <XCircle className="mr-2 w-4 h-4 text-red-500 hover:text-red-700" /> Cancel
                                                </Button>
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
                        <CardContent>
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

            <CreateMeetingModal
                isOpen={isCreateMeetingModalOpen}
                onClose={() => setIsCreateMeetingModalOpen(false)}
                users={users}
                volunteers={volunteers}
                currentUserId={userId}
                onSuccess={(newMeeting: IMeeting) => {
                    setMeetings((prevMeetings) => [...prevMeetings, newMeeting]);
                    toast.success('Meeting created!');
                }}
            />

            <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Meeting</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this meeting? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>No, keep it</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelMeeting} className="bg-red-600 hover:bg-red-700">
                            Yes, cancel meeting
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <MeetingDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                meeting={selectedMeeting}
                users={users}
                volunteers={volunteers}
            />
        </div>
    );
};

export default MeetingsPage;