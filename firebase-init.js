// Replace these placeholder values with your Firebase project configuration.
// You can find them in the Firebase console under Project settings.
window.FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDt8Sz-UU709DT_f7mMwj8k_wFXAQgYins',
  authDomain: 'hopicrunch.firebaseapp.com',
  projectId: 'hopicrunch',
  storageBucket: 'hopicrunch.firebasestorage.app',
  messagingSenderId: '524680575152',
  appId: '1:524680575152:web:7726c4d4de19b552a62375',
  measurementId: 'G-EQE27WWQWE'
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
