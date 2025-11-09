const fs = require('fs');
const path = require('path');

const kanjiPath = path.join(__dirname, '../data/kanji.json');
const outputPath = path.join(__dirname, '../data/kanji-for-sheets.csv');

// Read the kanji data
const data = JSON.parse(fs.readFileSync(kanjiPath, 'utf-8'));

// CSV header (removed 'id' column)
const header = 'kanji,en,category,k2e_correct,k2e_total,k2e_percentage';

// Convert each entry to CSV row
const rows = [];
const kanjiArray = data.kanji || [];

for (const item of kanjiArray) {
    if (!item.id) continue;
    
    const row = [
        `"${item.kanji || ''}"`,
        `"${item.meaning || item.en || ''}"`,
        `"${item.category || ''}"`,
        item.kanji2en?.correct || 0,
        item.kanji2en?.total || 0,
        item.kanji2en?.percentage || 0
    ].join(',');
    
    rows.push({ id: item.id, row });
}

// Sort by id
rows.sort((a, b) => a.id - b.id);

// Extract just the row strings
const sortedRows = rows.map(r => r.row);

// Combine header and rows
const csv = [header, ...sortedRows].join('\n');

// Write to file
fs.writeFileSync(outputPath, csv);

console.log(`✅ Created ${outputPath}`);
console.log(`📊 Exported ${rows.length} kanji entries`);
console.log('\nNext steps:');
console.log('1. Open Google Sheets');
console.log('2. Create a new sheet named "Kanji"');
console.log('3. File → Import → Upload → Select kanji-for-sheets.csv');
console.log('4. Import location: Replace current sheet');
console.log('5. Separator type: Comma');

// Also create stats CSV
const statsData = data.stats || { size: 979, global: { correct: 0, total: 0, record: 0 }, local: { correct: 0, total: 0, record: 0 } };

const statsHeader = 'Label,Value,Total,Record';
const statsRows = [
    `Size,${statsData.size},,`,
    `Global,${statsData.global.correct},${statsData.global.total},${statsData.global.record}`,
    `Local,${statsData.local.correct},${statsData.local.total},${statsData.local.record}`
];

const statsCsv = [statsHeader, ...statsRows].join('\n');
const statsOutputPath = path.join(__dirname, '../data/kanji-stats-for-sheets.csv');
fs.writeFileSync(statsOutputPath, statsCsv);

console.log(`\n✅ Created ${statsOutputPath}`);
console.log('Import this into a sheet named "KanjiStats"');
