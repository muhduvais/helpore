import { AddUserRequestDTO } from "../../dtos/requests/addUser-request.dto";
import { IAddressDocument } from "../../interfaces/address.interface";
import { IAddUserForm } from "../../interfaces/admin.interface";
import { IUser } from "../../interfaces/user.interface";

export interface IAdminService {
    addUser(dto: AddUserRequestDTO): Promise<string | boolean | null>;
    editUser(userId: string, formData: IAddUserForm): Promise<string | null>;
    fetchUsers(search: string, skip: number, limit: number): Promise<IUser[] | null>;
    fetchUserDetails(userId: string): Promise<IUser | null>;
    countUsers(search: string): Promise<number>;
    toggleIsBlocked(action: boolean, userId: string): Promise<boolean>;

    addVolunteer(formData: IAddUserForm): Promise<string | boolean | null>;
    fetchVolunteers(search: string, skip: number, limit: number, isActive: any): Promise<IUser[] | null>;
    fetchVolunteerDetails(volunteerId: string): Promise<IUser | null>;
    countVolunteers(search: string): Promise<number>;

    fetchAddresses(entityId: string): Promise<IAddressDocument[] | null>;
}