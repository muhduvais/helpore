
export interface IAddUserForm {
    name: string;
    age: number;
    gender: string;
    phone: number;
    email: string;
    password: string;
    fname: string;
    lname: string;
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: number;
}

export interface AddAssetData {
    name: string,
    description: string,
    stocks: Number | null,
    image: string | null,
}