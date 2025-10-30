# Quick Deployment Steps

## 1. Deploy Backend to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy backend
vercel --prod
```

**Save the URL you get** (e.g., `https://nihongo-backend-xxx.vercel.app`)

---

## 2. Update Frontend Configuration

Edit `.env.production` and replace with your actual Vercel URL:
```
REACT_APP_API_BASE_URL=https://your-actual-backend-url.vercel.app
```

---

## 3. Deploy Frontend to GitHub Pages

```bash
# Commit your changes
git add .
git commit -m "Configure for deployment"
git push origin main

# Deploy to GitHub Pages
npm run deploy
```

---

## 4. Enable GitHub Pages

1. Go to: https://github.com/mesutdurukal/nihongoV3/settings/pages
2. Under **Source**, select **gh-pages** branch
3. Click **Save**

---

## 5. Access Your App

Frontend: `https://mesutdurukal.github.io/nihongoV3`
Backend: `https://your-backend-url.vercel.app`

---

## Notes

- The backend data files (kanji.json, dutch.json) will be deployed to Vercel
- Stats will persist on Vercel's file system (but may reset on redeployment)
- For permanent data persistence, consider using a database in the future
- CORS is configured to allow requests from your GitHub Pages domain
