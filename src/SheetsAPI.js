// Google Sheets API integration via Apps Script
// This provides granular updates - only update changed rows, not entire file

// Get Apps Script Web App URL from environment
const getAppsScriptUrl = () => {
  return process.env.REACT_APP_GOOGLE_APPS_SCRIPT_URL;
};

// Cache for Sheets data
let sheetsDataCache = null;
let lastSheetsFetch = 0;
const CACHE_DURATION = 5000; // 5 seconds

// Read all data from Google Sheets
async function readFromSheets(language = 'kanji') {
  const url = getAppsScriptUrl();
  
  if (!url) {
    console.warn('No Apps Script URL configured');
    return null;
  }
  
  try {
    const response = await fetch(`${url}?action=getData&language=${language}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Loaded data from Google Sheets');
    return data;
  } catch (error) {
    console.error('Error reading from Google Sheets:', error);
    return null;
  }
}

// Update a single word in Google Sheets (granular update)
async function updateWordInSheets(wordData, language = 'kanji') {
  const url = getAppsScriptUrl();
  
  if (!url) {
    console.warn('No Apps Script URL configured');
    return null;
  }
  
  try {
    // Use GET with data in URL parameter to avoid CORS issues
    const dataParam = encodeURIComponent(JSON.stringify(wordData));
    const response = await fetch(`${url}?action=updateWord&language=${language}&data=${dataParam}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Updated word in Google Sheets');
    return result;
  } catch (error) {
    console.error('Error updating word in Sheets:', error);
    return null;
  }
}

// Update stats in Google Sheets (granular update)
async function updateStatsInSheets(statsData, language = 'kanji') {
  const url = getAppsScriptUrl();
  
  if (!url) {
    console.warn('No Apps Script URL configured');
    return null;
  }
  
  try {
    // Use GET with data in URL parameter to avoid CORS issues
    const dataParam = encodeURIComponent(JSON.stringify(statsData));
    const response = await fetch(`${url}?action=updateStats&language=${language}&data=${dataParam}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Updated stats in Google Sheets');
    return result;
  } catch (error) {
    console.error('Error updating stats in Sheets:', error);
    return null;
  }
}

// Read stats from Google Sheets
async function readStatsFromSheets(language = 'kanji') {
  const url = getAppsScriptUrl();
  
  if (!url) {
    console.warn('No Apps Script URL configured');
    return null;
  }
  
  try {
    const response = await fetch(`${url}?action=getStats&language=${language}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Loaded stats from Google Sheets');
    return data;
  } catch (error) {
    console.error('Error reading stats from Sheets:', error);
    return null;
  }
}

// Check if Sheets API is configured
function isSheetsConfigured() {
  return !!getAppsScriptUrl();
}

export {
  readFromSheets,
  updateWordInSheets,
  updateStatsInSheets,
  readStatsFromSheets,
  isSheetsConfigured,
  sheetsDataCache,
  lastSheetsFetch,
  CACHE_DURATION
};
