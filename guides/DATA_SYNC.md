# Data Sync Guide

## Overview

Your app uses **Google Sheets as the source of truth** for vocabulary data. However, local JSON files are used as fallback when Sheets is unavailable. This guide explains how to keep them in sync.

## The Problem

When you answer questions:
- ✅ Google Sheets gets updated immediately
- ❌ Local JSON files (`data/dutch.json`, `data/kanji.json`) do NOT auto-update
- ⚠️ Over time, local files become stale

## The Solution

### 1. Code Changes (Already Applied)

The app now prioritizes data sources correctly:

1. **Memory cache** - Instant (current session)
2. **localStorage cache** - Fast (~10ms, 24-hour expiry)
3. **Google Sheets** - If no cache, fetch from Sheets (prevents stale data)
4. **Backend API** - Only used if Sheets not configured

**Key improvement**: The app now **waits for Google Sheets** on first load instead of falling back to potentially stale backend data.

### 2. Manual Sync Command

When you want to update local files with latest Sheets data:

```bash
npm run sync
```

Or directly:

```bash
node scripts/sync-from-sheets.js
```

This downloads fresh data from Google Sheets and updates:
- `data/dutch.json`
- `data/kanji.json`
- `data/dutch-for-sheets.csv`
- `data/kanji-for-sheets.csv`

### 3. When to Sync

Run `npm run sync` in these situations:

- **Before deploying** - Ensures backend has latest data
- **After many practice sessions** - Backup your progress to local files
- **When sharing the repo** - So others get your latest vocabulary stats
- **If you notice stale data** - Though this should be rare now

## How It Works Now

### On App Startup

```
1. Check memory cache → If available, use it (instant!)
2. If no memory cache → Fetch from Google Sheets (always fresh)
3. No localStorage cache → Prevents stale data issues
```

### When You Answer a Question

```
1. Update Google Sheets ✅
2. Update memory cache ✅
3. Local JSON files → NOT updated (manual sync needed)
```

**Note**: localStorage cache has been **disabled** to prevent stale data issues. The app now always fetches fresh data from Google Sheets on page load.

### Why Local Files Still Matter

- **Backend API fallback** - If Sheets is down or not configured
- **Development** - Can work offline with cached data
- **Deployment** - Vercel/production can serve data without Sheets API calls
- **Backup** - Version-controlled snapshot of your vocabulary

## Cache Hierarchy

| Cache Type | Speed | Freshness | Persistence | Status |
|------------|-------|-----------|-------------|--------|
| Memory | Instant | Current session | Until page refresh | ✅ Active |
| ~~localStorage~~ | ~~10ms~~ | ~~24 hours~~ | ~~Survives refresh~~ | ❌ Disabled |
| Google Sheets | ~500ms | Always fresh | Permanent | ✅ Active |
| Local JSON | ~100ms | Manual sync | Version controlled | ✅ Fallback only |

## Troubleshooting

### "App starts with old stats"

**Cause**: Memory cache from previous session or stale local JSON files  
**Solution**: Refresh the page (clears memory cache) or run `npm run sync` to update local files

### "Sync script fails"

**Cause**: Google Apps Script URL not configured  
**Solution**: Check `.env` file has `REACT_APP_GOOGLE_APPS_SCRIPT_URL`

### "Different stats in Sheets vs App"

**Cause**: Background refresh hasn't completed yet  
**Solution**: Wait a few seconds, or refresh the page

## Best Practices

1. **Sync before deploying** - Run `npm run sync` before `npm run deploy`
2. **Trust Google Sheets** - It's always the source of truth
3. **Commit synced files** - So your progress is backed up in git
4. **Refresh on issues** - Simple page refresh fetches fresh data

## Technical Details

### Memory Cache Only

- **In-memory cache** - Fast access during current session
- **Cleared on page refresh** - Ensures fresh data on reload
- **No persistence** - Prevents stale data between sessions
- **Updated live** - When you answer questions, cache updates immediately

### Files Updated by Sync

- `data/dutch.json` - Dutch vocabulary (backend API source)
- `data/kanji.json` - Kanji vocabulary (backend API source)
- `data/dutch-for-sheets.csv` - CSV export for reference
- `data/kanji-for-sheets.csv` - CSV export for reference
