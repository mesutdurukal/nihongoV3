const fs = require('fs');
const path = require('path');

// Paths
const inputPath = path.join(__dirname, '../data/kanji.json');
const backupPath = path.join(__dirname, '../data/kanji.backup.json');
const outputPath = path.join(__dirname, '../data/kanji.migrated.json');

console.log('Starting migration...');

// 1. Read the original file
console.log('Reading original file...');
const originalData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// 2. Create a backup
console.log('Creating backup...');
fs.writeFileSync(backupPath, JSON.stringify(originalData, null, 2));

// 3. Migrate the data
console.log('Migrating data...');
const migratedData = {
    ...originalData,
    kanji: originalData.kanji.map(item => {
        // Calculate percentage safely
        const kanjiToMeaningTotal = item.total || 0;
        const kanjiToMeaningCorrect = item.correct || 0;
        const meaningToKanjiTotal = item.undef2 || 0;
        const meaningToKanjiCorrect = item.undef1 || 0;

        return {
            id: item.id,
            category: item.category,
            kanji: item.kanji,
            reading: item.reading,
            meaning: item.meaning,
            kanjiToMeaning: {
                correct: kanjiToMeaningCorrect,
                total: kanjiToMeaningTotal,
                percentage: kanjiToMeaningTotal > 0 ? (kanjiToMeaningCorrect / kanjiToMeaningTotal) : 0
            },
            meaningToKanji: {
                correct: meaningToKanjiCorrect,
                total: meaningToKanjiTotal,
                percentage: meaningToKanjiTotal > 0 ? (meaningToKanjiCorrect / meaningToKanjiTotal) : 0
            },
            // Old fields removed as per request
        };
    })
};

// 4. Save the migrated data
console.log('Saving migrated data...');
fs.writeFileSync(outputPath, JSON.stringify(migratedData, null, 2));

console.log('Migration complete!');
console.log(`Backup saved to: ${backupPath}`);
console.log(`Migrated data saved to: ${outputPath}`);
console.log('\nPlease review the migrated data before replacing the original file.');
