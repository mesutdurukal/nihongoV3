import React, { useState } from 'react';
let hostIp = "http://localhost:8080/"; // Make sure this is correct and reachable
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
        const data = await response.json();
        let results = "";
        const order = ["size", "correct", "total", "record"];
        order.forEach(key => {
            if (data[key] !== undefined) {
                results += `${key}: ${data[key]}, `;
            }
        });
        vocabSize = data["size"];
        return data;
    } catch (error) {
        console.error('Error fetching stats:', error);
        return "";
    }
}

async function fetchQuestion(questionId) {
    try {
        const response = await fetch(hostIp + 'kanji/' + questionId);
        const r = await response.json();
        return r;
    } catch (error) {
        console.error('Failed to fetch data:', error);
        return 'Failed to fetch data';
    }
}

async function pickQuestion(questionMode) {

    let leastAsked = 0;    let leastCorrect = -0.1;

    // LEAST ASKED
    if (questionMode % 3 === 0) {
        let next; let searchCount = 0; let currentAsked;
        while (true) {
            next = Math.floor(Math.random() * vocabSize) + 1;
            const r = await fetchQuestion(next);
            // How many times the currently picked question is asked
            try {currentAsked = parseInt(r.total);if (isNaN(currentAsked)) currentAsked = 0;} catch (e) {currentAsked = 0;}
            // Is it lower than the least? If so, return this question
            if (leastAsked >= currentAsked) {leastAsked = currentAsked;return r;}
            // if not, continue search. If already tried 2 times vocab size, increase the least and reset counter
            if (searchCount++ > 2) {leastAsked++;searchCount = 0;}
        }
    }

    // LEAST CORRECT
    else if (questionMode % 3 == 1) {
        let next; let currentMin; let couldNotFound = 0;
        while (true) {
            next = Math.floor(Math.random() * vocabSize) + 1;
            const r = await fetchQuestion(next);
            try {currentMin = parseFloat(r.percentage);} catch (e) {currentMin = 0;}
            if ((leastCorrect >= currentMin) || isNaN(currentMin)) {leastCorrect = currentMin;return r;}
            if (couldNotFound++ > vocabSize * 2) { leastCorrect = isNaN(leastCorrect) ? 0 : leastCorrect + 0.1; couldNotFound = 0; }
        }
    }

    // RANDOM
    else
        return await fetchQuestion(Math.floor(Math.random() * vocabSize) + 1);

}

function IP() {
    const [ip, setIp] = useState(hostIp);  // Initialize the state with hostIp
    const handleInputChange = (event) => {setIp(event.target.value); };
    return (
        <>
            <input type="text" value={ip} onChange={handleInputChange} placeholder="Enter server IP"/>
            <button onClick={()=>{hostIp = ip;}}>Set Server IP</button>
            <button onClick={refreshStats}>Reset Local Stats</button><><br/></>
            <label id="iplabel" style={{ fontFamily: "Arial, sans-serif", fontSize: "14px" }}>{ip}</label>
        </>
    );
}

export {refreshStats, updateStats, fetchStats, updateKanji, pickQuestion, IP }