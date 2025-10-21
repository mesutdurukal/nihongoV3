import React, { useState } from 'react';
// Use the current hostname for the API URL, which will work for both local and network access
const hostname = window.location.hostname;
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
let hostIp = isLocalhost ? 'http://192.168.1.194:8080/' : `${window.location.protocol}//${window.location.hostname}:8080/`;
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
