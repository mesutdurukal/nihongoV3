import { readFromSheets, updateWordInSheets, updateStatsInSheets, readStatsFromSheets, isSheetsConfigured } from './SheetsAPI';

// Get API base URL
const getApiBaseUrl = () => {
  // Use REACT_APP_API_BASE_URL if defined in .env file
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL.endsWith('/') 
      ? process.env.REACT_APP_API_BASE_URL 
      : `${process.env.REACT_APP_API_BASE_URL}/`;
  }
  
  const { hostname, protocol } = window.location;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  if (isLocalhost) {
    // In development, use the current hostname which will be localhost
    // or the IP if accessed via network
    return `${protocol}//${window.location.hostname}:8080/`;
  }
  
  // In production, use the current host
  return `${protocol}//${hostname}:8080/`;
};

const hostIp = getApiBaseUrl();
console.log('API Base URL:', hostIp);
console.log('Environment:', process.env.NODE_ENV);
console.log('REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

// Cache for Google Sheets data
let sheetsDataCache = null;
let lastSheetsFetch = 0;
const CACHE_DURATION = 5000; // 5 seconds

async function refreshStats(language = 'kanji') {
    try {
        // First fetch current stats to preserve global stats
        const currentStats = await fetchStats(language);
        
        // Reset only local stats, keep global stats
        const updatedStats = {
            ...currentStats,
            local: {
                correct: 0,
                total: 0,
                record: 0
            }
        };
        
        return await updateStats(updatedStats, language);
    } catch (error) {
        console.error('Error refreshing stats:', error);
        return null;
    }
}

async function updateStats(input, language = 'kanji') {
    try {
        // Try to update Google Sheets first if configured
        if (isSheetsConfigured()) {
            const result = await updateStatsInSheets(input, language);
            if (result && result.success) {
                console.log('✅ Updated stats in Google Sheets');
                return input;
            }
            console.warn('Failed to update Sheets, falling back to backend');
        }
        
        // Fallback to backend
        const endpoint = language === 'dutch' ? 'dutch' : 'kanji';
        const raw = JSON.stringify(input);
        const requestOptions = {
            method: "PATCH",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };
        const response = await fetch(hostIp + 'api/' + endpoint + '/stats', requestOptions);
        return await response.json();
    } catch (error) {
        console.error('Error updating stats:', error);
        return null;
    }
}

async function updateWord(input, language = 'kanji') {
    try {
        // Try to update Google Sheets first if configured
        if (isSheetsConfigured()) {
            const result = await updateWordInSheets(input, language);
            if (result && result.success) {
                console.log('✅ Updated word in Google Sheets');
                // Update cache timestamp to prevent immediate re-fetch
                lastSheetsFetch = Date.now();
                return input;
            }
            console.warn('Failed to update Sheets, falling back to backend');
        }
        
        // Fallback to backend
        const raw = JSON.stringify(input);
        const { id, ...rest } = input;
        const requestOptions = {
            method: "PATCH",
            headers: myHeaders,
            body: JSON.stringify(rest),
            redirect: "follow"
        };
        const endpoint = language === 'dutch' ? 'dutch' : 'kanji';
        const url = hostIp + 'api/' + endpoint + '/' + id;
        console.log('Updating word at:', url); // Debug log
        const response = await fetch(url, requestOptions);
        return await response.json();
    } catch (error) {
        console.error('Error updating word:', error);
        return null;
    }
}

async function fetchStats(language = 'kanji') {
    try {
        // Try to get stats from Sheets first if configured
        if (isSheetsConfigured()) {
            const stats = await readStatsFromSheets(language);
            if (stats) {
                return stats;
            }
            console.warn('Failed to fetch from Sheets, falling back to backend');
        }
        
        // Fallback to backend
        const endpoint = language === 'dutch' ? 'dutch' : 'kanji';
        const response = await fetch(hostIp + 'api/' + endpoint + '/stats');
        return await response.json();
    } catch (error) {
        console.error('Error fetching stats:', error);
        return null;
    }
}

async function pickQuestion(mode, language = 'kanji') {
    try {
        let questions;
        
        // Try Google Sheets first if configured
        const now = Date.now();
        if (isSheetsConfigured()) {
            if (now - lastSheetsFetch > CACHE_DURATION) {
                const sheetsData = await readFromSheets(language);
                if (sheetsData) {
                    sheetsDataCache = sheetsData;
                    lastSheetsFetch = now;
                    console.log('📦 Loaded data from Google Sheets');
                    questions = Object.values(sheetsData).filter(item => item && item.id);
                }
            } else if (sheetsDataCache) {
                questions = Object.values(sheetsDataCache).filter(item => item && item.id);
                console.log('📦 Using cached Google Sheets data');
            }
        }
        
        // Fallback to backend if Sheets not available
        if (!questions) {
            const endpoint = language === 'dutch' ? 'dutch' : 'kanji';
            const response = await fetch(hostIp + 'api/' + endpoint);
            questions = await response.json();
            console.log('🔄 Loaded data from backend');
        }
        
        console.log(`Picking question in mode: ${mode} for language: ${language}`); // Debug log
        
        // Determine the stats key based on language
        const statsKey = language === 'dutch' ? 'dutch2en' : 'kanji2en';
        
        if (mode === 'random') {
            // For random mode, just pick a random question directly
            const randomIndex = Math.floor(Math.random() * questions.length);
            // Return a deep copy to ensure fresh stats
            return JSON.parse(JSON.stringify(questions[randomIndex]));
        }
        
        // For other modes, create a filtered copy of questions
        let filteredQuestions = [...questions];
        
        if (mode === 'leastAnswered') {
            // Sort by total attempts (ascending)
            filteredQuestions.sort((a, b) => 
                (a[statsKey]?.total || 0) - (b[statsKey]?.total || 0)
            );
            
            // Get all questions with the minimum number of attempts
            const minTotal = filteredQuestions[0]?.[statsKey]?.total || 0;
            const leastAnswered = filteredQuestions.filter(q => 
                (q[statsKey]?.total || 0) === minTotal
            );
            
            // Return a random question from the least answered ones (deep copy for fresh stats)
            return JSON.parse(JSON.stringify(leastAnswered[Math.floor(Math.random() * leastAnswered.length)]));
            
        } else if (mode === 'leastCorrect') {
            // Calculate correct ratio for each question
            const questionsWithRatio = filteredQuestions.map(q => {
                const stats = q[statsKey] || { correct: 0, total: 0 };
                return {
                    ...q,
                    ratio: stats.total > 0 ? (stats.correct / stats.total) : 0
                };
            });
            
            // Sort by ratio (ascending)
            questionsWithRatio.sort((a, b) => a.ratio - b.ratio);
            
            // Get all questions with the lowest ratio
            const minRatio = questionsWithRatio[0]?.ratio || 0;
            const leastCorrect = questionsWithRatio.filter(q => q.ratio === minRatio);
            
            // Pick a random question and remove the temporary ratio field
            const selected = leastCorrect[Math.floor(Math.random() * leastCorrect.length)];
            const { ratio, ...questionWithoutRatio } = selected;
            
            // Return a deep copy for fresh stats
            return JSON.parse(JSON.stringify(questionWithoutRatio));
        }
        
        // Fallback: return a random question if mode is not recognized (deep copy for fresh stats)
        return JSON.parse(JSON.stringify(questions[Math.floor(Math.random() * questions.length)]));
    } catch (error) {
        console.error('Error picking question:', error);
        return null;
    }
}

// Get the current IP address
async function IP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error getting IP:', error);
        return null;
    }
}

export { refreshStats, updateStats, fetchStats, updateWord, pickQuestion, IP };
