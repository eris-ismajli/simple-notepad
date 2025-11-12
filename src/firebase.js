// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCo1t60A33VhY2fwrxOLrycmzTpn6ML1TM",
  authDomain: "notepad-eris.firebaseapp.com",
  projectId: "notepad-eris",
  storageBucket: "notepad-eris.firebasestorage.app",
  messagingSenderId: "394339959817",
  appId: "1:394339959817:web:d13c8a07f67c135c9264d8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore
export const db = getFirestore(app);
