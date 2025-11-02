# Migration from Google Drive to Google Sheets

This guide will help you migrate from Google Drive JSON storage to Google Sheets for more efficient updates.

## Why Migrate?

**Google Drive JSON:**
- ❌ Sends entire file (1MB for 5K words) on every update
- ❌ 300MB+ bandwidth per study session
- ❌ Slow for large vocabularies

**Google Sheets:**
- ✅ Granular updates (~200 bytes per word)
- ✅ ~10KB bandwidth per study session
- ✅ Scales to 5K+ words efficiently
- ✅ Easy to view/edit data manually

## Prerequisites

- Google account
- Your existing vocabulary data (from `data/dutch.json` and `data/kanji.json`)

## Step 1: Create Google Sheets (10 min)

### 1.1 Create a new Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Vocabulary App Data"

### 1.2 Create Dutch sheet

1. Rename "Sheet1" to "Dutch"
2. Add headers in row 1:
   ```
   A: id | B: dutch | C: en | D: category | E: d2e_correct | F: d2e_total | G: d2e_percentage | H: e2d_correct | I: e2d_total | J: e2d_percentage
   ```
3. Import your data from `data/dutch.json`

### 1.3 Create Kanji sheet

1. Create a new sheet named "Kanji"
2. Add headers in row 1:
   ```
   A: id | B: kanji | C: en | D: category | E: k2e_correct | F: k2e_total | G: k2e_percentage
   ```
3. Import your data from `data/kanji.json`

### 1.4 Create Stats sheets

**DutchStats sheet:**
```
Row 1: Label | Value | Total | Record
Row 2: Size | 100 | | 
Row 3: Global | 0 | 0 | 0
Row 4: Local | 0 | 0 | 0
```

**KanjiStats sheet:**
```
Row 1: Label | Value | Total | Record
Row 2: Size | 979 | | 
Row 3: Global | 0 | 0 | 0
Row 4: Local | 0 | 0 | 0
```

## Step 2: Deploy Apps Script (5 min)

### 2.1 Open Apps Script

1. In your spreadsheet, click **Extensions** → **Apps Script**
2. Delete the default `myFunction()` code

### 2.2 Copy the code

1. Copy all code from `google-apps-script/Code.gs`
2. Paste into the Apps Script editor
3. Save (Ctrl+S or Cmd+S)

### 2.3 Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ → Select **Web app**
3. Configure:
   - **Description:** "Vocabulary API"
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/ABC123.../exec`)
6. Click **Authorize access** if prompted

## Step 3: Update Environment Variables (2 min)

### 3.1 Local development

Edit `.env`:
```bash
# Add this line with your Apps Script URL
REACT_APP_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### 3.2 Production

Edit `.env.production`:
```bash
# Add this line with your Apps Script URL
REACT_APP_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

## Step 4: Test Locally (5 min)

1. Start the app:
   ```bash
   npm start
   ```

2. Check browser console for:
   - ✅ `Loaded data from Google Sheets`
   - ✅ `Updated word in Google Sheets`
   - ✅ `Updated stats in Google Sheets`

3. Answer a few questions and verify:
   - Stats update in the Sheets
   - No errors in console

## Step 5: Deploy to Production (2 min)

```bash
npm run deploy
```

## Verification

### Check bandwidth savings

**Before (Drive):**
- Open browser DevTools → Network tab
- Answer 10 questions
- Look for requests to `googleapis.com/upload/drive`
- Each ~1MB

**After (Sheets):**
- Open browser DevTools → Network tab
- Answer 10 questions
- Look for requests to `script.google.com`
- Each ~200 bytes

### Expected console logs

```
📦 Loaded data from Google Sheets
✅ Updated word in Google Sheets
✅ Updated stats in Google Sheets
```

## Troubleshooting

### "No Apps Script URL configured"

- Make sure `REACT_APP_GOOGLE_APPS_SCRIPT_URL` is set in `.env`
- Restart the dev server after changing `.env`

### "Failed to update Sheets, falling back to backend"

- Check the Apps Script deployment is set to "Anyone" access
- Verify the URL is correct
- Check Apps Script logs: **Executions** tab in Apps Script editor

### CORS errors

- Apps Script automatically handles CORS
- If you see CORS errors, redeploy the Apps Script

### Data not updating

- Check sheet names match exactly: `Dutch`, `Kanji`, `DutchStats`, `KanjiStats`
- Verify column structure matches the guide
- Check Apps Script logs for errors

## Rollback to Drive (if needed)

If you need to rollback:

1. Comment out the Sheets URL in `.env`:
   ```bash
   # REACT_APP_GOOGLE_APPS_SCRIPT_URL=...
   ```

2. Uncomment the Drive configuration:
   ```bash
   REACT_APP_GOOGLE_DRIVE_FILE_ID_DUTCH=...
   REACT_APP_GOOGLE_DRIVE_FILE_ID_KANJI=...
   ```

3. Update imports in `ApiHandler.js`:
   ```javascript
   import { readFromDrive, writeToDrive, getSavedAccessToken } from './GoogleDriveAPI';
   ```

## Benefits Summary

| Metric | Drive | Sheets | Improvement |
|--------|-------|--------|-------------|
| Update size | 1MB | 200 bytes | **5000x smaller** |
| 30-min session | 300MB | 10KB | **30,000x less** |
| Scalability | Poor (5K+ words) | Excellent | ✅ |
| Manual editing | Difficult | Easy | ✅ |

## Next Steps

- Monitor Apps Script quota (free tier: 20,000 calls/day)
- Consider upgrading to Google Workspace if you hit limits
- Keep local JSON files as backup
