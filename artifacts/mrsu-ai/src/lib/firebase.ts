import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "project-a11082d1-41a4-41fd-9db",
  appId: "1:881263637932:web:987d53e8b949f291ad7609",
  apiKey: "AIzaSyB1TuvBzqXCGhOV007NVTVe8pAZ4pFEtAY",
  authDomain: "project-a11082d1-41a4-41fd-9db.firebaseapp.com",
  storageBucket: "project-a11082d1-41a4-41fd-9db.firebasestorage.app",
  messagingSenderId: "881263637932",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-387d186a-0d51-4db1-a602-3b340d82b717");
export const storage = getStorage(app);
export default app;
