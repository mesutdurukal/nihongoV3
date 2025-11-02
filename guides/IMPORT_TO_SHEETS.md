# Import Data to Google Sheets

This guide shows you how to import your existing vocabulary data into Google Sheets.

## Step 1: Generate CSV Files (Already Done!)

The CSV files have been created in the `data/` folder:
- ✅ `kanji-for-sheets.csv` (979 entries)
- ✅ `kanji-stats-for-sheets.csv`
- ✅ `dutch-for-sheets.csv` (100 entries)
- ✅ `dutch-stats-for-sheets.csv`

## Step 2: Create Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **Blank** to create a new spreadsheet
3. Name it "Vocabulary App Data"

## Step 3: Import Kanji Data

### 3.1 Import Kanji Words

1. In your spreadsheet, rename "Sheet1" to **"Kanji"**
2. Click **File** → **Import**
3. Click **Upload** tab
4. Drag and drop `data/kanji-for-sheets.csv` or click **Browse** to select it
5. Configure import:
   - **Import location:** Replace current sheet
   - **Separator type:** Comma
   - **Convert text to numbers, dates, and formulas:** Yes (checked)
6. Click **Import data**

You should now see 979 kanji entries with columns:
```
id | kanji | en | category | k2e_correct | k2e_total | k2e_percentage
```

### 3.2 Import Kanji Stats

1. Click the **+** button at the bottom to create a new sheet
2. Name it **"KanjiStats"**
3. Click **File** → **Import**
4. Upload `data/kanji-stats-for-sheets.csv`
5. Configure import:
   - **Import location:** Replace current sheet
   - **Separator type:** Comma
6. Click **Import data**

You should see:
```
Label  | Value | Total | Record
Size   | 979   |       |
Global | 0     | 0     | 0
Local  | 0     | 0     | 0
```

## Step 4: Import Dutch Data

### 4.1 Import Dutch Words

1. Create a new sheet named **"Dutch"**
2. Click **File** → **Import**
3. Upload `data/dutch-for-sheets.csv`
4. Configure import:
   - **Import location:** Replace current sheet
   - **Separator type:** Comma
5. Click **Import data**

You should see 100 Dutch entries with columns:
```
id | dutch | en | category | d2e_correct | d2e_total | d2e_percentage | e2d_correct | e2d_total | e2d_percentage
```

### 4.2 Import Dutch Stats

1. Create a new sheet named **"DutchStats"**
2. Click **File** → **Import**
3. Upload `data/dutch-stats-for-sheets.csv`
4. Configure import:
   - **Import location:** Replace current sheet
   - **Separator type:** Comma
5. Click **Import data**

## Step 5: Verify Sheet Names

Make sure your spreadsheet has exactly these sheet names (case-sensitive):
- ✅ **Kanji**
- ✅ **KanjiStats**
- ✅ **Dutch**
- ✅ **DutchStats**

## Step 6: Deploy Apps Script

1. In your spreadsheet, click **Extensions** → **Apps Script**
2. Delete the default `myFunction()` code
3. Copy all code from `google-apps-script/Code.gs`
4. Paste into the Apps Script editor
5. Click **Save** (💾 icon or Ctrl+S)
6. Click **Deploy** → **New deployment**
7. Click the gear icon ⚙️ → Select **Web app**
8. Configure:
   - **Description:** "Vocabulary API"
   - **Execute as:** Me
   - **Who has access:** Anyone
9. Click **Deploy**
10. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/ABC123.../exec`)
11. Click **Authorize access** if prompted
12. Review permissions and click **Allow**

## Step 7: Update Environment Variables

### Local Development

Edit `.env`:
```bash
REACT_APP_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Production

Edit `.env.production`:
```bash
REACT_APP_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

## Step 8: Test

1. Start the app locally:
   ```bash
   npm start
   ```

2. Check browser console for:
   - ✅ `Loaded data from Google Sheets`
   - ✅ `Updated word in Google Sheets`
   - ✅ `Updated stats in Google Sheets`

3. Answer a few questions and verify:
   - Stats update in the Google Sheets
   - No errors in console

## Step 9: Deploy

```bash
npm run deploy
```

## Troubleshooting

### "No Apps Script URL configured"
- Make sure you added `REACT_APP_GOOGLE_APPS_SCRIPT_URL` to both `.env` and `.env.production`
- Restart the dev server after changing `.env`

### "Failed to update Sheets"
- Check the Apps Script deployment is set to "Anyone" access
- Verify the URL is correct (should end with `/exec`)
- Check Apps Script logs: **Executions** tab in Apps Script editor

### Data not showing
- Verify sheet names are exactly: `Kanji`, `KanjiStats`, `Dutch`, `DutchStats`
- Check column order matches the CSV headers
- Look at Apps Script logs for errors

### Permission errors
- Re-authorize the Apps Script deployment
- Make sure you clicked "Allow" for all permissions

## Next Steps

Once everything is working:
1. Monitor bandwidth savings in browser DevTools → Network tab
2. Keep local JSON files as backup
3. Consider adding more vocabulary to your sheets
4. The app will now scale efficiently to 5K+ words!

## Regenerate CSV Files (if needed)

If you update your JSON files and need to regenerate the CSVs:

```bash
node scripts/kanji-to-sheets-csv.js
node scripts/dutch-to-sheets-csv.js
```

Then re-import the CSV files to your Google Sheets.
