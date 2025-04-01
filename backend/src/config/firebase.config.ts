import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.GOOGLE_CREDENTIALS_JSON) {
    throw new Error("GOOGLE_CREDENTIALS_JSON is not set in the environment variables");
}

const firebaseConfig: ServiceAccount = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);

admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
});

export const firebaseAdmin = admin;
