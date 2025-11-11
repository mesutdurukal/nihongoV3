#!/usr/bin/env node

/**
 * Sync data from Google Sheets to local JSON files
 * This ensures local files match the latest Sheets data
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SHEETS_URL = process.env.REACT_APP_GOOGLE_APPS_SCRIPT_URL;

if (!SHEETS_URL) {
  console.error('❌ Error: REACT_APP_GOOGLE_APPS_SCRIPT_URL not found in .env');
  console.error('Please add your Google Apps Script URL to .env file');
  process.exit(1);
}

async function fetchFromSheets(language) {
  const url = `${SHEETS_URL}?action=getData&language=${language}`;
  console.log(`📥 Fetching ${language} data from Google Sheets...`);
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`✅ Fetched ${Object.keys(data).length} ${language} entries`);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching ${language} data:`, error.message);
    throw error;
  }
}

async function syncLanguage(language) {
  console.log(`\n🔄 Syncing ${language}...`);
  
  // Fetch from Sheets
  const data = await fetchFromSheets(language);
  
  // Convert to array format for JSON file
  const dataArray = Object.values(data);
  
  // Save to JSON file
  const jsonPath = path.join(__dirname, '..', 'data', `${language}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify(dataArray, null, 2));
  console.log(`💾 Saved to ${jsonPath}`);
  
  // Convert to CSV format for Sheets backup
  const csvPath = path.join(__dirname, '..', 'data', `${language}-for-sheets.csv`);
  let csv = '';
  
  if (language === 'dutch') {
    csv = 'id,dutch,en,category,dutch2en_correct,dutch2en_total,dutch2en_percentage,en2dutch_correct,en2dutch_total,en2dutch_percentage\n';
    dataArray.forEach(item => {
      csv += `${item.id},"${item.dutch}","${item.en}","${item.category || ''}",`;
      csv += `${item.dutch2en.correct},${item.dutch2en.total},${item.dutch2en.percentage},`;
      csv += `${item.en2dutch.correct},${item.en2dutch.total},${item.en2dutch.percentage}\n`;
    });
  } else {
    csv = 'id,kanji,meaning,category,correct,total,percentage\n';
    dataArray.forEach(item => {
      csv += `${item.id},"${item.kanji}","${item.en}","${item.category || ''}",`;
      csv += `${item.kanji2en.correct},${item.kanji2en.total},${item.kanji2en.percentage}\n`;
    });
  }
  
  fs.writeFileSync(csvPath, csv);
  console.log(`💾 Saved to ${csvPath}`);
}

async function main() {
  console.log('🚀 Starting sync from Google Sheets...\n');
  
  try {
    await syncLanguage('dutch');
    await syncLanguage('kanji');
    
    console.log('\n✅ Sync complete! Local files are now up to date.');
    console.log('\n💡 Tip: Run this script whenever you want to update local files with latest Sheets data');
    console.log('   Command: node scripts/sync-from-sheets.js');
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  }
}

main();
