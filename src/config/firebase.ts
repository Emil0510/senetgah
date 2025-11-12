// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApAaqVyKXWIFII_LgI6iEDaTLCG4LFd1c",
  authDomain: "senetgah-9c9a4.firebaseapp.com",
  projectId: "senetgah-9c9a4",
  storageBucket: "senetgah-9c9a4.firebasestorage.app",
  messagingSenderId: "695706052785",
  appId: "1:695706052785:web:35ba6fd336d9071b785a90",
  measurementId: "G-3YQGM62W3V"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
let analytics: ReturnType<typeof getAnalytics> | null = null;

// Only initialize analytics in browser environment
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    // Analytics may fail on localhost if domain isn't registered
    // This is fine - the app will work without analytics
    console.warn("Firebase Analytics initialization failed:", error);
    analytics = null;
  }
}

export { app, analytics };

