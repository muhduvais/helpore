import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Users, 
  ScreenShare 
} from 'lucide-react';

import { meetingService } from '@/services/meeting.service';
import { userService } from '@/services/user.service';

const MeetingRoom: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const meetingContainerRef = useRef<HTMLDivElement>(null);

  const [meeting, setMeeting] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Local stream controls
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Participants tracking
  const [participants, setParticipants] = useState<string[]>([]);

  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        // Fetch user details
        const userResponse = await userService.fetchUserDetails();
        setCurrentUser(userResponse.data.user);

        // Fetch meeting details
        const meetingDetails = await meetingService.fetchMeetingDetails(meetingId || '');
        setMeeting(meetingDetails);
        setParticipants(meetingDetails.participants);

        // Generate Zego token
        const token = await meetingService.generateZegoToken(meetingId || '');

        // Initialize Zego video conference
        if (meetingContainerRef.current) {
          const zegoInstance = ZegoUIKitPrebuilt.create(token);
          
          const roomConfig = {
            container: meetingContainerRef.current,
            scenario: {
              mode: ZegoUIKitPrebuilt.GroupCall,
            },
            turnOnMicrophoneWhenJoining: true,
            turnOnCameraWhenJoining: true,
            showRemoteAudioVolume: true,
            showScreenSharingButton: true,
            
            // Callbacks
            onJoinRoom: () => {
              console.log('Joined meeting room');
              toast.success('Successfully joined the meeting');
            },
            onLeaveRoom: () => {
              console.log('Left meeting room');
              navigate('/meetings');
            },
            onError: (error: any) => {
              console.error('Meeting room error:', error);
              toast.error('An error occurred in the meeting');
            },
            
            // Participant management
            onUserJoin: (userList: any[]) => {
              const newParticipants = userList.map(user => user.userName);
              setParticipants(prev => [...new Set([...prev, ...newParticipants])]);
            },
            onUserLeave: (userList: any[]) => {
              const remainingParticipants = userList.map(user => user.userName);
              setParticipants(remainingParticipants);
            }
          };

          zegoInstance.joinRoom(roomConfig);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Meeting initialization error:', error);
        toast.error('Failed to join meeting');
        navigate('/meetings');
      }
    };

    initializeMeeting();
  }, [meetingId, navigate]);

  const handleToggleMicrophone = () => {
    setIsMicrophoneOn(prev => !prev);
    // Additional Zego SDK microphone toggle logic can be added here
  };

  const handleToggleCamera = () => {
    setIsCameraOn(prev => !prev);
    // Additional Zego SDK camera toggle logic can be added here
  };

  const handleScreenShare = () => {
    setIsScreenSharing(prev => !prev);
    // Additional Zego SDK screen share logic can be added here
  };

  const handleEndMeeting = async () => {
    try {
      await meetingService.updateMeetingStatus(meetingId || '', 'completed');
      navigate('/meetings');
    } catch (error) {
      toast.error('Error ending meeting');
    }
  };

  if (isLoading) {
    return <div>Loading meeting...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col">
          {/* Video Conference Container */}
          <div 
            ref={meetingContainerRef} 
            className="flex-1 bg-gray-100 rounded-lg"
          />

          {/* Meeting Controls */}
          <div className="flex justify-center items-center space-x-4 mt-4 p-4 bg-gray-50 rounded-b-lg">
            {/* Microphone Toggle */}
            <Button 
              variant={isMicrophoneOn ? 'default' : 'destructive'}
              size="icon" 
              onClick={handleToggleMicrophone}
            >
              {isMicrophoneOn ? <Mic /> : <MicOff />}
            </Button>

            {/* Camera Toggle */}
            <Button 
              variant={isCameraOn ? 'default' : 'destructive'}
              size="icon" 
              onClick={handleToggleCamera}
            >
              {isCameraOn ? <Video /> : <VideoOff />}
            </Button>

            {/* Screen Share */}
            <Button 
              variant={isScreenSharing ? 'default' : 'outline'}
              size="icon" 
              onClick={handleScreenShare}
            >
              <ScreenShare />
            </Button>

            {/* Participants */}
            <Button 
              variant="outline" 
              size="icon"
            >
              <Users />
              <span className="ml-2 text-sm">{participants.length}</span>
            </Button>

            {/* End Meeting */}
            <Button 
              variant="destructive" 
              size="icon" 
              onClick={handleEndMeeting}
            >
              <PhoneOff />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingRoom;