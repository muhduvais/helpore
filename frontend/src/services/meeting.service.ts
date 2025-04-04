import { customAxios } from '../utils/apiClient';
import { userService } from './user.service';

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

      return response;
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

  createMeeting: async (adminId: string, title: string, participants: string[], scheduledTime: Date | string) => {
    try {
      const response = await customAxios.post("/api/meetings", { adminId, title, participants, scheduledTime });
      return response.data;
    } catch (error) {
      console.error("Error creating meeting:", error);
      throw error;
    }
  },

  getMeetings: async (page: number, search: string, filter: string) => {
    try {
      const response = await customAxios.get("/api/meetings", {
        params: {
          page,
          search,
          filter,
        }
      }); 
      return response.data;
    } catch (error) {
      console.error("Error fetching meetings:", error);
      throw error;
    }
  },

  getUserMeetings: async (page: number, search: string, filter: string) => {
    try {
      const response = await customAxios.get("/api/meetings/user", {
        params: {
          page,
          search,
          filter,
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user meetings:", error);
      throw error;
    }
  },

  getUpcomingMeetings: async () => {
    try {
      const response = await customAxios.get("/api/meetings/upcoming");
      return response;
    } catch (error) {
      console.error("Error fetching upcoming meetings:", error);
      throw error;
    }
  },

  updateMeetingStatus: async (
    meetingId: string,
    status: 'scheduled' | 'active' | 'completed' | 'cancelled'
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
  },

  deleteMeeting: async (meetingId: string) => {
    try {
      const response = await customAxios.delete(`/api/meetings/${meetingId}`);
      return response;
    } catch (error) {
      console.error("Error the meeting meeting:", error);
      throw error;
    }
  },
}
