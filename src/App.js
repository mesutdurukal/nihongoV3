import React, { useState, useEffect } from 'react';
import {refreshStats, updateStats, fetchStats, pickQuestion, updateKanji, IP} from './ApiHandler'
import {getStyle} from "./Style";

function Stats({stats}) {
    // Provide default values if stats or its properties are undefined
    const safeStats = stats || {
        size: 0,
        global: { correct: 0, total: 0, record: 0 },
        local: { correct: 0, total: 0, record: 0 }
    };
    
    const globalAccuracy = safeStats.global.total > 0 
        ? (safeStats.global.correct / safeStats.global.total).toFixed(4)
        : 0;
        
    const localAccuracy = safeStats.local.total > 0 
        ? (safeStats.local.correct / safeStats.local.total).toFixed(4)
        : 0;

    return (<>
        <div>
            <span>Vocabulary Size: {safeStats.size || 0}, </span>
            <span>Accuracy Rate: {globalAccuracy}, </span>
            <span>Record of Correct in a Row: {safeStats.global.record || 0} </span>
        </div>
        <div>
            <span>Correct in a Row: {safeStats.local.record || 0}, </span>
            <span>Accuracy Rate: {localAccuracy}, </span>
            <span>Correct: {safeStats.local.correct || 0}, </span>
            <span>Total: {safeStats.local.total || 0}, </span>
        </div><br />
    </>);
}

function QuestionMetaData({question, qMode}) {
    return (            <div>
        <span>pickMode: {qMode}, </span>
        <span>category: {question.category}, </span>
        <span>accuracy: {question.correct}/{question.total}</span>
    </div>);
}

function Answer(props) {
    const [userInput, setInput] = useState('');
    const [correctWords, setCorrectWords] = useState('');
    const [result, setResult] = useState('');
    const [enterPressed, setEnterPressed] = useState(false);

    const nextQuestion = () => {
        setInput('');           // Clear the input field
        setCorrectWords('');    // Clear correct words
        setResult('Result: ');          // Clear results
        props.nextQuestion();
    };
    const checkAnswerCallBack = async () => {
        const currentQ = { ...props.question };
        let meaning = currentQ.meaning;
        const trueWords = meaning.split(',').map(word => word.trim());
        const isUserAnswerCorrect = trueWords.some(word => word.toLowerCase() === userInput.toLowerCase());

        setCorrectWords(meaning);
        setResult(`Result: ${isUserAnswerCorrect}`);

        const updatedStats = props.stats;
        updatedStats.local.total++;updatedStats.global.total++;currentQ.total++;
        if (isUserAnswerCorrect) {
            updatedStats.global.correct++;updatedStats.local.correct++;updatedStats.local.record++;currentQ.correct++;
            if (updatedStats.local.record > updatedStats.global.record)
                updatedStats.global.record = updatedStats.local.record;
        }
        else
            updatedStats.local.record = 0;
        currentQ.percentage = currentQ.correct / currentQ.total;

        props.setQuestion(currentQ);
        props.setStats({ ...updatedStats });

        await updateStats(updatedStats);
        await updateKanji(currentQ);
    };
    const userInputKeyCallBack = e => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Stop form submission or any default action
            checkAnswerCallBack();
            setEnterPressed(true); // Set the flag to true when Enter is pressed
        } else if (e.key === ' ' && enterPressed) {
            e.preventDefault(); // Avoid adding a space in the input
            nextQuestion();
            setEnterPressed(false); // Reset the flag after space is pressed
        } else {
            setEnterPressed(false); // Reset the flag if any other key is pressed
        }
    };

    return (
        <div>
            <input type="text" value={userInput} onChange={e => setInput(e.target.value)} onKeyPress={userInputKeyCallBack}/>
            <button onClick={checkAnswerCallBack}>Check Answer</button>
            <button onClick={nextQuestion}>Next Question</button>
            <div style={getStyle(result)}>{result}</div>
            <label>Correct answers: {correctWords}</label><><br/><br/></>
        </div>
    );
}

function Root() {
    const pickMode = ["leastAnswered", "leastCorrect", "random"];
    const initialStats =  {size: 0, global: { correct: 0, total: 0, record: 0 },  local: { correct: 0, total: 0, record: 0 }};
    const [stats, setStats] = useState(initialStats);
    const [question, setQuestion] = useState({});
    const [questionMode, setQuestionMode] = useState(0); // Start with first mode

    const resetStats = async () => {
        await refreshStats();
        await updateStatsCallBack();
    };
    
    const updateStatsCallBack = async () => {
        const statsData = await fetchStats();
        setStats(statsData);
    };
    
    const nextQuestion = async () => {
        try {
            // First, move to the next mode
            setQuestionMode(prevMode => {
                const newMode = (prevMode + 1) % pickMode.length;
                return newMode;
            });
            
            // Then get the current mode (which is now the next mode)
            const currentMode = pickMode[(questionMode + 1) % pickMode.length];
            console.log('Current mode:', currentMode); // Debug log
            
            // Get next question using current mode
            const nextQ = await pickQuestion(currentMode);
            if (nextQ) {
                setQuestion(nextQ);
            }
        } catch (error) {
            console.error('Error getting next question:', error);
        }
    };

    useEffect(() => {resetStats().then(nextQuestion)}, []);

    return (
        <div>
            <Stats stats={stats}/>
            <QuestionMetaData question={question} qMode={pickMode[questionMode]}/>
            <div style={{ fontSize: '24px' }}>question: {question.kanji}</div><><br /></>
            <Answer stats={stats} setStats={setStats} question={question} setQuestion={setQuestion} nextQuestion={nextQuestion} />
        </div>
    );
}

export { Root };
