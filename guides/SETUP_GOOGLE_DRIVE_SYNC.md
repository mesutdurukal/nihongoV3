# Google Drive Sync Setup - Complete Guide

This will enable **full sync** of your vocabulary stats across all devices (PC, mobile, etc.)

## What You'll Get

✅ Stats sync across all devices  
✅ Answer on PC, see stats on mobile instantly  
✅ Automatic backup to Google Drive  
✅ Works offline, syncs when online  

## Setup (10 minutes)

### Step 1: Upload JSON to Google Drive (2 min)

1. Go to [Google Drive](https://drive.google.com)
2. Upload `data/dutch.json`
3. Right-click → **Share** → Change to **"Anyone with the link can view"**
4. Copy the link: `https://drive.google.com/file/d/FILE_ID_HERE/view`
5. Extract the `FILE_ID_HERE` part

### Step 2: Enable Google Drive API (3 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: "Nihongo V3"
3. Go to **"APIs & Services" > "Library"**
4. Search and enable: **"Google Drive API"**

### Step 3: Create API Key (1 min)

1. Go to **"APIs & Services" > "Credentials"**
2. Click **"Create Credentials" > "API Key"**
3. Copy the key
4. Click **"Restrict Key"**:
   - API restrictions: **"Google Drive API"**
   - Save

### Step 4: Create OAuth Client ID (3 min)

1. Still in **"Credentials"**, click **"Create Credentials" > "OAuth 2.0 Client ID"**
2. If prompted, configure consent screen:
   - User Type: **External**
   - App name: "Nihongo V3"
   - User support email: your email
   - Developer contact: your email
   - Save
3. Create OAuth client:
   - Application type: **Web application**
   - Name: "Nihongo V3 Web"
   - Authorized JavaScript origins:
     - `http://localhost:3000`
     - `https://mesutdurukal.github.io`
   - Click **Create**
4. Copy the **Client ID**

### Step 5: Configure Your App (1 min)

Create `.env` file in project root:

```env
REACT_APP_GOOGLE_DRIVE_FILE_ID=your_file_id_here
REACT_APP_GOOGLE_API_KEY=your_api_key_here
REACT_APP_GOOGLE_CLIENT_ID=your_oauth_client_id_here
```

### Step 6: Test Locally

```bash
npm start
```

You should see:
- **"Sign in with Google"** button in top-right
- Click it, sign in
- After signing in, it shows **"☁️ Synced"**
- Answer questions - stats save to Google Drive!

### Step 7: Deploy to Production

Add secrets to GitHub:
1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Add three secrets:
   - `REACT_APP_GOOGLE_DRIVE_FILE_ID`
   - `REACT_APP_GOOGLE_API_KEY`
   - `REACT_APP_GOOGLE_CLIENT_ID`

Update your build workflow to use these secrets.

## How It Works

```
┌──────────────────────────────────────┐
│         Google Drive                 │
│         dutch.json                   │
│  (Your single source of truth)       │
└────────────┬─────────────────────────┘
             │
             │ OAuth (read/write)
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌─────▼───┐
│   PC   │      │ Mobile  │
│  App   │      │   App   │
└────────┘      └─────────┘
```

1. **Sign in once** on each device
2. **Answer questions** - stats update in memory
3. **Auto-save to Drive** after each answer
4. **Other devices** load latest from Drive
5. **All devices stay in sync!**

## Usage

### First Time on New Device
1. Open app
2. Click "Sign in with Google"
3. Allow access to Drive
4. Done! Stats are synced

### Daily Use
- Just use the app normally
- Stats automatically sync
- No manual saving needed
- Works offline, syncs when online

## Troubleshooting

**"Sign in button doesn't appear"**
- Check `.env` file has `REACT_APP_GOOGLE_CLIENT_ID`
- Restart dev server after adding `.env`

**"Failed to load from Drive"**
- Check FILE_ID is correct
- Verify file is shared ("Anyone with link")
- Check API key is valid

**"Failed to save to Drive"**
- Make sure you signed in (not just viewing)
- Check OAuth client ID is correct
- Try signing out and back in

**"CORS error"**
- This is normal if not signed in
- Sign in to enable write access
- Read-only mode works without sign-in

## Security Notes

- ✅ OAuth tokens stored locally (per device)
- ✅ Tokens expire after 1 hour (auto-refresh)
- ✅ Only you can access your Drive file
- ✅ API key only allows reading public files
- ✅ No passwords stored

## Manual Backup

To backup your data:
1. Go to Google Drive
2. Download `dutch.json`
3. Keep it safe!

To restore:
1. Upload your backup to Drive
2. Update FILE_ID in `.env`
3. Restart app

## Advanced: Multiple Users

Each user should:
1. Upload their own `dutch.json` to their Drive
2. Use their own FILE_ID
3. Sign in with their Google account

Data stays separate per user.
