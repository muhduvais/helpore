import { Expose } from "class-transformer";

export class AddressDTO {
  @Expose()
  fname!: string;

  @Expose()
  lname!: string;

  @Expose()
  street!: string;

  @Expose()
  city!: string;

  @Expose()
  state!: string;

  @Expose()
  country!: string;

  @Expose()
  pincode!: number;

  @Expose()
  entity!: string;

  @Expose()
  type!: string;
}
