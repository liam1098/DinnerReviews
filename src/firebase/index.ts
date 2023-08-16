// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDLx-gMyR3c9KW5-y5wvhD20FkTaaF3k10",
  authDomain: "dinner-reviews.firebaseapp.com",
  databaseURL: "https://dinner-reviews-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dinner-reviews",
  storageBucket: "dinner-reviews.appspot.com",
  messagingSenderId: "18080028640",
  appId: "1:18080028640:web:478f1d78e00aeb6d9cbd85",
  measurementId: "G-EJXPLPT8L3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app)

export {
    db,
    auth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect
}

