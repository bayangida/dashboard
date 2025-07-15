import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDbuErBjQl5fiS-bWmZzH-jVQy_pdc4MQM",
  authDomain: "bayangida-dac94.firebaseapp.com",
  projectId: "bayangida-dac94",
  storageBucket: "bayangida-dac94.appspot.com",
  messagingSenderId: "717621145322",
  appId: "1:717621145322:web:2716548d9284dd6d477193",
  measurementId: "G-JZ8QXKX7GD",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
export default app
