// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { meetingService } from "@/services/meeting.service";
// import { useSelector } from "react-redux";
// import { toast } from "sonner";
// import { useNavigate } from "react-router-dom";

// interface MeetingCardProps {
//     id: string;
//     title: string;
//     adminName: string;
//     participants: string[];
//     scheduledTime: string;
//     isAdmin: boolean;
// }

// export const MeetingCard: React.FC<MeetingCardProps> = ({
//     id,
//     title,
//     adminName,
//     scheduledTime,
//     participants,
//     isAdmin
// }) => {
//     const [isJoinable, setIsJoinable] = useState(false);
//     const { userId, userName } = useSelector((state: any) => state.auth);
//     const navigate = useNavigate();

//     useEffect(() => {
//         const checkMeetingJoinability = () => {
//             const meetingTime = new Date(scheduledTime);
//             const currentTime = new Date();
            
//             // Allow joining 5 minutes before scheduled time and up to meeting end
//             const isWithinJoinWindow = 
//                 meetingTime.getTime() <= currentTime.getTime() && 
//                 currentTime.getTime() < meetingTime.getTime() + 2 * 60 * 60 * 1000; // 2 hours meeting duration

//             const isParticipant = participants.includes(userId);
            
//             setIsJoinable(isWithinJoinWindow && isParticipant);
//         };

//         checkMeetingJoinability();
//         const intervalId = setInterval(checkMeetingJoinability, 60000); // Check every minute

//         return () => clearInterval(intervalId);
//     }, [scheduledTime, participants, userId]);

//     const handleJoinMeeting = async () => {
//         try {
//             // Validate user is a participant
//             if (!participants.includes(userId)) {
//                 toast.error("You are not a participant in this meeting");
//                 return;
//             }

//             // Update meeting status to active
//             await meetingService.updateMeetingStatus(id, 'active');

//             // Socket-based meeting join
//             await meetingService.joinMeeting(id, userId, userName);

//             // Navigate to meeting room
//             navigate(`/meeting/${id}`);
//         } catch (error) {
//             console.error("Error joining meeting:", error);
//             toast.error("Failed to join meeting");
//         }
//     };

//     return (
//         <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
//             <h3 className="text-lg font-semibold mb-2">{title}</h3>
//             <div className="text-sm text-gray-600 mb-4">
//                 <p>Admin: {adminName}</p>
//                 <p>Scheduled: {new Date(scheduledTime).toLocaleString()}</p>
//             </div>
            
//             {isJoinable && (
//                 <Button 
//                     onClick={handleJoinMeeting}
//                     className="mt-auto bg-[#688D48] hover:bg-[#435D2C]"
//                 >
//                     Join Meeting
//                 </Button>
//             )}
//         </div>
//     );
// };