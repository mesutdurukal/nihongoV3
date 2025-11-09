# Migration Guide: Removing ID Column from Google Sheets

## What Changed

The app now uses **row numbers** as IDs instead of requiring a separate ID column in your Google Sheets. This means you can freely reorder rows without having to update any ID values!

## Benefits

- ✅ **No more manual ID management** - Just reorder rows as you like
- ✅ **Simpler sheet structure** - One less column to maintain
- ✅ **Automatic IDs** - Row 2 = ID 1, Row 3 = ID 2, etc.

## Migration Steps

### 1. Update Your Google Apps Script

Copy the updated code from `google-apps-script/Code.gs` and paste it into your Google Apps Script project:

1. Go to your Google Sheets
2. Click **Extensions** → **Apps Script**
3. Replace all the code with the updated version from `google-apps-script/Code.gs`
4. Click **Save** (💾 icon)
5. Click **Deploy** → **Manage deployments**
6. Click the **Edit** (✏️) icon on your existing deployment
7. Change **Version** to "New version"
8. Click **Deploy**

### 2. Update Your Google Sheets Structure

You need to **remove the ID column** from your sheets:

#### For Dutch Sheet:
**OLD structure (with ID column):**
```
| ID | Dutch | English | Category | dutch2en_correct | dutch2en_total | ... |
```

**NEW structure (without ID column):**
```
| Dutch | English | Category | dutch2en_correct | dutch2en_total | ... |
```

#### For Kanji Sheet:
**OLD structure (with ID column):**
```
| ID | Kanji | Meaning | Category | kanji2en_correct | kanji2en_total | ... |
```

**NEW structure (without ID column):**
```
| Kanji | Meaning | Category | kanji2en_correct | kanji2en_total | ... |
```

### 3. Steps to Remove ID Column:

1. Open your Google Sheet
2. **Right-click** on column A (the ID column)
3. Select **Delete column**
4. Repeat for both Dutch and Kanji sheets

### 4. Clear Cache

After making these changes, clear your browser's localStorage cache:

1. Open your app in the browser
2. Open Developer Tools (F12 or Cmd+Option+I)
3. Go to **Console** tab
4. Run this command:
   ```javascript
   localStorage.clear()
   ```
5. Refresh the page

## How It Works Now

- **Row 2** in your sheet = **ID 1** in the app
- **Row 3** in your sheet = **ID 2** in the app
- **Row 4** in your sheet = **ID 3** in the app
- And so on...

The header row (Row 1) is always skipped.

## Important Notes

⚠️ **After reordering rows**, the IDs will automatically update based on the new positions. This means:
- Stats are tied to the row position, not the word itself
- If you move a row, its stats move with it
- This is actually what you want - you can reorganize your vocabulary freely!

## Troubleshooting

If you see errors after migration:

1. **Clear localStorage** (see step 4 above)
2. **Verify Apps Script deployment** - Make sure you deployed the new version
3. **Check sheet structure** - Ensure the ID column is completely removed
4. **Check column order** - Make sure columns are in the correct order after removing ID

## Questions?

If something doesn't work, check:
- Console logs in browser DevTools
- Apps Script execution logs (in Apps Script editor, click "Executions")
