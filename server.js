const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const server = jsonServer.create();
const middlewares = jsonServer.defaults({
  noCors: true  // Disable json-server's CORS to use our custom one
});

// Paths to data files
const kanjiPath = path.join(__dirname, 'data', 'kanji.json');
const dutchPath = path.join(__dirname, 'data', 'dutch.json');

// Load data
let kanjiData = JSON.parse(fs.readFileSync(kanjiPath, 'utf-8'));
let dutchData = JSON.parse(fs.readFileSync(dutchPath, 'utf-8'));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://mesutdurukal.github.io',
  'https://mesutdurukal.github.io/nihongoV3'
];

// CORS must be first
server.use(cors({
  origin: function(origin, callback) {
    console.log('Request from origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost and github.io domains
    if (origin.includes('localhost') || origin.includes('mesutdurukal.github.io')) {
      console.log('Allowing origin:', origin);
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Then other middleware
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Add logging middleware
server.use((req, res, next) => {
  console.log(`${req.method} ${req.url} from ${req.ip} (host: ${req.get('host')})`);
  next();
});

// Test endpoint
server.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', ip: req.ip, host: req.get('host') });
});

// Stats endpoints for kanji (must be before :id routes)
server.get('/api/kanji/stats', (req, res) => {
  kanjiData = JSON.parse(fs.readFileSync(kanjiPath, 'utf-8'));
  res.json(kanjiData.stats);
});

server.patch('/api/kanji/stats', (req, res) => {
  kanjiData = JSON.parse(fs.readFileSync(kanjiPath, 'utf-8'));
  kanjiData.stats = { ...kanjiData.stats, ...req.body };
  fs.writeFileSync(kanjiPath, JSON.stringify(kanjiData, null, 2));
  res.json(kanjiData.stats);
});

// Custom routes for kanji
server.get('/api/kanji', (req, res) => {
  kanjiData = JSON.parse(fs.readFileSync(kanjiPath, 'utf-8'));
  res.json(kanjiData.kanji);
});

server.get('/api/kanji/:id', (req, res) => {
  kanjiData = JSON.parse(fs.readFileSync(kanjiPath, 'utf-8'));
  const item = kanjiData.kanji.find(k => k.id === parseInt(req.params.id));
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

server.patch('/api/kanji/:id', (req, res) => {
  kanjiData = JSON.parse(fs.readFileSync(kanjiPath, 'utf-8'));
  const index = kanjiData.kanji.findIndex(k => k.id === parseInt(req.params.id));
  if (index !== -1) {
    kanjiData.kanji[index] = { ...kanjiData.kanji[index], ...req.body };
    fs.writeFileSync(kanjiPath, JSON.stringify(kanjiData, null, 2));
    res.json(kanjiData.kanji[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

server.put('/kanji', (req, res) => {
  kanjiData = req.body;
  fs.writeFileSync(kanjiPath, JSON.stringify(kanjiData, null, 2));
  res.json(kanjiData);
});

// Stats endpoints for dutch (must be before :id routes)
server.get('/api/dutch/stats', (req, res) => {
  dutchData = JSON.parse(fs.readFileSync(dutchPath, 'utf-8'));
  res.json(dutchData.stats);
});

server.patch('/api/dutch/stats', (req, res) => {
  dutchData = JSON.parse(fs.readFileSync(dutchPath, 'utf-8'));
  dutchData.stats = { ...dutchData.stats, ...req.body };
  fs.writeFileSync(dutchPath, JSON.stringify(dutchData, null, 2));
  res.json(dutchData.stats);
});

// Custom routes for dutch
server.get('/api/dutch', (req, res) => {
  dutchData = JSON.parse(fs.readFileSync(dutchPath, 'utf-8'));
  // Handle both array format and object format
  let dutchArray = Array.isArray(dutchData.dutch) 
    ? dutchData.dutch 
    : Object.values(dutchData).filter(item => item && typeof item === 'object' && item.id);
  res.json(dutchArray);
});

server.get('/api/dutch/:id', (req, res) => {
  dutchData = JSON.parse(fs.readFileSync(dutchPath, 'utf-8'));
  let dutchArray = Array.isArray(dutchData.dutch) 
    ? dutchData.dutch 
    : Object.values(dutchData).filter(item => item && typeof item === 'object' && item.id);
  const item = dutchArray.find(d => d.id === parseInt(req.params.id));
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

server.patch('/api/dutch/:id', (req, res) => {
  dutchData = JSON.parse(fs.readFileSync(dutchPath, 'utf-8'));
  let dutchArray = Array.isArray(dutchData.dutch) 
    ? dutchData.dutch 
    : Object.values(dutchData).filter(item => item && typeof item === 'object' && item.id);
  const index = dutchArray.findIndex(d => d.id === parseInt(req.params.id));
  if (index !== -1) {
    dutchArray[index] = { ...dutchArray[index], ...req.body };
    // Reconstruct the data structure
    if (Array.isArray(dutchData.dutch)) {
      dutchData.dutch = dutchArray;
    } else {
      // Update the numbered key format
      dutchData[index.toString()] = dutchArray[index];
    }
    fs.writeFileSync(dutchPath, JSON.stringify(dutchData, null, 2));
    res.json(dutchArray[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

server.put('/dutch', (req, res) => {
  dutchData = req.body;
  fs.writeFileSync(dutchPath, JSON.stringify(dutchData, null, 2));
  res.json(dutchData);
});

const PORT = 8080;
const HOST = '0.0.0.0';

// For local development
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

// Export for Vercel
module.exports = server;
