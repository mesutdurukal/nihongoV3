const fs = require('fs');
const path = require('path');

// Paths to JSON files
const dutchPath = path.join(__dirname, '../data/dutch.json');
const kanjiPath = path.join(__dirname, '../data/kanji.json');

function removeRatioFields(filePath) {
    console.log(`Processing ${filePath}...`);
    
    // Read the file
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    let removedCount = 0;
    
    // Iterate through all entries
    for (const key in data) {
        if (data[key] && typeof data[key] === 'object' && 'ratio' in data[key]) {
            delete data[key].ratio;
            removedCount++;
        }
    }
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Removed ${removedCount} ratio fields from ${path.basename(filePath)}`);
}

// Process both files
removeRatioFields(dutchPath);
removeRatioFields(kanjiPath);

console.log('\n✨ Done! All ratio fields have been removed.');
