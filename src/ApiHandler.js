import React, { useState } from 'react';
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
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

async function refreshStats() {
    return await updateStats({
        "local": {
            "correct": 0,
            "total": 0,
            "record": 0
        }
    });
}

async function updateStats(input) {
    try {
        const raw = JSON.stringify(input);
        const requestOptions = {
            method: "PATCH",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };
        const response = await fetch(hostIp + 'stats', requestOptions);
        return await response.json();
    } catch (error) {
        console.error('Error refreshing stats:', error);
        return null;
    }
}

async function updateKanji(input) {
    try {
        const raw = JSON.stringify(input);
        const requestOptions = {
            method: "PATCH",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };
        const response = await fetch(hostIp + 'kanji/' + input.id, requestOptions);
        return await response.json();
    } catch (error) {
        console.error('Error updating Kanji:', error);
        return null;
    }
}

async function fetchStats() {
    try {
        const response = await fetch(hostIp + 'stats');
        return await response.json();
    } catch (error) {
        console.error('Error fetching stats:', error);
        return null;
    }
}

async function pickQuestion(mode) {
    try {
        const response = await fetch(hostIp + 'kanji');
        const questions = await response.json();
        
        console.log(`Picking question in mode: ${mode}`); // Debug log
        
        if (mode === 'random') {
            // For random mode, just pick a random question directly
            const randomIndex = Math.floor(Math.random() * questions.length);
            return questions[randomIndex];
        }
        
        // For other modes, create a filtered copy of questions
        let filteredQuestions = [...questions];
        
        if (mode === 'leastAnswered') {
            // Sort by total attempts (ascending)
            filteredQuestions.sort((a, b) => (a.total || 0) - (b.total || 0));
            
            // Get all questions with the minimum number of attempts
            const minTotal = filteredQuestions[0]?.total || 0;
            const leastAnswered = filteredQuestions.filter(q => (q.total || 0) === minTotal);
            
            // Return a random question from the least answered ones
            return leastAnswered[Math.floor(Math.random() * leastAnswered.length)];
            
        } else if (mode === 'leastCorrect') {
            // Calculate correct ratio for each question
            const questionsWithRatio = filteredQuestions.map(q => ({
                ...q,
                ratio: (q.correct || 0) / ((q.total || 0) || 1)
            }));
            
            // Sort by ratio (ascending)
            questionsWithRatio.sort((a, b) => a.ratio - b.ratio);
            
            // Get all questions with the lowest ratio
            const minRatio = questionsWithRatio[0]?.ratio || 0;
            const leastCorrect = questionsWithRatio.filter(q => q.ratio === minRatio);
            
            // Return a random question from the least correct ones
            return leastCorrect[Math.floor(Math.random() * leastCorrect.length)];
        }
        
        // Fallback: return a random question if mode is not recognized
        return questions[Math.floor(Math.random() * questions.length)];
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

export { refreshStats, updateStats, fetchStats, updateKanji, pickQuestion, IP };
