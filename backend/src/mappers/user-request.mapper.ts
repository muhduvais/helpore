import { AddUserRequestDTO } from "../dtos/requests/addUser-request.dto";
import { IUser } from "../interfaces/user.interface";
import { IAddress } from "../interfaces/address.interface";
import { UpdateUserRequestDTO } from "../dtos/requests/updateUser-request.dto";

export class UserMapper {
  static toUserEntity(dto: AddUserRequestDTO): Partial<IUser> {
    return {
      name: dto.name,
      age: dto.age,
      gender: dto.gender,
      phone: dto.phone,
      email: dto.email,
      googleId: null,
      password: dto.password,
      role: "user"
    };
  }

  static toAddressEntity(dto: AddUserRequestDTO): IAddress {
    return {
      fname: dto.fname,
      lname: dto.lname,
      street: dto.street,
      city: dto.city,
      state: dto.state,
      country: dto.country,
      pincode: dto.pincode,
      type: "user",
      entity: undefined
    };
  }

  static toUpdateUserEntity(dto: UpdateUserRequestDTO): Partial<IUser> {
    return {
      name: dto.name,
      age: dto.age,
      gender: dto.gender,
      phone: dto.phone
    };
  }

  static toUpdateAddressEntity(dto: UpdateUserRequestDTO): Partial<IAddress> {
    return {
      fname: dto.fname,
      lname: dto.lname,
      street: dto.street,
      city: dto.city,
      state: dto.state,
      country: dto.country,
      pincode: dto.pincode
    };
  }
}
