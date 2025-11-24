import { IAddUserForm } from "../../interfaces/admin.interface";

export class AddVolunteerRequestDTO {
  name!: string;
  age!: number;
  gender!: string;
  phone!: number;
  email!: string;
  password!: string;
  fname!: string;
  lname!: string;
  street!: string;
  city!: string;
  state!: string;
  country!: string;
  pincode!: number;

  static fromRequest(body: IAddUserForm): AddVolunteerRequestDTO {
    const dto = new AddVolunteerRequestDTO();

    dto.name = body.name;
    dto.age = Number(body.age);
    dto.gender = body.gender;
    dto.phone = Number(body.phone);
    dto.email = body.email;
    dto.password = body.password;
    dto.fname = body.fname;
    dto.lname = body.lname;
    dto.street = body.street;
    dto.city = body.city;
    dto.state = body.state;
    dto.country = body.country;
    dto.pincode = Number(body.pincode);

    return dto;
  }
}
