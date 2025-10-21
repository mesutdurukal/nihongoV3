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
let vocabSize;
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

async function fetchQuestion(questionId) {
    try {
        const response = await fetch(hostIp + 'kanji/' + questionId);
        return await response.json();
    } catch (error) {
        console.error('Error fetching question:', error);
        return null;
    }
}

async function pickQuestion(questionMode) {
    try {
        const response = await fetch(hostIp + 'kanji');
        const questions = await response.json();
        
        // Filter questions based on the selected mode
        let filteredQuestions = questions;
        if (questionMode === 'weak') {
            filteredQuestions = questions.filter(q => q.correct / q.total < 0.8);
        } else if (questionMode === 'medium') {
            filteredQuestions = questions.filter(q => q.correct / q.total >= 0.8 && q.correct / q.total < 0.95);
        } else if (questionMode === 'strong') {
            filteredQuestions = questions.filter(q => q.correct / q.total >= 0.95);
        }
        
        // If no questions match the filter, use all questions
        if (filteredQuestions.length === 0) {
            filteredQuestions = questions;
        }
        
        // Select a random question
        const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
        return filteredQuestions[randomIndex];
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
