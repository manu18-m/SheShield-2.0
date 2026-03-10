import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDcVJnylZDzwq1lcIljLv0yOESwRKi7nrA",
  authDomain: "safeguard-6bfd0.firebaseapp.com",
  projectId: "safeguard-6bfd0",
  storageBucket: "safeguard-6bfd0.firebasestorage.app",
  messagingSenderId: "622162020884",
  appId: "1:622162020884:web:647e209911de52d80c7501"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = null;