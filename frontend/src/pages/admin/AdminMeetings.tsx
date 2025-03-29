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
    UserPlus,
    Video
} from 'lucide-react';

import { CreateMeetingModal } from '@/components/VideoCall.tsx/CreateMeetingModal';
import { meetingService } from '@/services/meeting.service';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { adminService } from '@/services/admin.service';
import { IUserDocument } from '@/interfaces/userInterface';

const MeetingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { userId } = useSelector((state: any) => state.auth);

    const [meetings, setMeetings] = useState<any[]>([]);
    const [users, setUsers] = useState<Array<IUserDocument>>([]);
    const [volunteers, setVolunteers] = useState<Array<IUserDocument>>([]);
    const [isCreateMeetingModalOpen, setIsCreateMeetingModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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

    const canJoinMeeting = (scheduledTime: string) => {
        const meetingTime = new Date(scheduledTime);
        const now = new Date();
        return meetingTime <= now;
    };

    const renderMeetingStatus = (status: string, scheduledTime: string) => {
        switch (status) {
            case 'scheduled':
                return canJoinMeeting(scheduledTime)
                    ? <Badge variant="default">Ready to Join</Badge>
                    : <Badge variant="secondary">Upcoming</Badge>;
            case 'active':
                return <Badge variant="outline">In Progress</Badge>;
            case 'completed':
                return <Badge variant="destructive">Completed</Badge>;
            default:
                return <Badge>Unknown</Badge>;
        }
    };

    if (isLoading) {
        return <div>Loading meetings...</div>;
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
                <Card>
                    <CardHeader>
                        <CardTitle>Upcoming and Recent Meetings</CardTitle>
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
                                    <TableRow key={meeting._id}>
                                        <TableCell>{meeting.title}</TableCell>
                                        <TableCell>
                                            {format(new Date(meeting.scheduledTime), 'PPp')}
                                        </TableCell>
                                        <TableCell>
                                            {renderMeetingStatus(meeting.status, meeting.scheduledTime)}
                                        </TableCell>
                                        <TableCell>
                                            {(canJoinMeeting(meeting.scheduledTime) || meeting.status === 'active') && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleJoinMeeting(meeting._id)}
                                                >
                                                    <Video className="mr-2 w-4 h-4" /> Join
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            <CreateMeetingModal
                isOpen={isCreateMeetingModalOpen}
                onClose={() => setIsCreateMeetingModalOpen(false)}
                users={users}
                volunteers={volunteers}
                currentUserId={userId}
                onSuccess={() => {
                    window.location.reload();
                    toast.success('Meeting created!');
                }}
            />
        </div>
    );
};

export default MeetingsPage;