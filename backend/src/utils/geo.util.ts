import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

interface GeocodeResponse {
    results: {
        geometry: {
            lat: number;
            lng: number;
        };
        confidence: number;
    }[];
    status: {
        code: number;
        message: string;
    };
}

export class GeocodingService {
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = process.env.OPENCAGE_API_KEY as string;
        this.baseUrl = 'https://api.opencagedata.com/geocode/v1/json';
    }

    async geocodeAddress(address: {
        street: string;
        city: string;
        state: string;
        country: string;
        pincode: number;
    }) {
        try {
            const addressString = `${address.street}, ${address.city}, ${address.state}, ${address.country}, ${address.pincode}`;

            const response = await axios.get<GeocodeResponse>(
                `${this.baseUrl}?q=${encodeURIComponent(addressString)}&key=${this.apiKey}&limit=1`
            );

            if (response.data.status.code !== 200) {
                throw new Error(`Geocoding failed: ${response.data.status.message}`);
            }

            if (!response.data.results || response.data.results.length === 0) {
                throw new Error('No results found for the address');
            }

            const result = response.data.results[0];

            // Minimum confidence threshold
            if (result.confidence < 5) {
                console.warn('Low confidence geocoding result for address:', addressString);
            }

            return {
                latitude: result.geometry.lat,
                longitude: result.geometry.lng
            };
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 402) {
                    throw new Error('OpenCage API quota exceeded');
                }
                if (error.response?.status === 403) {
                    throw new Error('Invalid OpenCage API key');
                }
            }
            console.error('Geocoding error:', error);
            throw error;
        }
    }

    // Getting address from coordinates
    async reverseGeocode(latitude: number, longitude: number) {
        try {
            const response = await axios.get<GeocodeResponse>(
                `${this.baseUrl}?q=${latitude}+${longitude}&key=${this.apiKey}&limit=1`
            );

            if (response.data.status.code !== 200) {
                throw new Error(`Reverse geocoding failed: ${response.data.status.message}`);
            }

            return response.data.results[0];
        } catch (error: any) {
            console.error('Reverse geocoding error:', error);
            throw error;
        }
    }
}

export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371;

    const lat1Rad = toRadians(lat1);
    const lon1Rad = toRadians(lon1);
    const lat2Rad = toRadians(lat2);
    const lon2Rad = toRadians(lon2);

    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;

    // Haversine formula
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;

    return Math.round(distance * 100) / 100;
}

function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export const MAX_DISTANCE = 10;
export const MIN_DISTANCE = 0.1;