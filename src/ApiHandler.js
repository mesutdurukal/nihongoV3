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
// No CACHE_DURATION needed - cache is always fresh because we update it on every word change
// Only refetch when cache is empty (initial load, page refresh, or language change)

// Sorted indices for efficient picking (no need to refetch!)
let sortedByLeastAnswered = null;
let sortedByLeastCorrect = null;
let currentLanguage = null;
let currentStatsKey = null;

// Flag to track if Sheets are being loaded in background
let sheetsLoadingInProgress = false;

// LocalStorage cache keys
const CACHE_KEY_PREFIX = 'nihongo_sheets_cache_';
const CACHE_TIMESTAMP_PREFIX = 'nihongo_sheets_timestamp_';
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

// Load cache from localStorage
function loadCacheFromStorage(language) {
    try {
        const cacheKey = CACHE_KEY_PREFIX + language;
        const timestampKey = CACHE_TIMESTAMP_PREFIX + language;
        
        const cached = localStorage.getItem(cacheKey);
        const timestamp = localStorage.getItem(timestampKey);
        
        if (cached && timestamp) {
            const age = Date.now() - parseInt(timestamp);
            if (age < CACHE_MAX_AGE) {
                console.log('💾 Loaded cache from localStorage (age:', Math.round(age / 1000 / 60), 'minutes)');
                return JSON.parse(cached);
            } else {
                console.log('🗑️ Cache expired, will fetch fresh data');
            }
        }
    } catch (error) {
        console.error('Error loading cache from storage:', error);
    }
    return null;
}

// Save cache to localStorage
function saveCacheToStorage(language, data) {
    try {
        const cacheKey = CACHE_KEY_PREFIX + language;
        const timestampKey = CACHE_TIMESTAMP_PREFIX + language;
        
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(timestampKey, Date.now().toString());
        console.log('💾 Saved cache to localStorage');
    } catch (error) {
        console.error('Error saving cache to storage:', error);
    }
}

// Load Sheets data in background (non-blocking)
function loadSheetsInBackground(language) {
    if (sheetsLoadingInProgress || !isSheetsConfigured()) {
        return;
    }
    
    sheetsLoadingInProgress = true;
    console.log('🔄 Loading Google Sheets in background...');
    
    readFromSheets(language)
        .then(sheetsData => {
            if (sheetsData) {
                sheetsDataCache = sheetsData;
                saveCacheToStorage(language, sheetsData);
                console.log('✅ Background Sheets load complete');
                reindexInBackground(language);
            }
        })
        .catch(error => {
            console.error('Error loading Sheets in background:', error);
        })
        .finally(() => {
            sheetsLoadingInProgress = false;
        });
}

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

// Helper function to reindex sorted arrays in background
function reindexInBackground(language) {
    const statsKey = language === 'dutch' ? 'dutch2en' : 'kanji2en';
    
    if (!sheetsDataCache) return;
    
    // Use setTimeout to make it async and non-blocking
    setTimeout(() => {
        console.log('🔄 Reindexing in background while user thinks...');
        const questions = Object.values(sheetsDataCache).filter(item => item && item.id);
        
        // Sort by least answered
        sortedByLeastAnswered = [...questions].sort((a, b) => 
            (a[statsKey]?.total || 0) - (b[statsKey]?.total || 0)
        );
        
        // Sort by least correct
        sortedByLeastCorrect = [...questions].map(q => {
            const stats = q[statsKey] || { correct: 0, total: 0 };
            return {
                ...q,
                _ratio: stats.total > 0 ? (stats.correct / stats.total) : 0
            };
        }).sort((a, b) => a._ratio - b._ratio);
        
        currentLanguage = language;
        currentStatsKey = statsKey;
        console.log('✅ Background reindexing complete - next question ready!');
    }, 0);
}

async function updateWord(input, language = 'kanji') {
    try {
        // Try to update Google Sheets first if configured
        if (isSheetsConfigured()) {
            const result = await updateWordInSheets(input, language);
            if (result && result.success) {
                console.log('✅ Updated word in Google Sheets');
                
                // Update the cached word data to prevent stale stats
                if (sheetsDataCache) {
                    const key = (input.id - 1).toString();
                    if (sheetsDataCache[key]) {
                        sheetsDataCache[key] = input;
                        
                        // Also update localStorage cache
                        saveCacheToStorage(language, sheetsDataCache);
                        
                        // Reindex in background while user thinks about next question
                        reindexInBackground(language);
                    }
                }
                
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
        
        // Strategy 1: Check memory cache first (instant)
        if (sheetsDataCache && currentLanguage === language) {
            questions = Object.values(sheetsDataCache).filter(item => item && item.id);
            console.log('⚡ Using memory cache (instant!)');
        }
        
        // Strategy 2: Check localStorage cache (very fast, ~10ms)
        // Use cache for instant display, but always refresh in background
        if (!questions && isSheetsConfigured()) {
            const cachedData = loadCacheFromStorage(language);
            if (cachedData) {
                sheetsDataCache = cachedData;
                questions = Object.values(cachedData).filter(item => item && item.id);
                currentLanguage = language;
                reindexInBackground(language);
            }
            
            // Always refresh Sheets in background to get latest data
            loadSheetsInBackground(language);
        }
        
        // Strategy 3: Use backend API (fast, ~100-200ms)
        if (!questions) {
            const endpoint = language === 'dutch' ? 'dutch' : 'kanji';
            console.log('🚀 Using backend API (fast path)');
            const response = await fetch(hostIp + 'api/' + endpoint);
            questions = await response.json();
            reindexInBackground(language);
            
            // Load Sheets in background for future requests
            if (isSheetsConfigured()) {
                loadSheetsInBackground(language);
            }
        }
        
        console.log(`Picking question in mode: ${mode} for language: ${language}`);
        
        // Determine the stats key based on language
        const statsKey = language === 'dutch' ? 'dutch2en' : 'kanji2en';
        
        if (mode === 'random') {
            // For random mode, just pick a random question directly
            const randomIndex = Math.floor(Math.random() * questions.length);
            return JSON.parse(JSON.stringify(questions[randomIndex]));
        }
        
        // Check if sorted arrays are ready (should be from background reindex)
        if (mode === 'leastAnswered' && sortedByLeastAnswered && currentLanguage === language) {
            // Use pre-sorted array - instant! ⚡
            console.log('⚡ Using pre-sorted array (instant pick!)');
            const minTotal = sortedByLeastAnswered[0]?.[statsKey]?.total || 0;
            const leastAnswered = sortedByLeastAnswered.filter(q => 
                (q[statsKey]?.total || 0) === minTotal
            );
            return JSON.parse(JSON.stringify(leastAnswered[Math.floor(Math.random() * leastAnswered.length)]));
            
        } else if (mode === 'leastCorrect' && sortedByLeastCorrect && currentLanguage === language) {
            // Use pre-sorted array - instant! ⚡
            console.log('⚡ Using pre-sorted array (instant pick!)');
            const minRatio = sortedByLeastCorrect[0]?._ratio || 0;
            const leastCorrect = sortedByLeastCorrect.filter(q => q._ratio === minRatio);
            
            // Pick and remove temporary ratio field
            const selected = leastCorrect[Math.floor(Math.random() * leastCorrect.length)];
            const { _ratio, ...questionWithoutRatio } = selected;
            return JSON.parse(JSON.stringify(questionWithoutRatio));
        }
        
        // Fallback: sort on-demand if arrays not ready yet (first question only)
        console.log('⏳ Sorting on-demand (first question)...');
        let filteredQuestions = [...questions];
        
        if (mode === 'leastAnswered') {
            filteredQuestions.sort((a, b) => 
                (a[statsKey]?.total || 0) - (b[statsKey]?.total || 0)
            );
            const minTotal = filteredQuestions[0]?.[statsKey]?.total || 0;
            const leastAnswered = filteredQuestions.filter(q => 
                (q[statsKey]?.total || 0) === minTotal
            );
            return JSON.parse(JSON.stringify(leastAnswered[Math.floor(Math.random() * leastAnswered.length)]));
            
        } else if (mode === 'leastCorrect') {
            const questionsWithRatio = filteredQuestions.map(q => {
                const stats = q[statsKey] || { correct: 0, total: 0 };
                return {
                    ...q,
                    _ratio: stats.total > 0 ? (stats.correct / stats.total) : 0
                };
            }).sort((a, b) => a._ratio - b._ratio);
            
            const minRatio = questionsWithRatio[0]?._ratio || 0;
            const leastCorrect = questionsWithRatio.filter(q => q._ratio === minRatio);
            const selected = leastCorrect[Math.floor(Math.random() * leastCorrect.length)];
            const { _ratio, ...questionWithoutRatio } = selected;
            return JSON.parse(JSON.stringify(questionWithoutRatio));
        }
        
        // Fallback: random
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
