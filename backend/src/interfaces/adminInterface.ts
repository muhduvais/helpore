
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

export interface IAsset {
    name: string;
    category: string;
    description: string;
    stocks: number;
    image: string;
}

export interface AddAssetData {
    name: string,
    description: string,
    stocks: Number | null,
    image: string | null,
}

export interface IAssetRequest {
    _id: string;
    asset: IAsset;
    requestedDate: string;
    quantity: number;
    status: 'pending' | 'approved' | 'rejected';
    comment?: string;
    createdAt: string;
    updatedAt: string;
}

