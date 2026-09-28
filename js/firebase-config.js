/* ==========================================================================
   Firebase initialization (compat SDK loaded via <script> tags in each page)
   ========================================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyAFGxlwZDOODbP1zk1rv4HLFAx0nvfpzZg",
  authDomain: "zpschool-eaafb.firebaseapp.com",
  projectId: "zpschool-eaafb",
  storageBucket: "zpschool-eaafb.firebasestorage.app",
  messagingSenderId: "779454499614",
  appId: "1:779454499614:web:db3b7a17d18342f2da570f"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
