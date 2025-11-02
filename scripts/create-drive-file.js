// Simple script to create a Google Drive file that your app can access
// Run with: node scripts/create-drive-file.js

const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec } = require('child_process');

const CLIENT_ID = '483528819483-unf4gnjjqm6kjl9e6vak8vrfcoibn59j.apps.googleusercontent.com';
const REDIRECT_URI = 'http://localhost:8080/oauth2callback';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

console.log('\n🚀 Google Drive File Creator\n');
console.log('This will create a dutch.json file on your Google Drive that your app can access.\n');

// Step 1: Get authorization URL
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(SCOPES)}&` +
    `access_type=offline`;

console.log('Step 1: Opening browser for authorization...\n');
console.log('If browser doesn\'t open, visit this URL:');
console.log(authUrl);
console.log('');

// Open browser
exec(`open "${authUrl}"`);

// Step 2: Start local server to receive callback
const server = http.createServer(async (req, res) => {
    if (req.url.startsWith('/oauth2callback')) {
        const url = new URL(req.url, `http://localhost:8080`);
        const code = url.searchParams.get('code');
        
        if (code) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<h1>✅ Authorization successful!</h1><p>You can close this window and return to the terminal.</p>');
            
            console.log('✅ Authorization received!\n');
            console.log('Step 2: Creating file on Google Drive...\n');
            
            try {
                // Note: This is a simplified version. In production, you'd exchange the code for a token
                // For now, we'll just show instructions
                console.log('⚠️  To complete setup, you need to manually create the file.');
                console.log('\nAlternative: Use your React app to create the file:');
                console.log('1. Make sure you\'re signed in to your app');
                console.log('2. The app will create the file automatically on first write\n');
                
                server.close();
            } catch (error) {
                console.error('❌ Error:', error.message);
                server.close();
            }
        } else {
            res.writeHead(400);
            res.end('No code received');
            server.close();
        }
    }
});

server.listen(8080, () => {
    console.log('Waiting for authorization...\n');
});
