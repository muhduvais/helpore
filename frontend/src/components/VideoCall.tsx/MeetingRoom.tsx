// import { useEffect } from 'react';
// import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
// import { VideoConferenceProps } from '../../interfaces/meeting.interface';
// import { meetingService } from '@/services/meeting.service';

// export const MeetingRoom: React.FC<VideoConferenceProps> = ({
//   roomId,
//   users
// }) => {
//   useEffect(() => {
//     const initializeVideoConference = async () => {
//       const element = document.getElementById('video-conference-container');
      
//       if (!element) return;

//       const token = meetingService.generateZegoToken(currentUser.id);
      
//       const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
//         configService.getZegoAppId(), 
//         configService.getZegoAppSign(),
//         roomId,
//         currentUser.id,
//         currentUser.name
//       );

//       const zp = ZegoUIKitPrebuilt.create(kitToken);
      
//       zp.joinRoom({
//         container: element,
//         sharedLinks: [
//           {
//             name: 'Meeting Link',
//             url: `${window.location.origin}/video-conference/${roomId}`
//           }
//         ],
//         scenario: {
//           mode: ZegoUIKitPrebuilt.GroupCall, // or ZegoUIKitPrebuilt.OneONoneCall
//         },
//         turnOnMicrophoneWhenJoining: true,
//         turnOnCameraWhenJoining: true,
//         showMyCameraToggleButton: true,
//         showMyMicrophoneToggleButton: true,
//         showRemoteVideoView: true,
//         showRemoteAudioView: true,
//         showScreenSharingButton: true,
//       });
//     };

//     initializeVideoConference();
//   }, [roomId, users]);

//   return (
//     <div 
//       id="video-conference-container" 
//       className="w-full h-[600px] bg-gray-100 rounded-lg"
//     />
//   );
// };

// export default MeetingRoom;