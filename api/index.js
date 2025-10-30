const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// CORS configuration
app.use(cors({
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

app.use(express.json());

// Paths to data files
const kanjiPath = path.join(__dirname, '..', 'data', 'kanji.json');
const dutchPath = path.join(__dirname, '..', 'data', 'dutch.json');

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Kanji endpoints
app.get('/api/kanji/stats', (req, res) => {
  const kanjiData = JSON.parse(fs.readFileSync(kanjiPath, 'utf-8'));
  res.json(kanjiData.stats);
});

app.patch('/api/kanji/stats', (req, res) => {
  try {
    const kanjiData = JSON.parse(fs.readFileSync(kanjiPath, 'utf-8'));
    const updatedStats = { ...kanjiData.stats, ...req.body };
    
    // Try to write, but don't fail if it doesn't work (Vercel read-only FS)
    try {
      fs.writeFileSync(kanjiPath, JSON.stringify({ ...kanjiData, stats: updatedStats }, null, 2));
    } catch (writeError) {
      console.log('Cannot persist stats (read-only filesystem):', writeError.message);
    }
    
    res.json(updatedStats);
  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/kanji', (req, res) => {
  const kanjiData = JSON.parse(fs.readFileSync(kanjiPath, 'utf-8'));
  res.json(kanjiData.kanji);
});

app.get('/api/kanji/:id', (req, res) => {
  const kanjiData = JSON.parse(fs.readFileSync(kanjiPath, 'utf-8'));
  const item = kanjiData.kanji.find(k => k.id === parseInt(req.params.id));
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.patch('/api/kanji/:id', (req, res) => {
  try {
    const kanjiData = JSON.parse(fs.readFileSync(kanjiPath, 'utf-8'));
    const index = kanjiData.kanji.findIndex(k => k.id === parseInt(req.params.id));
    if (index !== -1) {
      const updatedItem = { ...kanjiData.kanji[index], ...req.body };
      
      // Try to write, but don't fail if it doesn't work
      try {
        kanjiData.kanji[index] = updatedItem;
        fs.writeFileSync(kanjiPath, JSON.stringify(kanjiData, null, 2));
      } catch (writeError) {
        console.log('Cannot persist kanji update (read-only filesystem):', writeError.message);
      }
      
      res.json(updatedItem);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error('Error updating kanji:', error);
    res.status(500).json({ error: error.message });
  }
});

// Dutch endpoints
app.get('/api/dutch/stats', (req, res) => {
  const dutchData = JSON.parse(fs.readFileSync(dutchPath, 'utf-8'));
  res.json(dutchData.stats);
});

app.patch('/api/dutch/stats', (req, res) => {
  try {
    const dutchData = JSON.parse(fs.readFileSync(dutchPath, 'utf-8'));
    const updatedStats = { ...dutchData.stats, ...req.body };
    
    try {
      fs.writeFileSync(dutchPath, JSON.stringify({ ...dutchData, stats: updatedStats }, null, 2));
    } catch (writeError) {
      console.log('Cannot persist stats (read-only filesystem):', writeError.message);
    }
    
    res.json(updatedStats);
  } catch (error) {
    console.error('Error updating stats:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dutch', (req, res) => {
  const dutchData = JSON.parse(fs.readFileSync(dutchPath, 'utf-8'));
  const dutchArray = Object.values(dutchData).filter(item => item.id !== undefined);
  res.json(dutchArray);
});

app.get('/api/dutch/:id', (req, res) => {
  const dutchData = JSON.parse(fs.readFileSync(dutchPath, 'utf-8'));
  const item = dutchData[req.params.id];
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.patch('/api/dutch/:id', (req, res) => {
  try {
    const dutchData = JSON.parse(fs.readFileSync(dutchPath, 'utf-8'));
    if (dutchData[req.params.id]) {
      const updatedItem = { ...dutchData[req.params.id], ...req.body };
      
      try {
        dutchData[req.params.id] = updatedItem;
        fs.writeFileSync(dutchPath, JSON.stringify(dutchData, null, 2));
      } catch (writeError) {
        console.log('Cannot persist dutch update (read-only filesystem):', writeError.message);
      }
      
      res.json(updatedItem);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (error) {
    console.error('Error updating dutch:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
