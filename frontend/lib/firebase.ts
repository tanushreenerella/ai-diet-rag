import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAeGcL_l1sKVEU55zQ1DkHX0oynA6TbapE",
  authDomain: "aidiet-8193f.firebaseapp.com",
  projectId: "aidiet-8193f",
  storageBucket: "aidiet-8193f.firebasestorage.app",
  messagingSenderId: "752216871134",
  appId: "1:752216871134:web:89b90d2b8171126a25724f",
  measurementId: "G-V1GFEPK3WL"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);