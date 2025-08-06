import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Sua configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA80BtConFdAzSjMKmPtpgDG98dNR0sz7I",
  authDomain: "app-ofertas-afiliados.firebaseapp.com",
  projectId: "app-ofertas-afiliados",
  storageBucket: "app-ofertas-afiliados.firebasestorage.app",
  messagingSenderId: "60273378444",
  appId: "1:60273378444:web:bcda006342dca2fd2567a9",
  measurementId: "G-6K97VDJH0K"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços que vamos usar no app
// >>>>> VERIFIQUE SE A PALAVRA "export" ESTÁ AQUI <<<<<
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);