import { IAddUserForm } from "../../interfaces/admin.interface";

export class UpdateVolunteerRequestDTO {
  name?: string;
  age?: number;
  gender?: string;
  phone?: number;

  fname?: string;
  lname?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: number;

  static fromRequest(body: IAddUserForm): UpdateVolunteerRequestDTO {
    const dto = new UpdateVolunteerRequestDTO();

    dto.name = body.name;
    dto.age = body.age ? Number(body.age) : undefined;
    dto.gender = body.gender;
    dto.phone = body.phone ? Number(body.phone) : undefined;

    dto.fname = body.fname;
    dto.lname = body.lname;
    dto.street = body.street;
    dto.city = body.city;
    dto.state = body.state;
    dto.country = body.country;
    dto.pincode = body.pincode ? Number(body.pincode) : undefined;

    return dto;
  }
}
