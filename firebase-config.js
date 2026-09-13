/* ============================================================
   FIREBASE CONFIGURATION - PM SHRI Kendrashala Khandala
   ------------------------------------------------------------
   1. Go to https://console.firebase.google.com/
   2. Create a project (e.g. "khandala-school-site")
   3. Click the "</>" (Web) icon to register a web app
   4. Copy the config object Firebase gives you and paste the
      values below, replacing the placeholders.
   5. In the Firebase Console, enable:
        - Authentication > Sign-in method > Email/Password
          (this is how staff will log in to the dashboard)
        - Firestore Database > Create database (start in test
          mode for development, then apply firestore.rules
          before going live)
   ============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyAFGxlwZDOODbP1zk1rv4HLFAx0nvfpzZg",
  authDomain: "zpschool-eaafb.firebaseapp.com",
  projectId: "zpschool-eaafb",
  storageBucket: "zpschool-eaafb.appspot.com",
  messagingSenderId: "779454499614",
  appId: "1:779454499614:web:db3b7a17d18342f2da570f"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
