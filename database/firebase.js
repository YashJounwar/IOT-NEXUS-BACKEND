import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, } from "firebase/database";
import { getAuth } from "firebase/auth";
import { config } from 'dotenv';
config();
const firebaseConfig = {
  apiKey: "AIzaSyBbNE2JegNzLfgIjJVr6562V-RpJbvKMV4",
  authDomain: "boost-iot-club-project.firebaseapp.com",
  databaseURL: "https://boost-iot-club-project-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "boost-iot-club-project",
  storageBucket: "boost-iot-club-project.appspot.com",
  messagingSenderId: "72693946292",
  appId: "1:72693946292:web:d3c3d28587ef088c00c4e1",
  measurementId: "G-ZDNPX2LSTD"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app)
export const refe =  ref;
export const sett = set;
