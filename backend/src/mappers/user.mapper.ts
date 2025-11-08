import { plainToInstance } from "class-transformer"
import { UserDTO } from "../dtos/user.dto"
import { IUserDocument } from "../interfaces/user.interface"

export const toUserDTO = (user: IUserDocument): UserDTO => {
    return plainToInstance(UserDTO, {
        id: user._id,
        name: user.name,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
        email: user.email,
        profilePicture: user.profilePicture,
        certificates: user.certificates,
        isActive: user.isActive,
        isBlocked: user.isBlocked,
        isVerified: user.isVerified,
        role: user.role,
        tasks: user.tasks,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    });
}

export const toUserListDTO = (users: IUserDocument[]): UserDTO[] => {
    return users.map((user) => toUserDTO(user));
}