import { customAxios } from '../utils/apiClient';
import { userService } from './user.service';
import { VideoConferenceConfig } from '@/interfaces/meeting.interface';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

export const meetingService = {

  generateZegoToken: async (roomId: string) => {
    try {
      const userResponse = await userService.fetchUserDetails();
      const currentUser = userResponse.data.user;

      const response = await customAxios.post('/api/meetings/generateToken', {
        roomId,
        userId: currentUser._id,
        userName: currentUser.name
      });

      return response.data.token;
    } catch (error) {
      console.error('Failed to generate Zego token:', error);
      throw new Error('Token generation failed');
    }
  },

  createVideoConferenceRoom: async (roomId: string, participants: string[]) => {
    try {
      if (!roomId || participants.length === 0) {
        throw new Error('Invalid room parameters');
      }

      const userResponse = await userService.fetchUserDetails();
      const currentUser = userResponse.data.user;

      const roomPayload = {
        roomId,
        hostId: currentUser._id,
        participants,
        createdAt: new Date(),
        status: 'scheduled' as const
      };

      const response = await customAxios.post('/api/video-conferences', roomPayload);

      const invitationLinks = participants.map(participantId =>
        `${window.location.origin}/video-conference/${roomId}?participant=${participantId}`
      );

      return {
        ...response.data,
        invitationLinks
      };
    } catch (error) {
      console.error('Failed to create video conference room:', error);
      throw new Error('Could not create video conference room');
    }
  },

  initializeVideoConference: async (config: VideoConferenceConfig) => {
    try {
      if (!config.roomID || !config.userID || !config.userName) {
        throw new Error('Incomplete video conference configuration');
      }

      const appId = parseInt(import.meta.env.ZEGO_APP_ID) || 0;
      const appSign = import.meta.env.ZEGO_APP_SIGN || '';

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appId,
        appSign,
        config.roomID,
        config.userID,
        config.userName
      );

      const zegoInstance = ZegoUIKitPrebuilt.create(kitToken);

      if (zegoInstance) {
        const zegoModule = await import('@zegocloud/zego-uikit-prebuilt');

        if (!zegoModule.ScenarioModel || !zegoModule.LiveRole) {
          throw new Error('Zego module is missing required properties');
        }

        const roomConfig = {
          container: document.getElementById('video-conference-container') || undefined,
          scenario: {
            mode: zegoModule.ScenarioModel.GroupCall as any,
            config: {
              role: zegoModule.LiveRole.Host
            }
          },
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          onJoinRoom: () => {
            console.log(`Joined room: ${config.roomID}`);
          },
          onLeaveRoom: () => {
            console.log(`Left room: ${config.roomID}`);
          },
          onError: (error: Error) => {
            console.error('Zego conference error:', error);
          }
        };

        zegoInstance.joinRoom(roomConfig as any);
      }

      return zegoInstance;
    } catch (error) {
      console.error('Video conference initialization failed:', error);
      return null;
    }
  },

  ////////////////////////////////////////

  fetchMeetingDetails: async (meetingId: string) => {
    try {
      const response = await customAxios.get(`/api/meetings/${meetingId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch meeting details:', error);
      throw new Error('Could not retrieve meeting details');
    }
  },

  createMeeting: async (meetingData: {
    title: string;
    participants: string[];
    scheduledTime?: Date;
  }) => {
    try {
      const userResponse = await userService.fetchUserDetails();
      const currentUser = userResponse.data.user;

      const payload = {
        ...meetingData,
        adminId: currentUser._id,
        status: 'scheduled',
        createdAt: new Date()
      };

      const response = await customAxios.post('/api/meetings', payload);
      return response.data;
    } catch (error) {
      console.error('Failed to create meeting:', error);
      throw new Error('Could not create meeting');
    }
  },

  updateMeetingStatus: async (
    meetingId: string,
    status: 'scheduled' | 'active' | 'completed'
  ) => {
    try {
      const response = await customAxios.patch(
        `/api/meetings/${meetingId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update meeting status:', error);
      throw new Error('Could not update meeting status');
    }
  }
}
