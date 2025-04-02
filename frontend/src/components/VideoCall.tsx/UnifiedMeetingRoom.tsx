import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

import { meetingService } from '@/services/meeting.service';
import { userService } from '@/services/user.service';
import { volunteerService } from '@/services/volunteer.service';

interface MeetingRoomProps {
  userType: 'admin' | 'user' | 'volunteer';
}

const UnifiedMeetingRoom: React.FC<MeetingRoomProps> = ({ userType }) => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const meetingContainerRef = useRef<HTMLDivElement>(null);

  const [meeting, setMeeting] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);

  const volunteerId = useSelector((state: any) => state.auth?.userId);

  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        let user;
        
        if (userType === 'admin') {
          const userResponse = await userService.fetchUserDetails();
          user = userResponse.data.user;
        } else if (userType === 'user') {
          const userResponse = await userService.fetchUserDetails();
          user = userResponse.data.user;
        } else if (userType === 'volunteer') {
          const volunteerResponse = await volunteerService.fetchVolunteerDetails(volunteerId);
          user = volunteerResponse.data.volunteer;
        }

        if (userType !== 'admin') {
          const meetingDetails = await meetingService.fetchMeetingDetails(meetingId || '');
          setMeeting(meetingDetails);

          // Authorization for non-admin users
          const isParticipant = meetingDetails.participants.includes(user._id);
          if (!isParticipant) {
            setIsAuthorized(false);
            toast.error("You are not authorized to join this meeting");
            setTimeout(() => navigate(`/${userType}/meetings`), 3000);
            return;
          }
        }

        // Token generation for admin
        if (userType === 'admin') {
          const tokenResponse = await meetingService.generateZegoToken(meetingId || '');
          const token = tokenResponse.data.token;

          if (!token) {
            console.error('Failed to generate token');
            toast.error('Meeting token generation failed');
            return;
          }
        }

        // Zego credentials
        const appId = parseInt(import.meta.env.VITE_ZEGO_APP_ID || '0');
        const appSign = import.meta.env.VITE_ZEGO_APP_SIGN || '';

        if (!appId || !appSign) {
          console.error('Zego credentials are missing or invalid');
          toast.error('Video conference configuration is incomplete');
          return;
        }

        // Kit token generation
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appId,
          appSign,
          meetingId || '',
          user._id || 'guest',
          user.name || 'Guest User'
        );

        // Zego video conference initialization
        if (meetingContainerRef.current) {
          const zegoInstance = ZegoUIKitPrebuilt.create(kitToken);

          if (!zegoInstance) {
            console.error('Failed to create Zego instance');
            toast.error('Failed to initialize video conference');
            return;
          }

          // Role based room configuration
          const roomConfig: any = {
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
            onLeaveRoom: async () => {
              console.log('Left meeting room');
              
              // Admin: update meeting status
              if (userType === 'admin') {
                try {
                  await meetingService.updateMeetingStatus(meetingId || '', 'completed');
                  console.log('Meeting status updated to completed!');
                } catch (error) {
                  console.error('Failed to update meeting status:', error);
                }
              }
              
              navigate(`/${userType}/meetings`);
              window.location.reload();
            },
            onError: (error: any) => {
              console.error('Meeting room error:', error);
              toast.error('An error occurred in the meeting');
            },
          };

          // Non-admin restrictions
          if (userType !== 'admin') {
            roomConfig.showTurnOffRemoteCameraButton = false;
            roomConfig.showTurnOffRemoteMicrophoneButton = false;
            roomConfig.showRemoveUserButton = false;
          }

          zegoInstance.joinRoom(roomConfig);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Meeting initialization error:', error);
        toast.error('Failed to join meeting');
        navigate(`/${userType}/meetings`);
      }
    };

    if (meetingId) {
      initializeMeeting();
    }

    return () => {
      if (meetingContainerRef.current) {
        meetingContainerRef.current.innerHTML = '';
      }
    };
  }, [meetingId, navigate, userType, volunteerId]);

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-semibold mb-4">Unauthorized Access</h2>
        <p className="mb-4">You are not authorized to join this meeting.</p>
        <Button onClick={() => navigate(`/${userType}/meetings`)}>Return to Dashboard</Button>
      </div>
    );
  }

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
    );
  }

  return (
    <div className="flex flex-col h-screen p-4">
      {/* Meeting title */}
      {meeting && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{meeting.title}</h2>
          {meeting.status === 'scheduled' && (
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded mt-2 inline-block">
              Waiting for host to start the meeting
            </div>
          )}
        </div>
      )}

      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 flex flex-col p-4">
          <div
            ref={meetingContainerRef}
            className="flex-1 bg-gray-100 rounded-lg"
            id="video-conference-container"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedMeetingRoom;