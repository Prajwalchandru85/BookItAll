// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqTDWklAHTzfOOi0tZM8bkBTOiLD3eYAY",
  authDomain: "movie-booking-app-a577e.firebaseapp.com",
  projectId: "movie-booking-app-a577e",
  storageBucket: "movie-booking-app-a577e.firebasestorage.app",
  messagingSenderId: "645124992475",
  appId: "1:645124992475:web:1325c4cb73c840504c0bfe"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
