import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCRQNQkhEnHJR7S9p8wfHaVyXaLgt0AI2U",
  authDomain: "meetingmuse-541a0.firebaseapp.com",
  projectId: "meetingmuse-541a0",
  storageBucket: "meetingmuse-541a0.firebasestorage.app",
  messagingSenderId: "71333603744",
  appId: "1:71333603744:web:ace4ec0c881c8e2785dcc5",
};
console.log('Firebase Config:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
