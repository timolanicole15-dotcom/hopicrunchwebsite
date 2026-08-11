// Replace these placeholder values with your Firebase project configuration.
// You can find them in the Firebase console under Project settings.
window.FIREBASE_CONFIG = {
  apiKey: '<YOUR_API_KEY>',
  authDomain: '<YOUR_AUTH_DOMAIN>',
  projectId: '<YOUR_PROJECT_ID>',
  storageBucket: '<YOUR_STORAGE_BUCKET>',
  messagingSenderId: '<YOUR_MESSAGING_SENDER_ID>',
  appId: '<YOUR_APP_ID>'
};

window.remoteDbEnabled = false;
window.firebaseDb = null;

function initFirebase() {
  try {
    if (window.FIREBASE_CONFIG.apiKey && window.FIREBASE_CONFIG.projectId && window.firebase && window.firebase.firestore) {
      if (!window.firebase.apps || !window.firebase.apps.length) {
        window.firebase.initializeApp(window.FIREBASE_CONFIG);
      }
      window.firebaseDb = window.firebase.firestore();
      window.remoteDbEnabled = true;
    }
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
    window.remoteDbEnabled = false;
    window.firebaseDb = null;
  }
}

initFirebase();
