import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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

const UserMeetingRoom: React.FC = () => {
    const { meetingId } = useParams<{ meetingId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const meetingContainerRef = useRef<HTMLDivElement>(null);

    const [meeting, setMeeting] = useState<any>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(true);

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
                const user = userResponse.data.user;
                setCurrentUser(user);

                // Fetch meeting details
                const meetingDetails = await meetingService.fetchMeetingDetails(meetingId || '');
                setMeeting(meetingDetails);

                // Check if user is authorized to join this meeting
                const isParticipant = meetingDetails.participants.includes(user._id);
                if (!isParticipant) {
                    setIsAuthorized(false);
                    toast.error("You are not authorized to join this meeting");
                    setTimeout(() => navigate('/user/meetings'), 3000);
                    return;
                }

                setParticipants(meetingDetails.participants);

                // Get Zego credentials from environment variables
                const appId = parseInt(import.meta.env.VITE_ZEGO_APP_ID || '0');
                const appSign = import.meta.env.VITE_ZEGO_APP_SIGN || '';

                if (!appId || !appSign) {
                    console.error('Zego credentials are missing or invalid');
                    toast.error('Video conference configuration is incomplete');
                    return;
                }

                // Generate the kit token directly
                const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                    appId,
                    appSign,
                    meetingId || '',
                    user._id || 'guest',
                    user.name || 'Guest User'
                );

                // Initialize Zego video conference
                if (meetingContainerRef.current) {
                    const zegoInstance = ZegoUIKitPrebuilt.create(kitToken);

                    if (!zegoInstance) {
                        console.error('Failed to create Zego instance');
                        toast.error('Failed to initialize video conference');
                        return;
                    }

                    const roomConfig = {
                        container: meetingContainerRef.current,
                        scenario: {
                            mode: ZegoUIKitPrebuilt.GroupCall,
                        },
                        turnOnMicrophoneWhenJoining: true,
                        turnOnCameraWhenJoining: true,
                        showRemoteAudioVolume: true,
                        showScreenSharingButton: true,
                        showTurnOffRemoteCameraButton: false,
                        showTurnOffRemoteMicrophoneButton: false,
                        showRemoveUserButton: false,

                        // Callbacks
                        onJoinRoom: () => {
                            console.log('Joined meeting room');
                            toast.success('Successfully joined the meeting');
                        },
                        onLeaveRoom: () => {
                            console.log('Left meeting room');
                            navigate('/user/meetings');
                            window.location.reload();
                        },
                        onError: (error: any) => {
                            console.error('Meeting room error:', error);
                            toast.error('An error occurred in the meeting');
                        },

                        // Participant management
                        onUserJoin: (userList: any[]) => {
                            const newParticipants = userList.map(user => user.name);
                            setParticipants(prev => [...new Set([...prev, ...newParticipants])]);
                        },
                        onUserLeave: (userList: any[]) => {
                            const remainingParticipants = userList.map(user => user.name);
                            setParticipants(remainingParticipants);
                        }
                    };

                    zegoInstance.joinRoom(roomConfig);
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Meeting initialization error:', error);
                toast.error('Failed to join meeting');
                navigate('/user/meetings');
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

    const handleLeaveMeeting = () => {
        toast.info('Leaving meeting...');
        navigate('/user/meetings');
    };

    if (!isAuthorized) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h2 className="text-xl font-semibold mb-4">Unauthorized Access</h2>
                <p className="mb-4">You are not authorized to join this meeting.</p>
                <Button onClick={() => navigate('/user/meetings')}>Return to Dashboard</Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="mb-2">Loading meeting...</p>
                    <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen p-4">
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
                    {/* Video Conference Container */}
                    <div
                        ref={meetingContainerRef}
                        className="flex-1 bg-gray-100 rounded-lg"
                        id="video-conference-container"
                    />

                    {/* Meeting Controls */}
                    <div className="flex justify-center items-center space-x-4 mt-4 p-4 bg-gray-50 rounded-b-lg">
                        {/* Microphone Toggle */}
                        <Button
                            variant={isMicrophoneOn ? 'default' : 'destructive'}
                            size="icon"
                            onClick={handleToggleMicrophone}
                            title={isMicrophoneOn ? "Turn off microphone" : "Turn on microphone"}
                        >
                            {isMicrophoneOn ? <Mic /> : <MicOff />}
                        </Button>

                        {/* Camera Toggle */}
                        <Button
                            variant={isCameraOn ? 'default' : 'destructive'}
                            size="icon"
                            onClick={handleToggleCamera}
                            title={isCameraOn ? "Turn off camera" : "Turn on camera"}
                        >
                            {isCameraOn ? <Video /> : <VideoOff />}
                        </Button>

                        {/* Screen Share */}
                        <Button
                            variant={isScreenSharing ? 'default' : 'outline'}
                            size="icon"
                            onClick={handleScreenShare}
                            title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
                        >
                            <ScreenShare />
                        </Button>

                        {/* Participants */}
                        <Button
                            variant="outline"
                            className="flex items-center px-3"
                            title="Participants"
                        >
                            <Users className="mr-2" />
                            <span>{participants.length}</span>
                        </Button>

                        {/* Leave Meeting */}
                        <Button
                            variant="destructive"
                            size="icon"
                            onClick={handleLeaveMeeting}
                            title="Leave meeting"
                        >
                            <PhoneOff />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserMeetingRoom;