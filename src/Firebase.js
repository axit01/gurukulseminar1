import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'

// Firebase configuration using Vite env vars. Set these in your .env file.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY,
  authDomain: import.meta.env.VITE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_PROJECTID,
  storageBucket: import.meta.env.VITE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_APPID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export async function saveRegistration(data) {
  const docRef = await addDoc(collection(db, 'registrations'), {
    ...data,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export { app, db }