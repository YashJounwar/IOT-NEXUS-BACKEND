import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, } from "firebase/database";
import { getAuth } from "firebase/auth";
import { config } from 'dotenv';
config();
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.API_ID,
  measurementId: process.env.MEASUREMENT_ID
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app)
export const refe =  ref;
export const sett = set;
