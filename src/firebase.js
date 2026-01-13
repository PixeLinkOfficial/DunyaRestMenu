// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCYTTmI8jH__TYhNFKBeOGLjGiRfY130X8",
  authDomain: "dunya-9aa09.firebaseapp.com",
  projectId: "dunya-9aa09",
  storageBucket: "dunya-9aa09.appspot.com",
  messagingSenderId: "728884819886",
  appId: "1:728884819886:web:c1953b2eb1b6cacd5a3a3f",
  measurementId: "G-E21X8ZR7QQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
