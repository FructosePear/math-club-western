# Math Club Western

A simple math club website with Problem of the Week challenges.

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Firebase**
   - Copy `env.example` to `.env`
   - Add your Firebase config to `.env`

3. **Run locally**
   ```bash
   npm run dev
   ```

4. **Open** `http://localhost:8080`

## Deployment

### Firebase Hosting

1. **Install Firebase CLI** (if not already installed)
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Build the app**
   ```bash
   npm run build
   ```

4. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

5. **Your app will be live at:** (find url in firebase hosting)


## Features

- Problem of the Week with countdown timer
- User login/signup with email verification
- Admin panel for puzzle management
- User dashboard to track submissions

## Tech

- React + TypeScript + Vite
- Firebase Auth + Firestore
- Tailwind CSS + shadcn/ui

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
