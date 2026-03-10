// src/services/authService.js

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";

export const signUp = async (name, email, password) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  return cred.user;
};

export const logIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logOut = () => signOut(auth);

export const resetPassword = (email) =>
  sendPasswordResetEmail(auth, email);

export const onAuthChange = (cb) => onAuthStateChanged(auth, cb);

export const friendlyError = (code) => {
  const map = {
    "auth/invalid-email":          "Invalid email address.",
    "auth/user-not-found":         "No account found with this email.",
    "auth/wrong-password":         "Incorrect password.",
    "auth/invalid-credential":     "Wrong email or password.",
    "auth/email-already-in-use":   "This email is already registered.",
    "auth/weak-password":          "Password must be at least 6 characters.",
    "auth/too-many-requests":      "Too many attempts. Wait a moment.",
    "auth/network-request-failed": "Network error. Check your internet.",
  };
  return map[code] ?? "Something went wrong. Please try again.";
};