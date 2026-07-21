import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBWXI1n6mniVFm6lDT81PClTDWEOJ8TPrE",
  authDomain: "task-manager-838a6.firebaseapp.com",
  projectId: "task-manager-838a6",
  storageBucket: "task-manager-838a6.firebasestorage.app",
  messagingSenderId: "313622080176",
  appId: "1:313622080176:web:786f7a31ff5106d7b7a975",
  measurementId: "G-TVTJY7JV2Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
