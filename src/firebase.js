// Firebase setup.
// 1. Go to https://console.firebase.google.com
// 2. Create a project (free) -> Add a Web App
// 3. Copy the config values it gives you into the object below
// 4. Go to "Firestore Database" in the left menu -> Create database -> Start in PRODUCTION mode
// 5. Go to the "Rules" tab of Firestore and paste the rules from firestore.rules.txt (included in this project)

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

// ⚠️ REPLACE these values with your own Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyArtpIWVLz51Owf7UWd-rgWInIZBmA_Oj0",
  authDomain: "cheema-home-healthcare.firebaseapp.com",
  projectId: "cheema-home-healthcare",
  storageBucket: "cheema-home-healthcare.firebasestorage.app",
  messagingSenderId: "163945894763",
  appId: "1:163945894763:web:47537997e6307cd3cd722e",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export { signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut };

// Generic helpers used by the booking + nurse collections
export function listenToCollection(name, callback, onError) {
  const q = query(collection(db, name), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      callback(items);
    },
    (err) => {
      console.error(`Error listening to ${name}:`, err);
      if (onError) onError(err);
    }
  );
}

export async function addToCollection(name, data) {
  const ref = await addDoc(collection(db, name), {
    ...data,
    createdAt: serverTimestamp(),
    createdAtMs: Date.now(),
  });
  return ref.id;
}

export async function updateInCollection(name, id, patch) {
  await updateDoc(doc(db, name, id), patch);
}

export async function deleteFromCollection(name, id) {
  await deleteDoc(doc(db, name, id));
}
