// Google Apps Script to act as a simple API for your vocabulary app
// Deploy this as a web app to get a URL you can call from your React app

// Your sheet name
const DUTCH_SHEET = 'Dutch';
const STATS_SHEET = 'Stats';

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'getDutch') {
    return getDutchData(ss);
  } else if (action === 'getStats') {
    return getStats(ss);
  } else if (action === 'getWord') {
    const id = parseInt(e.parameter.id);
    return getWord(ss, id);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    error: 'Invalid action'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (action === 'updateWord') {
      return updateWord(ss, data);
    } else if (action === 'updateStats') {
      return updateStats(ss, data);
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

function getDutchData(ss) {
  const sheet = ss.getSheetByName(DUTCH_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const result = {};
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const id = row[0];
    const key = (id - 1).toString();
    
    result[key] = {
      id: id,
      dutch: row[1],
      en: row[2],
      category: row[3] || undefined,
      dutch2en: {
        correct: row[4] || 0,
        total: row[5] || 0,
        percentage: row[6] || 0
      },
      en2dutch: {
        correct: row[7] || 0,
        total: row[8] || 0,
        percentage: row[9] || 0
      }
    };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getStats(ss) {
  const sheet = ss.getSheetByName(STATS_SHEET);
  const data = sheet.getDataRange().getValues();
  
  const result = {
    size: 100,
    global: {
      correct: data[1][1],
      total: data[1][2],
      record: data[1][3]
    },
    local: {
      correct: data[2][1],
      total: data[2][2],
      record: data[2][3]
    }
  };
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getWord(ss, id) {
  const sheet = ss.getSheetByName(DUTCH_SHEET);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === id) {
      const result = {
        id: id,
        dutch: row[1],
        en: row[2],
        category: row[3] || undefined,
        dutch2en: {
          correct: row[4] || 0,
          total: row[5] || 0,
          percentage: row[6] || 0
        },
        en2dutch: {
          correct: row[7] || 0,
          total: row[8] || 0,
          percentage: row[9] || 0
        }
      };
      
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    error: 'Word not found'
  })).setMimeType(ContentService.MimeType.JSON);
}

function updateWord(ss, wordData) {
  const sheet = ss.getSheetByName(DUTCH_SHEET);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === wordData.id) {
      // Update the row
      sheet.getRange(i + 1, 5).setValue(wordData.dutch2en.correct);
      sheet.getRange(i + 1, 6).setValue(wordData.dutch2en.total);
      sheet.getRange(i + 1, 7).setValue(wordData.dutch2en.percentage);
      sheet.getRange(i + 1, 8).setValue(wordData.en2dutch.correct);
      sheet.getRange(i + 1, 9).setValue(wordData.en2dutch.total);
      sheet.getRange(i + 1, 10).setValue(wordData.en2dutch.percentage);
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        data: wordData
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    error: 'Word not found'
  })).setMimeType(ContentService.MimeType.JSON);
}

function updateStats(ss, statsData) {
  const sheet = ss.getSheetByName(STATS_SHEET);
  
  // Update global stats (row 2)
  sheet.getRange(2, 2).setValue(statsData.global.correct);
  sheet.getRange(2, 3).setValue(statsData.global.total);
  sheet.getRange(2, 4).setValue(statsData.global.record);
  
  // Update local stats (row 3)
  sheet.getRange(3, 2).setValue(statsData.local.correct);
  sheet.getRange(3, 3).setValue(statsData.local.total);
  sheet.getRange(3, 4).setValue(statsData.local.record);
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: statsData
  })).setMimeType(ContentService.MimeType.JSON);
}
