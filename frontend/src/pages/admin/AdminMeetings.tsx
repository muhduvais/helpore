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
    Trash2,
    UserPlus,
    Video,
    XCircle,
    Search
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
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { CreateMeetingModal } from '@/components/VideoCall.tsx/CreateMeetingModal';
import { meetingService } from '@/services/meeting.service';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { adminService } from '@/services/admin.service';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { IMeeting } from '@/interfaces/meeting.interface';
import { MeetingDetailsModal } from '@/components/MeetingDetailsModal';
import { useDebounce } from 'use-debounce';

type Filter = 'all' | 'scheduled' | 'active' | 'completed' | 'cancelled';

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

    const [deleteMeetingId, setDeleteMeetingId] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const [selectedMeeting, setSelectedMeeting] = useState<IMeeting | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    // Pagination & Filter
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [totalItems, setTotalItems] = useState<number>(0);

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filter, setFilter] = useState<Filter>('all');

    const [debouncedSearch] = useDebounce(searchTerm, 300);

    useEffect(() => {
        const fetchMeetingsAndUsers = async () => {
            try {
                const meetingsResponse = await meetingService.getMeetings(currentPage, searchTerm, filter);

                if (meetingsResponse && meetingsResponse.meetings) {
                    setMeetings(meetingsResponse.meetings);
                    setTotalPages(meetingsResponse.totalPages || 0);
                    setTotalItems(meetingsResponse.totalItems || 0);
                } else {
                    setMeetings([]);
                }

                const usersResponse = await adminService.fetchUsers(1, 0, '');
                const volunteersResponse = await adminService.fetchVolunteers(1, 0, '');

                setUsers(
                    usersResponse.data?.users?.map((user: any) => ({
                        id: user._id,
                        name: user.name
                    })) || []
                );

                setVolunteers(
                    volunteersResponse.data?.volunteers?.map((volunteer: any) => ({
                        id: volunteer._id,
                        name: volunteer.name
                    })) || []
                );

                setIsLoading(false);
            } catch (error) {
                console.error('Failed to fetch meetings:', error);
                toast.error('Failed to load meetings');
                setIsLoading(false);
            }
        };

        fetchMeetingsAndUsers();
    }, [userId, currentPage, debouncedSearch, filter]);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleFilterChange = (value: string) => {
        setFilter(value as Filter);
    };

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
            }) || []);

            toast.success('Meeting cancelled!');
        } catch (error) {
            console.error('Failed to cancel meeting:', error);
            toast.error('Could not cancel the meeting!');
        } finally {
            setIsCancelDialogOpen(false);
            setCancelMeetingId(null);
        }
    };

    const handleDeleteMeeting = async () => {
        if (!deleteMeetingId) return;

        try {
            await meetingService.deleteMeeting(deleteMeetingId);

            setMeetings(meetings.filter(meeting => meeting._id !== deleteMeetingId));

            toast.success('Meeting deleted!');
        } catch (error) {
            console.error('Failed to delete meeting:', error);
            toast.error('Could not delete the meeting!');
        } finally {
            setIsDeleteDialogOpen(false);
            setDeleteMeetingId(null);
        }
    };

    const openCancelDialog = (meetingId: string) => {
        setCancelMeetingId(meetingId);
        setIsCancelDialogOpen(true);
    };

    const openDeleteDialog = (meetingId: string) => {
        setDeleteMeetingId(meetingId);
        setIsDeleteDialogOpen(true);
    };

    const openDetailsModal = (meeting: IMeeting) => {
        setSelectedMeeting(meeting);
        setIsDetailsModalOpen(true);
    };

    const handleCreateModalClose = () => {
        setIsCreateMeetingModalOpen(false);
    }

    const handleCopyLink = (meetingId: string) => {
        const meetingUrl = `${import.meta.env.VITE_BASE_URL}/admin/meetings/${meetingId}`;

        navigator.clipboard.writeText(meetingUrl)
            .then(() => toast.success("Meeting link copied!"))
            .catch(() => toast.error("Failed to copy link"));
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
                return <Badge variant="default">Completed</Badge>;
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
            <div className="flex justify-between items-center gap-x-3 mb-6">
                <h1 className="text-xl font-bold min-w-100">My Meetings</h1>
                <div className='flex items-center justify-end gap-x-3'>
                    <div className="relative w-full md:w-1/2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            type="text"
                            placeholder="Search by meeting title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-full"
                        />
                    </div>
                    <div className="w-full md:w-1/4">
                        <Select value={filter} onValueChange={handleFilterChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem className='cursor-pointer' value="all">All Meetings</SelectItem>
                                <SelectItem className='cursor-pointer' value="scheduled">Scheduled</SelectItem>
                                <SelectItem className='cursor-pointer' value="active">Active</SelectItem>
                                <SelectItem className='cursor-pointer' value="completed">Completed</SelectItem>
                                <SelectItem className='cursor-pointer' value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={() => setIsCreateMeetingModalOpen(true)}
                        className="bg-[#688D48] hover:bg-[#435D2C]"
                    >
                        <UserPlus className="mr-2" /> Schedule Meeting
                    </Button>
                </div>
            </div>

            {meetings && meetings.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center p-10">
                        <Clock className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-gray-600">No meetings found</p>
                    </CardContent>
                </Card>
            ) : (
                <div>
                    <Card className='mb-2'>
                        <CardHeader>
                            <CardTitle className={`${filter !== 'all' || searchTerm !== '' ? 'text-lg italic text-gray-800 font-normal underline' : 'text-xl'}`}>
                                {filter === 'all' && searchTerm === ''
                                    ? 'Listing All Meetings'
                                    : filter === 'all' && searchTerm !== ''
                                        ? <>Results for <span className="font-semibold">'{searchTerm}'</span></>
                                        : filter !== 'all' && searchTerm !== ''
                                            ? <>Results for <span className="font-semibold">'{searchTerm}'</span> in <span className="font-semibold">{filter}</span> meetings</>
                                            : <><span className="font-semibold">{filter[0].toUpperCase() + filter.slice(1)}</span> Meetings</>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className=''>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Scheduled Time</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                        <TableHead>Link</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {meetings && meetings.map((meeting) => (
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
                                                {meeting.status === 'scheduled' && <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className='text-red-500 hover:text-red-700'
                                                    onClick={() => openCancelDialog(meeting._id)}
                                                >
                                                    <XCircle className="mr-2 w-4 h-4 text-red-500 hover:text-red-700" /> Cancel
                                                </Button>}
                                            </TableCell>
                                            <TableCell className="">
                                                <button
                                                    onClick={() => handleCopyLink(meeting._id)}>
                                                    <Copy className="mr-2 w-4 h-4 opacity-70 hover:opacity-100 active:-scale-[80%]" />
                                                </button>
                                            </TableCell>
                                            <TableCell className="">
                                                <button
                                                    onClick={() => openDeleteDialog(meeting._id)}>
                                                    <Trash2 className="mr-2 w-4 h-4 text-red-300 hover:text-red-500" />
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {meetings && meetings.length > 0 && (
                                <div className="flex items-center justify-between mt-6">
                                    <span className="text-sm text-gray-600">
                                        Showing {Math.min((currentPage - 1) * 5 + 1, totalItems)} to {Math.min(currentPage * 5, totalItems)} of {totalItems} meetings
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={handlePrevPage}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleNextPage}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            <CreateMeetingModal
                isOpen={isCreateMeetingModalOpen}
                onClose={() => handleCreateModalClose()}
                users={users}
                volunteers={volunteers}
                currentUserId={userId}
                onSuccess={(newMeeting: IMeeting) => {
                    setMeetings((prevMeetings) => [...prevMeetings, newMeeting]);
                    toast.success('Meeting created!');
                }}
            />

            <AlertDialog open={isCancelDialogOpen || isDeleteDialogOpen} onOpenChange={isCancelDialogOpen ? setIsCancelDialogOpen : setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{isCancelDialogOpen ? 'Cancel Meeting' : 'Delete Meeting'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to {isCancelDialogOpen ? 'cancel' : 'delete'} this meeting? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>No, keep it</AlertDialogCancel>
                        <AlertDialogAction onClick={isCancelDialogOpen ? handleCancelMeeting : handleDeleteMeeting} className="bg-red-600 hover:bg-red-700">
                            Yes, {isCancelDialogOpen ? 'cancel' : 'delete'} meeting
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