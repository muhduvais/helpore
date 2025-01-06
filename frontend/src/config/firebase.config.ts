import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const apiKey = import.meta.env.API_KEY;
const authDomain = import.meta.env.AUTH_DOMAIN;
const projectId = import.meta.env.PROJECT_ID;
const storageBucket = import.meta.env.STORAGE_BUCKET;
const messagingSenderId = import.meta.env.MESSAGING_SENDER_ID;
const appId = import.meta.env.APP_ID;

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup };