# Cheema Home Healthcare — Deployment Guide

This is a complete React website (booking site + admin dashboard) for
Cheema Home Healthcare. Follow these steps in order to make it live on
the internet with a real working database.

## Step 1 — Create a free Firebase project (the database)

1. Go to https://console.firebase.google.com and sign in with Google.
2. Click **Add project** → name it `cheema-home-healthcare` → continue
   through the steps (you can disable Google Analytics) → **Create project**.
3. Once created, click the **Web icon (`</>`)** to add a web app.
   Name it anything (e.g. "website") → **Register app**.
4. Firebase will show you a `firebaseConfig` object that looks like this:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "cheema-home-healthcare.firebaseapp.com",
     projectId: "cheema-home-healthcare",
     storageBucket: "cheema-home-healthcare.appspot.com",
     messagingSenderId: "...",
     appId: "...",
   };
   ```
   Copy these values.
5. Open `src/firebase.js` in this project and paste your real values into
   the `firebaseConfig` object (replacing the `"YOUR_..."` placeholders).

## Step 2 — Turn on the database

1. In the Firebase console left sidebar, click **Build → Firestore Database**.
2. Click **Create database** → choose a location close to you → start in
   **Production mode** → **Enable**.
3. Go to the **Rules** tab and replace the contents with what's in
   `firestore.rules.txt` (included in this project) → click **Publish**.
   (This lets the booking form and admin dashboard read/write data.)

## Step 3 — Test it locally (optional but recommended)

If you have Node.js installed on your computer:
```bash
npm install
npm run dev
```
This opens the site at `http://localhost:5173`. Try submitting a booking,
then check the **Staff** tab (passcode: `cheema786`) to see it appear.
You can also check the Firebase console → Firestore Database → you should
see a `bookings` collection with your test entry.

## Step 4 — Deploy it live with Vercel (free)

**Easiest way — no command line needed:**

1. Go to https://vercel.com and sign up (you can sign up with GitHub,
   Google, or email).
2. Put this project's folder into a GitHub repository:
   - Go to https://github.com/new, create a repository (e.g. `cheema-home-healthcare`).
   - Upload all the files from this project folder into that repository
     (GitHub's web uploader lets you drag-and-drop files — use "Add file → Upload files").
3. Back in Vercel, click **Add New → Project**, select your GitHub
   repository, and click **Deploy**. Vercel automatically detects this is
   a Vite + React project and builds it.
4. After a minute, Vercel gives you a live URL like
   `https://cheema-home-healthcare.vercel.app` — this is your real,
   working website.

## Step 5 — Connect your own domain (optional)

If you buy a domain (e.g. from Namecheap, GoDaddy, or a local registrar):
1. In Vercel, open your project → **Settings → Domains** → add your domain.
2. Vercel will show you DNS records to add at your domain registrar.
3. Once added, your site will be live at your own domain
   (e.g. `www.cheemahomehealthcare.com`).

## Things to update before sharing with real patients

- [ ] Replace the WhatsApp/Call number in `src/App.jsx` if it changes
      (`PLACEHOLDER_PHONE_DISPLAY` and `PLACEHOLDER_PHONE_WA`)
- [ ] Change the admin passcode `ADMIN_CODE` in `src/App.jsx` to something
      private, and don't share it publicly
- [ ] Review the Firestore rules — they're currently open (no login
      required) so the site works without an account system. This is fine
      to launch with, but anyone who finds your Firebase project URL could
      technically read the data. For real patient data at scale, add
      Firebase Authentication for the admin dashboard later.

## Notes on "automatic WhatsApp confirmation"

True automatic WhatsApp sending (without admin clicking anything) requires
the official WhatsApp Business API, which needs a Meta Business account
and approval — not something that can be wired up for free instantly.
What's included here is the next best thing: a one-click "Send WhatsApp
confirmation" button in the admin dashboard that opens WhatsApp with the
message already written, so the admin just hits send.
