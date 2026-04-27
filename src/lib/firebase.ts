import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Check connection status
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'ping'));
  } catch (error: any) {
    if (error?.message?.includes('Missing or insufficient permissions')) {
       // This is expected for ping if not logged in
       return;
    }
    console.warn("Firestore connectivity check:", error?.message || "Operating in possible offline mode.");
  }
}
testConnection();
