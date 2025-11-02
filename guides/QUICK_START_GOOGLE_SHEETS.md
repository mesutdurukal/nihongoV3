# Quick Start: Google Sheets Sync (5 minutes)

## Step 1: Export Your Data (1 min)

```bash
node scripts/export-to-sheets-csv.js
```

This creates two CSV files in `data/`:
- `dutch-for-sheets.csv` - your vocabulary
- `stats-for-sheets.csv` - your stats

## Step 2: Create Google Sheet (2 min)

1. Go to [Google Sheets](https://sheets.google.com)
2. Create new spreadsheet: "Nihongo V3 - Dutch"
3. Create two sheets (tabs at bottom):
   - Rename "Sheet1" to "Dutch"
   - Add new sheet, name it "Stats"

## Step 3: Import Data (1 min)

### Import Dutch vocabulary:
1. Go to "Dutch" sheet
2. File > Import > Upload
3. Select `dutch-for-sheets.csv`
4. Import location: "Replace current sheet"
5. Click "Import data"

### Import Stats:
1. Go to "Stats" sheet
2. File > Import > Upload
3. Select `stats-for-sheets.csv`
4. Import location: "Replace current sheet"
5. Click "Import data"

## Step 4: Set Up Apps Script API (1 min)

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Delete the default code
3. Copy the code from `google-apps-script/Code.gs`
4. Paste it into the Apps Script editor
5. Click **Deploy > New deployment**
6. Choose type: **Web app**
7. Settings:
   - Execute as: **Me**
   - Who has access: **Anyone**
8. Click **Deploy**
9. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/...../exec`)

## Step 5: Configure Your App (30 sec)

Create `.env` file in project root:

```env
REACT_APP_GOOGLE_SHEETS_URL=your_web_app_url_here
```

For production, add this to your GitHub repository secrets.

## Step 6: Test It!

```bash
npm start
```

Your app will now:
- ✅ Load vocabulary from Google Sheets
- ✅ Save stats to Google Sheets
- ✅ Sync across all devices automatically!

## Verify It's Working

1. Answer a question on your PC
2. Check your Google Sheet - stats should update
3. Open app on mobile - you'll see the same stats!

## Manual Editing

You can now edit vocabulary directly in Google Sheets:
- Add new words
- Fix translations
- View/edit stats
- Export to Excel if needed

Changes will appear in your app on next load!
