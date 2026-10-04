/* ==========================================================================
   Firebase initialization
   Replace the values below with YOUR Firebase project's config
   (Firebase Console -> Project settings -> General -> Your apps -> SDK setup)
   ========================================================================== */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Uses the Firebase compat SDKs loaded via <script> tags in each HTML file
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
