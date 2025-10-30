# Deployment Guide

## Backend Deployment (Vercel)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy Backend
```bash
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Choose your account
- Link to existing project? **N**
- What's your project's name? **nihongo-backend** (or any name you prefer)
- In which directory is your code located? **./**
- Want to override the settings? **N**

After deployment, Vercel will give you a URL like: `https://nihongo-backend-xxx.vercel.app`

### Step 4: Update CORS in server.js
After getting your GitHub Pages URL, update the CORS configuration in `server.js` to allow requests from your frontend:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://mesutdurukal.github.io'
];
```

Redeploy with `vercel --prod` after making this change.

---

## Frontend Deployment (GitHub Pages)

### Step 1: Update Backend URL
Edit `.env.production` and replace the placeholder with your actual Vercel backend URL:
```
REACT_APP_API_BASE_URL=https://your-actual-backend-url.vercel.app
```

### Step 2: Commit and Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 3: Deploy to GitHub Pages
```bash
npm run deploy
```

This will:
1. Build the production version of your app
2. Deploy it to the `gh-pages` branch
3. Make it available at: `https://mesutdurukal.github.io/nihongoV3`

### Step 4: Enable GitHub Pages
1. Go to your GitHub repository
2. Click on **Settings**
3. Scroll down to **Pages** section
4. Under **Source**, select **gh-pages** branch
5. Click **Save**

Your app should be live in a few minutes!

---

## Testing the Deployment

1. Visit your GitHub Pages URL: `https://mesutdurukal.github.io/nihongoV3`
2. The app should load and connect to your Vercel backend
3. Test both Kanji and Dutch modes
4. Check that stats are being saved correctly

---

## Troubleshooting

### CORS Errors
If you see CORS errors in the browser console:
1. Make sure your frontend URL is added to `allowedOrigins` in `server.js`
2. Redeploy the backend with `vercel --prod`

### Backend Not Responding
1. Check Vercel logs: `vercel logs`
2. Make sure `vercel.json` is in the root directory
3. Verify the backend URL in `.env.production` is correct

### Frontend Not Loading
1. Check that the `homepage` in `package.json` matches your GitHub Pages URL
2. Make sure you've enabled GitHub Pages in repository settings
3. Try clearing browser cache

---

## Updating After Deployment

### Update Backend
```bash
# Make your changes to server.js or data files
vercel --prod
```

### Update Frontend
```bash
# Make your changes to React components
npm run deploy
```

---

## Environment Variables

### Local Development
Create a `.env.local` file (not committed to git):
```
REACT_APP_API_BASE_URL=http://localhost:8080
```

### Production
Edit `.env.production` with your Vercel backend URL:
```
REACT_APP_API_BASE_URL=https://your-backend.vercel.app
```
