import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Check connection status without blocking UI
async function testConnection() {
  try {
    // Attempt a silent fetch of a non-existent doc to verify connectivity
    await getDocFromServer(doc(db, 'system', 'ping'));
  } catch (error) {
    // Only log to console, avoid annoying the user with alerts unless strictly necessary
    console.warn("Firestore connectivity check: Operating in possible offline mode or background sync.");
  }
}
testConnection();
