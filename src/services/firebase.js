import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCg6N7Rysf_pu6r0EPEqPliK6RGPZDHy7E",
    authDomain: "peminjaman-ruangan-a7d44.firebaseapp.com",
    projectId: "peminjaman-ruangan-a7d44",
    storageBucket: "peminjaman-ruangan-a7d44.firebasestorage.app",
    messagingSenderId: "850807152452",
    appId: "1:850807152452:web:7cfe0ca8711023e84a4111",
    measurementId: "G-8EE7G3D4QL"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
