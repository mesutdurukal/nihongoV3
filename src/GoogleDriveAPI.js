// Google Drive API integration for persistent storage
// This allows syncing JSON files across devices via Google Drive

const FILE_ID_DUTCH = process.env.REACT_APP_GOOGLE_DRIVE_FILE_ID_DUTCH;
const FILE_ID_KANJI = process.env.REACT_APP_GOOGLE_DRIVE_FILE_ID_KANJI;

// Get the appropriate file ID based on language
function getFileId(language = 'kanji') {
    return language === 'dutch' ? FILE_ID_DUTCH : FILE_ID_KANJI;
}

// Read JSON file from Google Drive (requires OAuth token)
async function readFromDrive(fileId, language = 'kanji') {
    const accessToken = getSavedAccessToken();
    
    if (!accessToken) {
        console.warn('Not signed in to Google Drive, using backend fallback');
        return null;
    }
    
    // Use language-specific file ID if not provided
    if (!fileId) {
        fileId = getFileId(language);
    }
    
    if (!fileId) {
        console.warn(`No FILE_ID configured for ${language}, using backend fallback`);
        return null;
    }
    
    try {
        const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Loaded data from Google Drive');
        return data;
    } catch (error) {
        console.error('Error reading from Google Drive:', error);
        return null;
    }
}

// Write JSON file to Google Drive (requires OAuth token)
async function writeToDrive(data, accessToken, fileId, language = 'kanji') {
    if (!accessToken) {
        console.warn('No access token for Google Drive');
        return null;
    }
    
    // Use language-specific file ID if not provided
    if (!fileId) {
        fileId = getFileId(language);
    }
    
    try {
        // If no fileId, create a new file
        if (!fileId) {
            console.log(`📝 Creating new ${language}.json file on Google Drive...`);
            const newFileId = await createDriveFile(data, accessToken, language);
            if (newFileId) {
                console.log('✅ File created! FILE_ID:', newFileId);
                console.log('Add this to your .env file:');
                const envVar = language === 'dutch' ? 'REACT_APP_GOOGLE_DRIVE_FILE_ID_DUTCH' : 'REACT_APP_GOOGLE_DRIVE_FILE_ID_KANJI';
                console.log(`${envVar}=${newFileId}`);
                return { id: newFileId };
            }
            return null;
        }
        
        // Update existing file
        const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log('✅ Saved data to Google Drive');
        return await response.json();
    } catch (error) {
        console.error('Error writing to Google Drive:', error);
        return null;
    }
}

// Create a new file on Google Drive
async function createDriveFile(data, accessToken, language = 'kanji') {
    try {
        // Step 1: Create file metadata
        const fileName = language === 'dutch' ? 'dutch.json' : 'kanji.json';
        const metadata = {
            name: fileName,
            mimeType: 'application/json'
        };
        
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
        
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            body: form
        });
        
        const result = await response.json();
        
        if (result.id) {
            // Make file publicly readable
            await fetch(`https://www.googleapis.com/drive/v3/files/${result.id}/permissions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    role: 'reader',
                    type: 'anyone'
                })
            });
            
            return result.id;
        }
        
        return null;
    } catch (error) {
        console.error('Error creating Drive file:', error);
        return null;
    }
}

// Get OAuth access token using Google Sign-In
async function getAccessToken() {
    // This will be implemented with Google Sign-In button
    // For now, return null to use read-only mode
    return null;
}

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('google_access_token') !== null;
}

// Save access token
function saveAccessToken(token) {
    localStorage.setItem('google_access_token', token);
    localStorage.setItem('google_token_expiry', Date.now() + 3600000); // 1 hour
}

// Get saved access token if still valid
function getSavedAccessToken() {
    const token = localStorage.getItem('google_access_token');
    const expiry = localStorage.getItem('google_token_expiry');
    
    if (token && expiry && Date.now() < parseInt(expiry)) {
        return token;
    }
    
    // Token expired, clear it
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    return null;
}

export {
    readFromDrive,
    writeToDrive,
    getAccessToken,
    isAuthenticated,
    saveAccessToken,
    getSavedAccessToken,
    getFileId,
    FILE_ID_DUTCH,
    FILE_ID_KANJI
};
