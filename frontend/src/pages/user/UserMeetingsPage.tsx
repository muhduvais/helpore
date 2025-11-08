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
    Search,
    Video
} from 'lucide-react';

import loading_logo from "../../assets/Logo-black-short.png"
import { meetingService } from '@/services/meeting.service';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { IMeeting } from '@/interfaces/meeting.interface';
import { MeetingDetailsModal } from '@/components/MeetingDetailsModal';
import { useDebounce } from 'use-debounce';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Filter = 'all' | 'scheduled' | 'active' | 'completed' | 'cancelled';

const UserMeetingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { userId } = useSelector((state: any) => state.auth);

    const [meetings, setMeetings] = useState<IMeeting[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
        const fetchUserMeetings = async () => {
            try {
                const userMeetingsResponse = await meetingService.getUserMeetings(currentPage, searchTerm, filter);
                setMeetings(userMeetingsResponse.meetings);
                setTotalPages(userMeetingsResponse.totalPages);
                setTotalItems(userMeetingsResponse.totalItems);
                setIsLoading(false);
            } catch (error) {
                console.error('Failed to fetch user meetings:', error);
                toast.error('Failed to load your meetings');
                setIsLoading(false);
            }
        };

        fetchUserMeetings();
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
            navigate(`/user/meetings/${meetingId}`);
        } catch (error) {
            console.error('Failed to join meeting:', error);
            toast.error('Could not join meeting');
        }
    };

    const canJoinMeeting = (scheduledTime: string | Date, status: string) => {
        const meetingTime = new Date(scheduledTime);
        const now = new Date();
        return meetingTime <= now && status !== 'completed' && status !== 'cancelled';
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
                return <Badge variant="completed">Completed</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge>Unknown</Badge>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-72">
                <img src={loading_logo} alt="Loading..." className='flip-animation' />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Meetings</h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        type="text"
                        placeholder="Search by meeting title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full"
                    />
                </div>
                <div className="w-full sm:w-48">
                    <Select value={filter} onValueChange={handleFilterChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem className="cursor-pointer" value="all">All Meetings</SelectItem>
                            <SelectItem className="cursor-pointer" value="scheduled">Scheduled</SelectItem>
                            <SelectItem className="cursor-pointer" value="active">Active</SelectItem>
                            <SelectItem className="cursor-pointer" value="completed">Completed</SelectItem>
                            <SelectItem className="cursor-pointer" value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
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
                        <CardContent>
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
                                        <TableRow key={meeting.id}>
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
                                                        onClick={() => handleJoinMeeting(meeting.id)}
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
                                                    onClick={() => handleCopyLink(meeting.id)}>
                                                    <Copy className="mr-2 w-4 h-4 opacity-70 hover:opacity-100 active:-scale-[80%]" />
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Pagination */}
                    {meetings.length > 0 && (
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