const fs = require('fs');
const path = require('path');

const dutchPath = path.join(__dirname, '../data/dutch.json');
const outputPath = path.join(__dirname, '../data/dutch-for-sheets.csv');

// Read the dutch data
const data = JSON.parse(fs.readFileSync(dutchPath, 'utf-8'));

// CSV header
const header = 'id,dutch,en,category,d2e_correct,d2e_total,d2e_percentage,e2d_correct,e2d_total,e2d_percentage';

// Convert each entry to CSV row
const rows = [];
for (const key in data) {
    const item = data[key];
    
    // Skip the stats object
    if (key === 'stats' || !item.id) continue;
    
    const row = [
        item.id,
        `"${item.dutch || ''}"`,
        `"${item.en || ''}"`,
        `"${item.category || ''}"`,
        item.dutch2en?.correct || 0,
        item.dutch2en?.total || 0,
        item.dutch2en?.percentage || 0,
        item.en2dutch?.correct || 0,
        item.en2dutch?.total || 0,
        item.en2dutch?.percentage || 0
    ].join(',');
    
    rows.push(row);
}

// Sort by id
rows.sort((a, b) => {
    const idA = parseInt(a.split(',')[0]);
    const idB = parseInt(b.split(',')[0]);
    return idA - idB;
});

// Combine header and rows
const csv = [header, ...rows].join('\n');

// Write to file
fs.writeFileSync(outputPath, csv);

console.log(`✅ Created ${outputPath}`);
console.log(`📊 Exported ${rows.length} Dutch entries`);
console.log('\nNext steps:');
console.log('1. Open Google Sheets');
console.log('2. Create a new sheet named "Dutch"');
console.log('3. File → Import → Upload → Select dutch-for-sheets.csv');
console.log('4. Import location: Replace current sheet');
console.log('5. Separator type: Comma');

// Also create stats CSV
const statsData = data.stats || { size: 100, global: { correct: 0, total: 0, record: 0 }, local: { correct: 0, total: 0, record: 0 } };

const statsHeader = 'Label,Value,Total,Record';
const statsRows = [
    `Size,${statsData.size},,`,
    `Global,${statsData.global.correct},${statsData.global.total},${statsData.global.record}`,
    `Local,${statsData.local.correct},${statsData.local.total},${statsData.local.record}`
];

const statsCsv = [statsHeader, ...statsRows].join('\n');
const statsOutputPath = path.join(__dirname, '../data/dutch-stats-for-sheets.csv');
fs.writeFileSync(statsOutputPath, statsCsv);

console.log(`\n✅ Created ${statsOutputPath}`);
console.log('Import this into a sheet named "DutchStats"');
