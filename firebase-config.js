import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgDhHeiUoTsZx40jlGbpVBZxbiXk69BdI",
  authDomain: "grifa-shop.firebaseapp.com",
  projectId: "grifa-shop",
  storageBucket: "grifa-shop.firebasestorage.app",
  messagingSenderId: "289688053214",
  appId: "1:289688053214:web:f24347d885f5b08737694f",
  measurementId: "G-1XXDHGJ6JJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };