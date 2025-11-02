# Google Sheets Setup for Cross-Device Sync

This guide will help you set up Google Sheets as a backend for syncing your vocabulary stats across devices.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Nihongo V3 - Dutch Vocabulary"
4. Create two sheets:
   - **Dutch** - for vocabulary data
   - **Stats** - for global stats

### Dutch Sheet Structure:
| ID | Dutch | English | Category | Dutch2En Correct | Dutch2En Total | Dutch2En % | En2Dutch Correct | En2Dutch Total | En2Dutch % |
|----|-------|---------|----------|------------------|----------------|------------|------------------|----------------|------------|
| 1  | hallo | hello   | basics   | 5                | 7              | 0.71       | 0                | 0              | 0          |

### Stats Sheet Structure:
| Type   | Correct | Total | Record |
|--------|---------|-------|--------|
| Global | 100     | 150   | 15     |
| Local  | 10      | 12    | 5      |

## Step 2: Get Sheet ID

1. Open your Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
3. Copy the `YOUR_SHEET_ID` part

## Step 3: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

## Step 4: Create API Key (for reading)

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key
4. (Optional) Restrict the key to only Google Sheets API

## Step 5: Make Sheet Public (for reading with API key)

1. Open your Google Sheet
2. Click "Share" button
3. Change to "Anyone with the link can view"
4. This allows reading with just an API key

## Step 6: Set up OAuth (for writing)

For writing data, you need OAuth:

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://mesutdurukal.github.io`
5. Copy the Client ID

## Step 7: Configure Your App

Create a `.env` file in your project root:

```env
REACT_APP_GOOGLE_SHEET_ID=your_sheet_id_here
REACT_APP_GOOGLE_API_KEY=your_api_key_here
REACT_APP_GOOGLE_CLIENT_ID=your_oauth_client_id_here
```

For production (GitHub Pages), add these as repository secrets:
1. Go to your GitHub repo > Settings > Secrets and variables > Actions
2. Add each variable as a secret

## Step 8: Initial Data Import

Run this script to populate your Google Sheet with initial data:

```bash
npm run import-to-sheets
```

## Alternative: Simpler Approach with Google Apps Script

If OAuth seems complex, you can use Google Apps Script as a simple API:

1. Open your Google Sheet
2. Go to Extensions > Apps Script
3. Create a web app that accepts POST requests
4. Deploy as web app with "Anyone" access
5. Use the web app URL as your API endpoint

This avoids OAuth complexity but is less secure (anyone with URL can write).

## Testing

After setup, your app will:
- ✅ Read vocabulary from Google Sheets on load
- ✅ Write stats updates to Google Sheets
- ✅ Sync across all your devices automatically
- ✅ Allow manual editing in Google Sheets

## Troubleshooting

**"API key not valid"**: Make sure the API key is enabled for Google Sheets API

**"Permission denied"**: Make sure the sheet is shared publicly for viewing

**"CORS error"**: This is expected for writes without OAuth. Use the Apps Script approach instead.
