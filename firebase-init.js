 // Firebase Project Configuration
window.FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDt8Sz-UU709DT_f7mMwj8k_wFXAQgYins',
  authDomain: 'hopicrunch.firebaseapp.com',
  projectId: 'hopicrunch',
  storageBucket: 'hopicrunch.firebasestorage.app',
  messagingSenderId: '524680575152',
  appId: '1:524680575152:web:7726c4d4de19b552a62375',
  measurementId: 'G-EQE27WWQWE'
};

// Default to false until connection is verified
window.remoteDbEnabled = false;
window.firebaseDb = null;

function initFirebase() {
  try {
    // Verify Firebase SDKs are loaded in window
    if (
      window.FIREBASE_CONFIG.apiKey && 
      window.FIREBASE_CONFIG.projectId && 
      window.firebase && 
      window.firebase.firestore
    ) {
      if (!window.firebase.apps || !window.firebase.apps.length) {
        window.firebase.initializeApp(window.FIREBASE_CONFIG);
      }
      
      window.firebaseDb = window.firebase.firestore();
      window.remoteDbEnabled = true; // OFFICIALLY TURN ON REMOTE SYNC
      console.log('✅ Firebase successfully connected! Cross-network sync is active.');
    } else {
      console.warn('⚠️ Firebase SDKs not found yet. Waiting for scripts to load...');
    }
  } catch (error) {
    console.error('❌ Firebase initialization error:', error);
    window.remoteDbEnabled = false;
    window.firebaseDb = null;
  }
}

// 1. Initial attempt
initFirebase();

// 2. Retry when the DOM content finishes loading (Fixes CDN race conditions)
if (!window.remoteDbEnabled) {
  document.addEventListener('DOMContentLoaded', initFirebase);
}
