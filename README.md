# Adarsh Vidyalaya — Website + Firebase Admin Dashboard

## What's included
```
adarsh-vidyalaya/
├── index.html          # Public website (hero, academics, facilities, gallery, admission enquiry form)
├── login.html          # Staff/admin login (Firebase Authentication)
├── dashboard.html       # Admin dashboard — lists enquiries live from Firestore
├── css/style.css        # Shared styling (color palette + fonts, see below)
├── js/firebase-config.js  # Your Firebase project keys go here
├── js/main.js            # Handles the enquiry form submission
├── js/dashboard.js       # Auth guard + live Firestore listener for the dashboard
└── assets/zp-logo.png    # Satara Zilla Parishad seal, used as the site logo
```

## Design choices
- **Colors** — pulled straight from the Zilla Parishad seal: maroon `#5C2A0F` (header/footer, headings), saffron `#D2691E` (buttons, accents), cream `#F6E8CC` (soft backgrounds), leaf‑green `#2F6B3A` (stat/timeline sections). All defined as CSS variables at the top of `style.css`, so you can retune them in one place.
- **Fonts** — `Poppins` for headings (matches the bold rounded display face in your mockups) and `Inter` for body copy, loaded from Google Fonts.

## Step 1 — Create a Firebase project
1. Go to https://console.firebase.google.com → **Add project** → name it (e.g. `adarsh-vidyalaya`).
2. Once created, click the **Web** icon (`</>`) to register a web app. Copy the `firebaseConfig` object it gives you.
3. Paste those values into `js/firebase-config.js`, replacing the placeholders.

## Step 2 — Turn on Authentication (for login.html)
1. In the Firebase console: **Build → Authentication → Get started**.
2. Enable the **Email/Password** sign-in method.
3. Under the **Users** tab, manually add the staff accounts who should be able to log in (e.g. principal@school.com), or use the Firebase Admin SDK/CLI to script it.

## Step 3 — Turn on Firestore (for the enquiry form + dashboard)
1. **Build → Firestore Database → Create database** → start in **production mode**.
2. Go to the **Rules** tab and use rules like these (only logged-in staff can read enquiries; anyone can submit one):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /admissionEnquiries/{docId} {
      allow create: if true;                 // public enquiry form
      allow read, update, delete: if request.auth != null;  // staff only
    }
  }
}
```

3. Publish the rules.

## Step 4 — Run it
Because these are plain static files, you can:
- Open `index.html` directly in a browser, **or**
- Serve the folder with any static host (Firebase Hosting, Netlify, GitHub Pages, or `npx serve`).

To deploy on **Firebase Hosting** itself:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting      # choose this folder as the public directory
firebase deploy
```

## How the pieces connect
- The **Admission Enquiry Form** on `index.html` writes a new document to the `admissionEnquiries` collection in Firestore (see `js/main.js`).
- `login.html` signs staff in with Firebase Authentication and redirects to `dashboard.html`.
- `dashboard.html` is guarded — if no one is signed in it bounces back to `login.html` — and then listens live (`onSnapshot`) to the `admissionEnquiries` collection, showing counts and a sortable table.

## Customizing further
- Replace the placeholder phone/email/address in the Contact section of `index.html`.
- Swap the Unsplash stock photos for real campus photos — just replace the `src` attributes with your own image paths.
- Add more collections (e.g. `contactMessages`, `newsletterSignups`) the same way `admissionEnquiries` was built, and add matching tabs in `dashboard.html`/`dashboard.js`.
