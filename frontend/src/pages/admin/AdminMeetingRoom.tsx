import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { toast } from 'sonner';

import { meetingService } from '@/services/meeting.service';
import { userService } from '@/services/user.service';
import { Card, CardContent } from '@/components/ui/card';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { IUserDocument } from '@/interfaces/userInterface';

const MeetingRoom: React.FC = () => {
    const { meetingId } = useParams<{ meetingId: string }>();
    const navigate = useNavigate();
    const meetingContainerRef = useRef<HTMLDivElement>(null);

    const [currentUser, setCurrentUser] = useState<IUserDocument | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeMeeting = async () => {
            try {
                // Fetch user details
                const userResponse = await userService.fetchUserDetails();
                setCurrentUser(userResponse.data.user);

                // Generate Zego token
                const tokenResponse = await meetingService.generateZegoToken(meetingId || '');
                const token = tokenResponse.data.token;

                if (!token) {
                    console.error('Failed to generate token');
                    toast.error('Meeting token generation failed');
                    return;
                }

                const appId = parseInt(import.meta.env.VITE_ZEGO_APP_ID || '0');
                const appSign = import.meta.env.VITE_ZEGO_APP_SIGN || '';

                const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                    appId,
                    appSign,
                    meetingId || '',
                    currentUser?._id || 'guest',
                    currentUser?.name || 'Guest User'
                );

                // Initialize Zego video conference
                if (meetingContainerRef.current) {
                    const zegoInstance = ZegoUIKitPrebuilt.create(kitToken);
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
                        onLeaveRoom: async () => {
                            console.log('Left meeting room');

                            try {
                                await meetingService.updateMeetingStatus(meetingId || '', 'completed');
                                console.log('Meeting status updated to completed!');
                            } catch (error) {
                                console.error('Failed to update meeting status:', error);
                            }

                            navigate('/admin/meetings');
                            window.location.reload();
                        },
                        onError: (error: any) => {
                            console.error('Meeting room error:', error);
                            toast.error('An error occurred in the meeting');
                        },
                    };

                    zegoInstance.joinRoom(roomConfig);
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Meeting initialization error:', error);
                toast.error('Failed to join meeting');
                navigate('/admin/meetings');
            }
        };

        initializeMeeting();
        return () => {
            if (meetingContainerRef.current) {
                meetingContainerRef.current.innerHTML = '';
            }
        };
    }, [meetingId, navigate]);

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
        <div className="flex flex-col h-screen">
            <Card className="flex-1 flex flex-col">
                <CardContent className="flex-1 flex flex-col">
                    <div
                        ref={meetingContainerRef}
                        className="flex-1 bg-gray-100 rounded-lg"
                    />
                </CardContent>
            </Card>
        </div>
    );
};

export default MeetingRoom;