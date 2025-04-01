import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config();

admin.initializeApp({
    credential: admin.credential.cert(process.env.GOOGLE_CREDENTIALS_JSON as ServiceAccount),
});

export const firebaseAdmin = admin;