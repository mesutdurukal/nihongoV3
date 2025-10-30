const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'dutch.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

const newWords = [
  { id: 11, category: "numbers", dutch: "drie", en: "three" },
  { id: 12, category: "numbers", dutch: "vier", en: "four" },
  { id: 13, category: "numbers", dutch: "vijf", en: "five" },
  { id: 14, category: "general", dutch: "ja", en: "yes" },
  { id: 15, category: "general", dutch: "nee", en: "no" },
  { id: 16, category: "general", dutch: "misschien", en: "maybe" },
  { id: 17, category: "time", dutch: "vandaag", en: "today" },
  { id: 18, category: "time", dutch: "morgen", en: "tomorrow" },
  { id: 19, category: "time", dutch: "gisteren", en: "yesterday" },
  { id: 20, category: "time", dutch: "nu", en: "now" },
  { id: 21, category: "time", dutch: "later", en: "later" },
  { id: 22, category: "family", dutch: "moeder", en: "mother" },
  { id: 23, category: "family", dutch: "vader", en: "father" },
  { id: 24, category: "family", dutch: "kind", en: "child" },
  { id: 25, category: "family", dutch: "vriend", en: "friend" },
  { id: 26, category: "places", dutch: "huis", en: "house" },
  { id: 27, category: "places", dutch: "school", en: "school" },
  { id: 28, category: "places", dutch: "werk", en: "work" },
  { id: 29, category: "places", dutch: "winkel", en: "shop, store" },
  { id: 30, category: "places", dutch: "restaurant", en: "restaurant" },
  { id: 31, category: "food", dutch: "eten", en: "food, to eat" },
  { id: 32, category: "food", dutch: "drinken", en: "drink, to drink" },
  { id: 33, category: "food", dutch: "koffie", en: "coffee" },
  { id: 34, category: "food", dutch: "thee", en: "tea" },
  { id: 35, category: "food", dutch: "melk", en: "milk" },
  { id: 36, category: "food", dutch: "bier", en: "beer" },
  { id: 37, category: "food", dutch: "vlees", en: "meat" },
  { id: 38, category: "food", dutch: "vis", en: "fish" },
  { id: 39, category: "food", dutch: "groente", en: "vegetable" },
  { id: 40, category: "food", dutch: "fruit", en: "fruit" },
  { id: 41, category: "verbs", dutch: "zijn", en: "to be" },
  { id: 42, category: "verbs", dutch: "hebben", en: "to have" },
  { id: 43, category: "verbs", dutch: "gaan", en: "to go" },
  { id: 44, category: "verbs", dutch: "komen", en: "to come" },
  { id: 45, category: "verbs", dutch: "maken", en: "to make" },
  { id: 46, category: "verbs", dutch: "doen", en: "to do" },
  { id: 47, category: "verbs", dutch: "zien", en: "to see" },
  { id: 48, category: "verbs", dutch: "horen", en: "to hear" },
  { id: 49, category: "verbs", dutch: "spreken", en: "to speak" },
  { id: 50, category: "verbs", dutch: "weten", en: "to know" },
  { id: 51, category: "adjectives", dutch: "groot", en: "big, large" },
  { id: 52, category: "adjectives", dutch: "klein", en: "small" },
  { id: 53, category: "adjectives", dutch: "goed", en: "good" },
  { id: 54, category: "adjectives", dutch: "slecht", en: "bad" },
  { id: 55, category: "adjectives", dutch: "mooi", en: "beautiful" },
  { id: 56, category: "adjectives", dutch: "lelijk", en: "ugly" },
  { id: 57, category: "adjectives", dutch: "nieuw", en: "new" },
  { id: 58, category: "adjectives", dutch: "oud", en: "old" },
  { id: 59, category: "adjectives", dutch: "warm", en: "warm" },
  { id: 60, category: "adjectives", dutch: "koud", en: "cold" },
  { id: 61, category: "questions", dutch: "wat", en: "what" },
  { id: 62, category: "questions", dutch: "wie", en: "who" },
  { id: 63, category: "questions", dutch: "waar", en: "where" },
  { id: 64, category: "questions", dutch: "wanneer", en: "when" },
  { id: 65, category: "questions", dutch: "waarom", en: "why" },
  { id: 66, category: "questions", dutch: "hoe", en: "how" },
  { id: 67, category: "questions", dutch: "hoeveel", en: "how much, how many" },
  { id: 68, category: "general", dutch: "man", en: "man" },
  { id: 69, category: "general", dutch: "vrouw", en: "woman" },
  { id: 70, category: "general", dutch: "jongen", en: "boy" },
  { id: 71, category: "general", dutch: "meisje", en: "girl" },
  { id: 72, category: "general", dutch: "dag", en: "day" },
  { id: 73, category: "general", dutch: "nacht", en: "night" },
  { id: 74, category: "general", dutch: "week", en: "week" },
  { id: 75, category: "general", dutch: "maand", en: "month" },
  { id: 76, category: "general", dutch: "jaar", en: "year" },
  { id: 77, category: "general", dutch: "tijd", en: "time" },
  { id: 78, category: "general", dutch: "geld", en: "money" },
  { id: 79, category: "general", dutch: "naam", en: "name" },
  { id: 80, category: "general", dutch: "stad", en: "city" },
  { id: 81, category: "general", dutch: "land", en: "country" },
  { id: 82, category: "general", dutch: "straat", en: "street" },
  { id: 83, category: "general", dutch: "auto", en: "car" },
  { id: 84, category: "general", dutch: "fiets", en: "bicycle" },
  { id: 85, category: "general", dutch: "trein", en: "train" },
  { id: 86, category: "general", dutch: "bus", en: "bus" },
  { id: 87, category: "general", dutch: "boek", en: "book" },
  { id: 88, category: "general", dutch: "tafel", en: "table" },
  { id: 89, category: "general", dutch: "stoel", en: "chair" },
  { id: 90, category: "general", dutch: "deur", en: "door" },
  { id: 91, category: "general", dutch: "raam", en: "window" },
  { id: 92, category: "general", dutch: "bed", en: "bed" },
  { id: 93, category: "general", dutch: "telefoon", en: "phone" },
  { id: 94, category: "general", dutch: "computer", en: "computer" },
  { id: 95, category: "general", dutch: "muziek", en: "music" },
  { id: 96, category: "general", dutch: "film", en: "movie" },
  { id: 97, category: "general", dutch: "foto", en: "photo" },
  { id: 98, category: "general", dutch: "brief", en: "letter" },
  { id: 99, category: "general", dutch: "krant", en: "newspaper" },
  { id: 100, category: "general", dutch: "vraag", en: "question" }
];

// Add new words
let currentIndex = Object.keys(data).filter(k => k !== 'stats').length;
newWords.forEach((word, idx) => {
  const key = (currentIndex + idx).toString();
  data[key] = {
    ...word,
    dutch2en: { correct: 0, total: 0, percentage: 0 },
    en2dutch: { correct: 0, total: 0, percentage: 0 }
  };
});

// Update stats size
data.stats.size = Object.keys(data).filter(k => k !== 'stats').length;

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log(`Added ${newWords.length} new Dutch words. Total: ${data.stats.size}`);
