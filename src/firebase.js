import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBj73Tahl5KYjXcFgA9dyYy5sXhNo2Lpo0",
    authDomain: "tarjeta-de-credito-c5a2a.firebaseapp.com",
    projectId: "tarjeta-de-credito-c5a2a",
    storageBucket: "tarjeta-de-credito-c5a2a.appspot.com",
    messagingSenderId: "520418640305",
    appId: "1:520418640305:web:6a7eb242a48aa26d0abd90",
    measurementId: "G-FL6PYCQ441"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
