import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

// Main app config
const mainFirebaseConfig = {
  apiKey: "AIzaSyDbuErBjQl5fiS-bWmZzH-jVQy_pdc4MQM",
  authDomain: "bayangida-dac94.firebaseapp.com",
  projectId: "bayangida-dac94",
  storageBucket: "bayangida-dac94.appspot.com",
  messagingSenderId: "717621145322",
  appId: "1:717621145322:web:2716548d9284dd6d477193",
  measurementId: "G-JZ8QXKX7GD",
};

// Waitlist-specific Firebase config (replace with your actual waitlist project config)
const waitlistFirebaseConfig = {
  apiKey: "AIzaSyDacG5HO-fWDAj8fRxqyhsgcjJRE7apXAY",
  authDomain: "bayangidawaitlist.firebaseapp.com",
  projectId: "bayangidawaitlist",
  storageBucket: "bayangidawaitlist.firebasestorage.app",
  messagingSenderId: "952632592368",
  appId: "1:952632592368:web:20835f505e1fc20126ff35",
  measurementId: "G-ZJJ3VRDM4X"
};

// Initialize main app
const app = initializeApp(mainFirebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize waitlist app only if config is provided
let waitlistApp = null;
let waitlistDb = null;

if (waitlistFirebaseConfig.projectId) {
  try {
    waitlistApp = initializeApp(waitlistFirebaseConfig, "waitlist");
    waitlistDb = getFirestore(waitlistApp);
  } catch (error) {
    console.error("Failed to initialize waitlist Firebase app:", error);
  }
}

export { waitlistDb };
export default app;