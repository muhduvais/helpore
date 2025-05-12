import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { meetingService } from "@/services/meeting.service";
import { toast } from "sonner";

interface MeetingRoomProps {
  userType: 'admin' | 'user' | 'volunteer';
}

const UnifiedMeetingRoom: React.FC<MeetingRoomProps> = ({ userType }) => {

  const { meetingId } = useParams<{ meetingId: string }>();

  const [searchParams] = useSearchParams();
  const roomID = searchParams.get("roomID") || "defaultRoom";
  const callContainer = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!callContainer.current) return;

    let zp: ZegoUIKitPrebuilt | null = null;

    const initializeCall = async () => {
      try {
        const appID = Number(import.meta.env.VITE_ZEGO_APP_ID);
        const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

        if (!appID || isNaN(appID)) {
          throw new Error("Invalid App ID. Check your environment variables.");
        }

        if (!serverSecret) {
          throw new Error(
            "Missing Server Secret. Check your environment variables.",
          );
        }

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomID,
          "UserID_" + Date.now(),
          userType === 'admin' ? "Admin" : "Guest",
        );

        zp = ZegoUIKitPrebuilt.create(kitToken);

        // Set up permission controls based on user type
        const config = {
          container: callContainer.current,
          sharedLinks: [
            {
              name: "Meeting Link",
              url: `${window.location.origin}/video-call?roomID=${roomID}`,
            },
          ],
          scenario: {
            mode: ZegoUIKitPrebuilt.GroupCall,
          },
          showScreenSharingButton: true,
          showRemoveUserButton: userType === 'admin',
          showTurnOffRemoteCameraButton: false,
          showTurnOffRemoteMicrophoneButton: false,
          
          onJoinRoom: () => {
            console.log("Successfully joined room:", roomID);
            toast.success('Successfully joined the meeting');
            setIsReady(true);
            setError(null);
          },
          onLeaveRoom: async () => {
            console.log('Left meeting room');
            if (userType === 'admin') {
              try {
                await meetingService.updateMeetingStatus(meetingId as string, 'completed');
                console.log('Meeting status updated to completed!');
              } catch (err) {
                console.error('Failed to update meeting status:', err);
              }
            }
          },
        };

        await zp.joinRoom(config);
      } catch (err: any) {
        console.error("Failed to initialize video call:", err);
        setError(`Error: ${err.message || "Failed to initialize meeting"}`);
        setIsReady(false);
      }
    };

    initializeCall();

    return () => {
      if (zp) {
        console.log("Cleaning up Zego instance");
        try {
          zp.destroy();
        } catch (err) {
          console.error("Error destroying Zego instance:", err);
        }
      }
    };
  }, [roomID, userType, meetingId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <button
        onClick={handleGoBack}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 100,
          background: "rgba(255, 255, 255, 0.7)",
          border: "none",
          borderRadius: "4px",
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <ArrowLeft style={{ marginRight: "5px" }} size={18} />
        Back to Meetings
      </button>

      {!isReady && !error && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <p>Loading video call...</p>
        </div>
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            color: "red",
            background: "rgba(255,255,255,0.9)",
            padding: "20px",
            borderRadius: "8px",
            maxWidth: "80%",
          }}
        >
          <h3>Failed to join meeting</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "15px",
              padding: "8px 16px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      )}

      <div ref={callContainer} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default UnifiedMeetingRoom;