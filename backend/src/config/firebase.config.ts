import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import serviceAccount from './serviceAccount.json';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
});

export const firebaseAdmin = admin;