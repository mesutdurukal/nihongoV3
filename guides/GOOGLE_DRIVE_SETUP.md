# Google Drive JSON Setup (3 minutes)

Sync your vocabulary stats across all devices using a JSON file on Google Drive.

## Step 1: Upload JSON to Google Drive (1 min)

1. Go to [Google Drive](https://drive.google.com)
2. Upload your `data/dutch.json` file
3. Right-click the file → **Get link**
4. Change to **"Anyone with the link can view"**
5. Copy the link (looks like: `https://drive.google.com/file/d/FILE_ID/view`)
6. Extract the `FILE_ID` from the URL

## Step 2: Enable Google Drive API (1 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google Drive API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

## Step 3: Create API Key (30 sec)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. (Recommended) Click "Restrict Key":
   - API restrictions: Select "Google Drive API"
   - Save

## Step 4: Configure Your App (30 sec)

Create/update `.env` file in project root:

```env
REACT_APP_GOOGLE_DRIVE_FILE_ID=your_file_id_here
REACT_APP_GOOGLE_API_KEY=your_api_key_here
```

For production (GitHub Pages), add these as repository secrets.

## Step 5: Test It!

```bash
npm start
```

Your app will now:
- ✅ Load vocabulary from Google Drive on startup
- ✅ Work offline with cached data
- ✅ Sync across all devices when online

## How It Works

### Read-Only Mode (Default)
- Uses API key to read the JSON file
- No sign-in required
- Perfect for single-user use
- Stats update locally only

### Read-Write Mode (Optional - requires OAuth)
To enable writing back to Google Drive:
1. Set up OAuth (see OAUTH_SETUP.md)
2. Add "Sign in with Google" button
3. Stats will sync back to Drive

## Advantages

✅ **Simple** - Just one JSON file  
✅ **Fast** - Direct file access  
✅ **Familiar** - Same format as your local file  
✅ **Portable** - Download anytime  
✅ **Version history** - Google Drive keeps versions  

## Manual Updates

To update vocabulary:
1. Download `dutch.json` from Google Drive
2. Edit locally
3. Upload back to Google Drive (replace file, keep same FILE_ID)
4. Refresh your app

## Troubleshooting

**"Failed to load from Drive"**
- Check FILE_ID is correct
- Verify file sharing is set to "Anyone with link"
- Ensure API key is valid

**"CORS error"**
- This is normal for writes without OAuth
- Read-only mode works fine
- For writes, implement OAuth (optional)
