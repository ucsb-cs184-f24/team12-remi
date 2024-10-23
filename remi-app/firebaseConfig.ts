
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyD-2nse0j-vdM8ZRiiNN171Vp3_9BbTPdM",
    authDomain: "remi-6b8c2.firebaseapp.com",
    projectId: "remi-6b8c2",
    storageBucket: "remi-6b8c2.appspot.com",
    messagingSenderId: "144226753173",
    appId: "1:144226753173:web:2f4699208e613b164dd99c",
    measurementId: "G-MCX7G95DKP"
  };

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Export Firebase services with proper types
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
