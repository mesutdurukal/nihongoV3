// Google Apps Script to act as a simple API for your vocabulary app
// Deploy this as a web app to get a URL you can call from your React app

// Your sheet names
const DUTCH_SHEET = 'Dutch';
const KANJI_SHEET = 'Kanji';
const DUTCH_STATS_SHEET = 'DutchStats';
const KANJI_STATS_SHEET = 'KanjiStats';

// Handle OPTIONS requests for CORS preflight
function doOptions(e) {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = e.parameter.action;
  const language = e.parameter.language || 'dutch';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'getData') {
    return getData(ss, language);
  } else if (action === 'getStats') {
    return getStats(ss, language);
  } else if (action === 'getWord') {
    const id = parseInt(e.parameter.id);
    return getWord(ss, id, language);
  } else if (action === 'updateWord') {
    // Handle update via GET with data parameter
    const data = JSON.parse(e.parameter.data || '{}');
    return updateWord(ss, data, language);
  } else if (action === 'updateStats') {
    // Handle update via GET with data parameter
    const data = JSON.parse(e.parameter.data || '{}');
    return updateStats(ss, data, language);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    error: 'Invalid action'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const action = e.parameter.action;
  const language = e.parameter.language || 'dutch';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (action === 'updateWord') {
      return updateWord(ss, data, language);
    } else if (action === 'updateStats') {
      return updateStats(ss, data, language);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      error: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getData(ss, language) {
  const sheetName = language === 'kanji' ? KANJI_SHEET : DUTCH_SHEET;
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  
  const result = {};
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    // Use row number as ID (i starts at 1 for first data row after header)
    const id = i;
    const key = (id - 1).toString();
    
    if (language === 'kanji') {
      result[key] = {
        id: id,
        kanji: row[0],
        en: row[1],
        category: row[2] || undefined,
        kanji2en: {
          correct: row[3] || 0,
          total: row[4] || 0,
          percentage: row[5] || 0
        }
      };
    } else {
      result[key] = {
        id: id,
        dutch: row[0],
        en: row[1],
        category: row[2] || undefined,
        dutch2en: {
          correct: row[3] || 0,
          total: row[4] || 0,
          percentage: row[5] || 0
        },
        en2dutch: {
          correct: row[6] || 0,
          total: row[7] || 0,
          percentage: row[8] || 0
        }
      };
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getStats(ss, language) {
  const statsSheetName = language === 'kanji' ? KANJI_STATS_SHEET : DUTCH_STATS_SHEET;
  const dataSheetName = language === 'kanji' ? KANJI_SHEET : DUTCH_SHEET;
  
  const statsSheet = ss.getSheetByName(statsSheetName);
  const dataSheet = ss.getSheetByName(dataSheetName);
  const data = statsSheet.getDataRange().getValues();
  
  // Calculate size dynamically from vocab sheet (minus header row)
  const vocabSize = dataSheet.getLastRow() - 1;
  
  // Data layout (0-indexed):
  // Row 0: Headers (Label, Value, Total, Record)
  // Row 1: Size row
  // Row 2: Global row
  // Row 3: Local row
  const result = {
    size: vocabSize,
    global: {
      correct: data[2][1] || 0,
      total: data[2][2] || 0,
      record: data[2][3] || 0
    },
    local: {
      correct: data[3][1] || 0,
      total: data[3][2] || 0,
      record: data[3][3] || 0
    }
  };
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getWord(ss, id, language) {
  const sheetName = language === 'kanji' ? KANJI_SHEET : DUTCH_SHEET;
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  
  // ID is the row number (1-based for first data row)
  const rowIndex = id;
  
  if (rowIndex >= 1 && rowIndex < data.length) {
    const row = data[rowIndex];
    let result;
    
    if (language === 'kanji') {
      result = {
        id: id,
        kanji: row[0],
        en: row[1],
        category: row[2] || undefined,
        kanji2en: {
          correct: row[3] || 0,
          total: row[4] || 0,
          percentage: row[5] || 0
        }
      };
    } else {
      result = {
        id: id,
        dutch: row[0],
        en: row[1],
        category: row[2] || undefined,
        dutch2en: {
          correct: row[3] || 0,
          total: row[4] || 0,
          percentage: row[5] || 0
        },
        en2dutch: {
          correct: row[6] || 0,
          total: row[7] || 0,
          percentage: row[8] || 0
        }
      };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    error: 'Word not found'
  })).setMimeType(ContentService.MimeType.JSON);
}

function updateWord(ss, wordData, language) {
  const sheetName = language === 'kanji' ? KANJI_SHEET : DUTCH_SHEET;
  const sheet = ss.getSheetByName(sheetName);
  
  // ID is the row number (1-based for first data row)
  // Sheet row is ID + 1 (because row 1 is header)
  const sheetRow = wordData.id + 1;
  
  if (language === 'kanji') {
    // Update kanji stats (columns shifted left by 1 since no ID column)
    sheet.getRange(sheetRow, 4).setValue(wordData.kanji2en.correct);
    sheet.getRange(sheetRow, 5).setValue(wordData.kanji2en.total);
    sheet.getRange(sheetRow, 6).setValue(wordData.kanji2en.percentage);
  } else {
    // Update dutch stats (columns shifted left by 1 since no ID column)
    sheet.getRange(sheetRow, 4).setValue(wordData.dutch2en.correct);
    sheet.getRange(sheetRow, 5).setValue(wordData.dutch2en.total);
    sheet.getRange(sheetRow, 6).setValue(wordData.dutch2en.percentage);
    sheet.getRange(sheetRow, 7).setValue(wordData.en2dutch.correct);
    sheet.getRange(sheetRow, 8).setValue(wordData.en2dutch.total);
    sheet.getRange(sheetRow, 9).setValue(wordData.en2dutch.percentage);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: wordData
  })).setMimeType(ContentService.MimeType.JSON);
}

function updateStats(ss, statsData, language) {
  const sheetName = language === 'kanji' ? KANJI_STATS_SHEET : DUTCH_STATS_SHEET;
  const sheet = ss.getSheetByName(sheetName);
  
  // Sheet layout (1-indexed for getRange):
  // Row 1: Headers (Label, Value, Total, Record)
  // Row 2: Size row (not updated - calculated dynamically)
  // Row 3: Global row
  // Row 4: Local row
  
  // Update global stats (row 3)
  sheet.getRange(3, 2).setValue(statsData.global.correct);
  sheet.getRange(3, 3).setValue(statsData.global.total);
  sheet.getRange(3, 4).setValue(statsData.global.record);
  
  // Update local stats (row 4)
  sheet.getRange(4, 2).setValue(statsData.local.correct);
  sheet.getRange(4, 3).setValue(statsData.local.total);
  sheet.getRange(4, 4).setValue(statsData.local.record);
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: statsData
  })).setMimeType(ContentService.MimeType.JSON);
}
