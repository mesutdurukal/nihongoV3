// Script to convert dutch.json to CSV format for Google Sheets import
const fs = require('fs');
const path = require('path');

const dutchPath = path.join(__dirname, '../data/dutch.json');
const outputPath = path.join(__dirname, '../data/dutch-for-sheets.csv');

// Read the Dutch data
const dutchData = JSON.parse(fs.readFileSync(dutchPath, 'utf-8'));

// Create CSV header
const header = 'ID,Dutch,English,Category,Dutch2En Correct,Dutch2En Total,Dutch2En %,En2Dutch Correct,En2Dutch Total,En2Dutch %\n';

// Create CSV rows
let csv = header;

Object.keys(dutchData).forEach(key => {
  if (key === 'stats') return;
  
  const item = dutchData[key];
  const row = [
    item.id,
    `"${item.dutch}"`,
    `"${item.en}"`,
    `"${item.category || ''}"`,
    item.dutch2en?.correct || 0,
    item.dutch2en?.total || 0,
    item.dutch2en?.percentage || 0,
    item.en2dutch?.correct || 0,
    item.en2dutch?.total || 0,
    item.en2dutch?.percentage || 0
  ].join(',');
  
  csv += row + '\n';
});

// Write CSV file
fs.writeFileSync(outputPath, csv);

console.log('✅ CSV file created:', outputPath);
console.log('📊 Total words:', Object.keys(dutchData).length - 1); // -1 for stats

// Also create stats CSV
const statsPath = path.join(__dirname, '../data/stats-for-sheets.csv');
const stats = dutchData.stats;

const statsCSV = 'Type,Correct,Total,Record\n' +
  `Global,${stats.global.correct},${stats.global.total},${stats.global.record}\n` +
  `Local,${stats.local.correct},${stats.local.total},${stats.local.record}\n`;

fs.writeFileSync(statsPath, statsCSV);

console.log('✅ Stats CSV file created:', statsPath);
console.log('\n📝 Next steps:');
console.log('1. Create a new Google Sheet');
console.log('2. Create two sheets: "Dutch" and "Stats"');
console.log('3. Import dutch-for-sheets.csv into "Dutch" sheet');
console.log('4. Import stats-for-sheets.csv into "Stats" sheet');
console.log('5. Follow GOOGLE_SHEETS_SETUP.md for API setup');
