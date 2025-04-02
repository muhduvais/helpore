import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserPlus, Search } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { adminService } from "@/services/admin.service";
import profile_pic from "../assets/profile_pic.png";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

interface Volunteer {
    _id: string;
    name: string;
    email: string;
    phone: string;
    tasks: number;
    profilePicture?: string;
    isActive: boolean;
    volunteerType?: "medical" | "eldercare" | "maintenance" | "transportation" | "general";
}

interface AssignVolunteerModalProps {
    requestId: string;
    onAssign: () => void;
}

interface VolunteersResponse {
    data: {
        volunteers: Volunteer[];
        totalVolunteers: Number;
    };
    status: number;
}

const AssignVolunteerModal: React.FC<AssignVolunteerModalProps> = ({ requestId, onAssign }) => {
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [showAvailableOnly, setShowAvailableOnly] = useState<boolean>(true);
    const [page, setPage] = useState<number>(1);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [ref, inView] = useInView();
    const [debouncedSearchTerm] = useDebounce(searchQuery, 500);

    const fetchVolunteers = async (pageNum: number = 1, search: string = "", reset = false): Promise<void> => {
        try {
            setIsLoading(true);
            const response: VolunteersResponse = await adminService.fetchVolunteersList(pageNum, search, showAvailableOnly);

            if (reset) {
                setVolunteers(response.data.volunteers);
            } else {
                setVolunteers((prev) => [
                    ...prev.filter((v) => !response.data.volunteers.some((newV) => newV._id === v._id)),
                    ...response.data.volunteers,
                ]);
            }

            setHasMore(response.data.volunteers.length > 0);
        } catch (error) {
            toast.error("Failed to fetch volunteers");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (inView && hasMore && !isLoading) {
            fetchVolunteers(page, debouncedSearchTerm);
            setPage((prev) => prev + 1);
        }
    }, [inView, hasMore, isLoading]);

    useEffect(() => {
        setPage(1);
        fetchVolunteers(1, debouncedSearchTerm, true);
    }, [debouncedSearchTerm, showAvailableOnly]);

    const handleAssign = async (volunteerId: string): Promise<void> => {
        try {
            setIsLoading(true);
            await adminService.assignVolunteer(requestId, volunteerId);
            toast.success("Volunteer assigned successfully");
            onAssign();
        } catch (error: any) {
            toast.error(error.response.data.message || "Failed to assign volunteer");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="border-[#688D48] text-[#688D48] hover:bg-[#688D48] hover:text-white w-full sm:w-auto"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Volunteer
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-3xl mx-auto">
                <DialogHeader>
                    <DialogTitle>Assign Volunteer</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search volunteers..."
                                className="pl-8 w-full"
                                value={searchQuery}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            className={`${showAvailableOnly ? "bg-[#688D48] text-white" : ""} w-full sm:w-auto`}
                            onClick={() => setShowAvailableOnly(!showAvailableOnly)}
                        >
                            {showAvailableOnly ? "Show all" : "Available Only"}
                        </Button>
                    </div>

                    <ScrollArea className="h-[60vh] sm:h-[400px] rounded-md border p-2 sm:p-4">
                        <div className="space-y-4">
                            {volunteers.map((volunteer: Volunteer) => (
                                <div
                                    key={volunteer._id}
                                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow gap-4"
                                >
                                    <div className="flex items-center gap-4 w-full sm:w-auto">
                                        <div className="relative">
                                            <img
                                                src={volunteer.profilePicture || profile_pic}
                                                alt={volunteer.name}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                            <Badge
                                                variant="outline"
                                                className={`absolute -top-2 -right-2 ${volunteer.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                    } text-xs`}
                                            >
                                                {volunteer.isActive ? "Available" : "Busy"}
                                            </Badge>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">{volunteer.name}</div>
                                            <div className="text-sm text-gray-500">{volunteer.email}</div>
                                            <div className="text-sm text-gray-500">{volunteer.phone}</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                                        <div className="text-center sm:text-left w-full sm:w-auto">
                                            <div className={`${volunteer.tasks === 5 ? "text-red-500 opacity-70 text-sm" : "font-semibold"
                                                }`}>
                                                {volunteer.tasks === 5 ? "Tasks limit Reached" : "Tasks"}
                                            </div>
                                            <div className="text-sm text-gray-500">Tasks on hand: {volunteer.tasks}</div>
                                        </div>
                                        <Button
                                            onClick={() => handleAssign(volunteer._id)}
                                            disabled={!volunteer.isActive || volunteer.tasks === 5}
                                            variant="outline"
                                            className="border-[#688D48] text-[#688D48] hover:bg-[#688D48] hover:text-white disabled:opacity-50 w-full sm:w-auto"
                                        >
                                            Assign
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <div ref={ref} />
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AssignVolunteerModal;