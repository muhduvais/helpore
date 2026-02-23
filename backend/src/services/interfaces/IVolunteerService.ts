import { AddressDTO } from "../../dtos/address.dto";
import { UserDTO } from "../../dtos/user.dto";
import { IAddUserForm } from "../../interfaces/admin.interface";

export interface IVolunteerService {
    addVolunteer(formData: IAddUserForm): Promise<string | boolean | null>;
    fetchVolunteers(search: string, skip: number, limit: number, isActive: string): Promise<UserDTO[] | null>;
    editVolunteer(volunteerId: string, formData: any): Promise<string | null | undefined>;
    countVolunteers(search: string): Promise<number>;
    fetchVolunteerDetails(volunteerId: string): Promise<UserDTO | null>;
    changeProfilePicture(volunteerId: string, profilePicture: string): Promise<boolean>;
    verifyCurrentPassword(volunteerId: string, currentPassword: string): Promise<boolean | null | undefined>;
    changePassword(volunteerId: string, newPassword: string): Promise<boolean>;
    toggleIsBlocked(action: boolean, volunteerId: string): Promise<boolean>;
    checkTasksLimit(volunteerId: string): Promise<boolean>;
    fetchAddress(volunteerId: string): Promise<AddressDTO | null>;
}