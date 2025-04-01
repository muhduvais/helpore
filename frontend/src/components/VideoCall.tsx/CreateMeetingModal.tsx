import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Calendar } from "../ui/calendar";
import { meetingService } from "@/services/meeting.service";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { IMeeting } from "@/interfaces/meeting.interface";

enum ParticipantSelectionMode {
    INDIVIDUAL = "individual",
    ALL_USERS = "all_users",
    ALL_VOLUNTEERS = "all_volunteers"
}

interface CreateMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: Array<{ id: string, name: string }>;
    volunteers: Array<{ id: string, name: string }>;
    currentUserId: string;
    onSuccess: (newMeeting: IMeeting) => void;
}

export const CreateMeetingModal = ({
    isOpen,
    onClose,
    users,
    volunteers,
    currentUserId,
    onSuccess
}: CreateMeetingModalProps) => {
    const [title, setTitle] = useState("");
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [time, setTime] = useState("12:00");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [selectionMode, setSelectionMode] = useState<ParticipantSelectionMode>(ParticipantSelectionMode.INDIVIDUAL);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        switch (selectionMode) {
            case ParticipantSelectionMode.ALL_USERS:
                setSelectedParticipants(users.map(user => user.id));
                break;
            case ParticipantSelectionMode.ALL_VOLUNTEERS:
                setSelectedParticipants(volunteers.map(volunteer => volunteer.id));
                break;
            case ParticipantSelectionMode.INDIVIDUAL:
                setSelectedParticipants([]);
                break;
        }
    }, [selectionMode, users, volunteers]);

    const handleCreateMeeting = async () => {
        let valid = true;

        function validateTitle(title: string) {
            return /^[A-Za-z0-9\s.,'-]{3,50}$/.test(title);
        }

        if (!title.trim()) {
            setErrorMessage('Please enter the title!');
            valid = false;
        } else if (!validateTitle(title)) {
            setErrorMessage('Please enter a valid title!');
            valid = false;
        }

        if (!date) return false;

        if (!valid) return;

        setIsLoading(true);
        try {
            const dateTime = new Date(date);
            const [hours, minutes] = time.split(":").map(Number);
            dateTime.setHours(hours, minutes);

            const createResponse = await meetingService.createMeeting(
                currentUserId,
                title,
                selectedParticipants,
                dateTime.toISOString()
            );

            if (createResponse.status === 201) {
                toast.success('Meeting created!');
            }

            onSuccess(createResponse.meeting);
            setTitle('');
            setSelectedParticipants([]);
            setDate(new Date());
            setTime('12:00');
            setSelectionMode(ParticipantSelectionMode.INDIVIDUAL);
            onClose();
        } catch (error) {
            console.error("Failed to create meeting:", error);
            toast.error('Failed to create meeting!');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle individual participant selection
    const handleParticipantSelect = (selectedId: string) => {
        setSelectedParticipants(prev =>
            prev.includes(selectedId)
                ? prev.filter(id => id !== selectedId)
                : [...prev, selectedId]
        );
    };

    const handleCancelClick = () => {
        setTitle('');
        setSelectedParticipants([]);
        setDate(new Date());
        setTime('12:00');
        setSelectionMode(ParticipantSelectionMode.INDIVIDUAL);
        setErrorMessage('');
        onClose();
    }

    // Participant selection
    const renderParticipantSelection = () => {
        // Selection toggle
        const renderSelectionModeButtons = () => (
            <div className="flex gap-2 mb-4">
                <Button
                    variant={selectionMode === ParticipantSelectionMode.INDIVIDUAL ? "default" : "outline"}
                    onClick={() => setSelectionMode(ParticipantSelectionMode.INDIVIDUAL)}
                >
                    Individual
                </Button>
                <Button
                    variant={selectionMode === ParticipantSelectionMode.ALL_USERS ? "default" : "outline"}
                    onClick={() => setSelectionMode(ParticipantSelectionMode.ALL_USERS)}
                >
                    All Users
                </Button>
                <Button
                    variant={selectionMode === ParticipantSelectionMode.ALL_VOLUNTEERS ? "default" : "outline"}
                    onClick={() => setSelectionMode(ParticipantSelectionMode.ALL_VOLUNTEERS)}
                >
                    All Volunteers
                </Button>
            </div>
        );

        // Individual selection
        if (selectionMode === ParticipantSelectionMode.INDIVIDUAL) {
            return (
                <>
                    {renderSelectionModeButtons()}
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between"
                            >
                                Select participants...
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                            <Command>
                                <CommandInput placeholder="Search participants..." />
                                <CommandList>
                                    <CommandEmpty>No participants found.</CommandEmpty>
                                    <CommandGroup title="Users">
                                        {users.map((user) => (
                                            <CommandItem
                                                key={`user-${user.id}`}
                                                value={user.id}
                                                onSelect={() => handleParticipantSelect(user.id)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedParticipants.includes(user.id) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {user.name} (User)
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                    <CommandGroup title="Volunteers">
                                        {volunteers.map((volunteer) => (
                                            <CommandItem
                                                key={`volunteer-${volunteer.id}`}
                                                value={volunteer.id}
                                                onSelect={() => handleParticipantSelect(volunteer.id)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedParticipants.includes(volunteer.id) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {volunteer.name} (Volunteer)
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                    {selectedParticipants.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedParticipants.map((participantId) => {
                                const user = users.find(u => u.id === participantId);
                                const volunteer = volunteers.find(v => v.id === participantId);
                                const name = user?.name || volunteer?.name || 'Unknown';
                                const type = user ? 'User' : 'Volunteer';

                                return (
                                    <div
                                        key={participantId}
                                        className="bg-[#688D48] text-white px-2 py-1 rounded-md text-xs flex items-center gap-1"
                                    >
                                        {name} ({type})
                                        <button
                                            onClick={() => handleParticipantSelect(participantId)}
                                            className="ml-1 hover:text-gray-200"
                                        >
                                            ×
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            );
        }

        // All Users or All Volunteers
        return (
            <>
                {renderSelectionModeButtons()}
                <div className="text-sm text-gray-600">
                    {selectionMode === ParticipantSelectionMode.ALL_USERS
                        ? `${selectedParticipants.length} users selected`
                        : `${selectedParticipants.length} volunteers selected`}
                </div>
            </>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Schedule New Meeting</DialogTitle>
                    <DialogDescription>
                        Create a new meeting and invite participants
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <p className='text-red-500 w-full text-end text-sm'>{errorMessage}</p>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Title
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">
                            Participants
                        </Label>
                        <div className="col-span-3">
                            {renderParticipantSelection()}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">
                            Date
                        </Label>
                        <div className="col-span-3">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="border rounded-md p-2"
                                disabled={(date) => date < new Date()}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="time" className="text-right">
                            Time
                        </Label>
                        <Input
                            id="time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelClick}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateMeeting}
                        className="bg-[#688D48] hover:bg-[#435D2C]"
                        disabled={isLoading || !title || !date || selectedParticipants.length === 0}
                    >
                        {isLoading ? "Creating..." : "Create Meeting"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};