import AssistanceRequest from '../models/assistanceRequestModel';
import Address from '../models/addressModel';
import User from '../models/userModel';
import { IAddress } from '../interfaces/userInterface';

class VolunteerRepository {

    async findVolunteerAddress(query: object) {
        return await Address.findOne(query);
    }

    async findPendingRequests(requestQuery: object, skip: number) {
        return await AssistanceRequest.find(requestQuery).skip(skip)
            .populate('address')
            .populate('user');
    }

    async findRequestById(requestId: string) {
        return await AssistanceRequest.findById(requestId);
    }

    async updateRequest(request: any) {
        return await request.save();
    }

    async countRequests(query: object): Promise<number> {
        try {
            return await AssistanceRequest.countDocuments(query);
        } catch (error) {
            console.error('Error counting the requests:', error);
            return 0;
        }
    }

    async incrementVolunteerTasks(volunteerId: string) {
        return await User.findByIdAndUpdate(volunteerId, {
            $inc: { tasks: 1 }
        });
    }

    async findUserDetails(id: string) {
        try {
            return await User.findById(id);
        } catch (error) {
            console.error('Error finding the user:', error);
            return null;
        }
    }

    async updateUser(id: string, submitData: any) {
        try {
            return await User.findByIdAndUpdate(id, submitData);
        } catch (error) {
            console.error('Error updating the user:', error);
            return null;
        }
    }

    // Addresses
    async updateAddress(id: string, submitData: any) {
        try {
            return await Address.findOneAndUpdate({ entity: id }, { $set: submitData });
        } catch (error) {
            console.error('Error updating the address:', error);
            return null;
        }
    }

    async findAddressDetails(id: string) {
        try {
            return await Address.findOne({ entity: id });
        } catch (error) {
            console.error('Error finding the user:', error);
            return null;
        }
    }

    async findAddresses(id: string): Promise<IAddress[]> {
        try {
            return await Address.find({ entity: id });
        } catch (error) {
            console.error('Error finding addresses:', error);
            return null;
        }
    }

    async createAddress(addressData: IAddress): Promise<IAddress> {
        try {

            const newAddress = new Address(addressData);
            await newAddress.save();
            return newAddress;
        } catch (error) {
            console.error('Error finding addresses:', error);
            return null;
        }
    }

    async updateProfilePicture(volunteerId: string, profilePicture: string) {
        try {
            await User.findByIdAndUpdate(volunteerId, { profilePicture });
            return true;
        } catch (error) {
            console.error('Error updating the profile picture:', error);
            return false;
        }
    }

    async findPassword(volunteerId: String) {
        try {
            const user = await User.findById(volunteerId);
            return user.password;
        } catch (error) {
            console.error('Error updating the password:', error);
            return null;
        }
    }

    async updatePassword(volunteerId: string, newPassword: string) {
        try {
            await User.findByIdAndUpdate(volunteerId, { password: newPassword });
            return true;
        } catch (error) {
            console.error('Error updating the password:', error);
            return false;
        }
    }
}

export default VolunteerRepository;