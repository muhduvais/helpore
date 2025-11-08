import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

export class ZegoMeetingService {
  private zegoUIKit: ZegoUIKitPrebuilt;

  async initializeMeeting(
    container: HTMLDivElement, 
    roomID: string, 
    userID: string, 
    userName: string,
    userToken: string
  ) {
    // Initialize UIKit
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        2133024081,     // Zego App ID
        '20de76807f0063f8cf9630f8f1380950', // Zego Server Secret
      roomID,
      userID,
      userName
    );

    this.zegoUIKit = await ZegoUIKitPrebuilt.create(kitToken);

    // Join the room with specific configuration
    this.zegoUIKit.joinRoom({
      container: container,
      sharedLinks: [
        {
          name: 'Meeting Link',
          url: `${window.location.origin}/meeting/${roomID}`
        }
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall, // or OneONoneCall, BroadcastCall
      },
      // Customize UI and features
      turnOnMicrophoneWhenJoining: true,
      turnOnCameraWhenJoining: true,
      showMyCameraToggleButton: true,
      showMyMicrophoneToggleButton: true,
      showAudioInputDeviceButton: true,
      showScreenSharingButton: true,
      showTextChat: true
    });
  }

  leaveMeeting() {
    if (this.zegoUIKit) {
      this.zegoUIKit.destroy();
    }
  }
}