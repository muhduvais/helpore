
export interface AddAssetData {
    name: string,
    category: string,
    description: string,
    stocks: Number | null,
    image: string | null,
}

export interface IAsset {
    _id: string;
    name: string;
    category: string;
    description: string;
    stocks: number;
    image: string | null;
    createdAt: string;
    updatedAt: string;
}