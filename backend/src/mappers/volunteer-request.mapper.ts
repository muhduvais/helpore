import { IUser } from "../interfaces/user.interface";
import { IAddress } from "../interfaces/address.interface";
import { UpdateVolunteerRequestDTO } from "../dtos/requests/updateVolunteer-request.dto";
import { AddVolunteerRequestDTO } from "../dtos/requests/addVolunteer-request.dto";

export class VolunteerMapper {
  static toVolunteerEntity(dto: AddVolunteerRequestDTO): Partial<IUser> {
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

  static toAddressEntity(dto: AddVolunteerRequestDTO): IAddress {
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

  static toUpdateVolunteerEntity(dto: UpdateVolunteerRequestDTO): Partial<IUser> {
    return {
      name: dto.name,
      age: dto.age,
      gender: dto.gender,
      phone: dto.phone
    };
  }

  static toUpdateAddressEntity(dto: UpdateVolunteerRequestDTO): Partial<IAddress> {
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
