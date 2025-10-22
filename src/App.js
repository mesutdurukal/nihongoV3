import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { refreshStats, updateStats, fetchStats, pickQuestion, updateKanji } from './ApiHandler';

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  
  @media (max-width: 600px) {
    padding: 0.5rem;
  }
`;

const StatsContainer = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const StatRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.5rem;
`;

const StatItem = styled.span`
  background-color: #e9ecef;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #495057;
  white-space: nowrap;
  
  @media (max-width: 480px) {
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
  }
`;

const QuestionContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 600px) {
    padding: 1rem;
    margin-bottom: 0.5rem;
  }
`;

const QuestionText = styled.div`
  font-size: 3rem;
  font-weight: bold;
  margin: 1.5rem 0;
  color: #2c3e50;
  min-height: 4.5rem;
  word-break: break-word;
  
  @media (max-width: 600px) {
    font-size: 2.5rem;
    margin: 1rem 0;
  }
`;

const MetaData = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: #6c757d;
  font-size: 0.9rem;
  
  @media (max-width: 480px) {
    gap: 0.5rem;
    font-size: 0.8rem;
  }
`;

const MetaItem = styled.span`
  background: #f1f3f5;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

const Input = styled.input`
  padding: 0.75rem 1.25rem;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  box-sizing: border-box;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #4dabf7;
    box-shadow: 0 0 0 3px rgba(77, 171, 247, 0.2);
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #4dabf7;
  color: white;
  min-width: 150px;
  
  &:hover {
    background-color: #339af0;
  }
`;

const ResultText = styled.div`
  margin: 1.5rem 0;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
  font-size: 1.1rem;
`;

const CorrectText = styled(ResultText)`
  background-color: #ebfbee;
  color: #2b8a3e;
`;

const IncorrectText = styled(ResultText)`
  background-color: #fff5f5;
  color: #c92a2a;
`;

function Stats({ stats }) {
    const safeStats = stats || {
        size: 0,
        global: { correct: 0, total: 0, record: 0 },
        local: { correct: 0, total: 0, record: 0 }
    };
    
    const globalAccuracy = safeStats.global.total > 0 
        ? Math.round((safeStats.global.correct / safeStats.global.total) * 100) 
        : 0;
    
    const localAccuracy = safeStats.local.total > 0 
        ? Math.round((safeStats.local.correct / safeStats.local.total) * 100) 
        : 0;

    return (
        <StatsContainer>
            <h2 style={{ marginTop: 0, color: '#2c3e50' }}>Stats</h2>
            <StatRow>
                <StatItem>Total: {safeStats.size}</StatItem>
            </StatRow>
            <StatRow>
                <StatItem>Global: {safeStats.global.correct}/{safeStats.global.total} ({globalAccuracy}%)</StatItem>
                <StatItem>Record: {safeStats.global.record}</StatItem>
            </StatRow>
            <StatRow>
                <StatItem>Session: {safeStats.local.correct}/{safeStats.local.total} ({localAccuracy}%)</StatItem>
                <StatItem>Record: {safeStats.local.record}</StatItem>
            </StatRow>
        </StatsContainer>
    );
}

function QuestionMetaData({ question, qMode }) {
    return (
        <MetaData>
            <MetaItem>🎯 {qMode}</MetaItem>
            <MetaItem>✅ {question.correct || 0}/{question.total || 0}</MetaItem>
        </MetaData>
    );
}

function Answer({ question, stats, setQuestion, setStats, nextQuestion }) {
    const [userInput, setInput] = useState('');
    const [correctWords, setCorrectWords] = useState('');
    const [isCorrect, setIsCorrect] = useState(null);
    const [showResult, setShowResult] = useState(false);

    const checkAnswer = async () => {
        const currentQ = { ...question };
        const trueWords = currentQ.meaning.split(',').map(word => word.trim());
        
        if (!userInput.trim()) {
            // Show answer without affecting stats
            setCorrectWords(trueWords.join(', '));
            setShowResult(true);
            setIsCorrect(null); // Use null to indicate no attempt was made
            return;
        }
        
        const userAnswer = userInput.trim().toLowerCase();
        const isAnswerCorrect = trueWords.some(word => word.toLowerCase() === userAnswer);
        
        // Update stats
        const updatedStats = { ...stats };
        updatedStats.local.total++;
        updatedStats.global.total++;
        currentQ.total = (currentQ.total || 0) + 1;

        if (isAnswerCorrect) {
            updatedStats.global.correct++;
            updatedStats.local.correct++;
            updatedStats.local.record++;
            currentQ.correct = (currentQ.correct || 0) + 1;
            
            if (updatedStats.local.record > updatedStats.global.record) {
                updatedStats.global.record = updatedStats.local.record;
            }
        } else {
            updatedStats.local.record = 0;
        }
        
        currentQ.percentage = currentQ.correct / currentQ.total;
        
        // Update state
        setIsCorrect(isAnswerCorrect);
        setCorrectWords(trueWords.join(', '));
        setShowResult(true);
        setQuestion(currentQ);
        setStats(updatedStats);

        // Update backend
        await Promise.all([
            updateStats(updatedStats),
            updateKanji(currentQ)
        ]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (showResult) {
                handleNext();
            } else {
                checkAnswer();
            }
        }
    };

    const handleNext = () => {
        setInput('');
        setCorrectWords('');
        setIsCorrect(null);
        setShowResult(false);
        nextQuestion();
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <Input
                    type="text"
                    value={userInput}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your answer..."
                    autoFocus
                    disabled={showResult}
                    style={{
                        opacity: showResult ? 0.7 : 1,
                        textAlign: 'center',
                        fontSize: '1.1rem',
                        marginBottom: '1.5rem'
                    }}
                />
            </div>

            <div style={{ marginTop: '1.5rem' }}>
                {showResult && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        {isCorrect === true ? (
                            <CorrectText>✓ Correct! Well done!</CorrectText>
                        ) : isCorrect === false ? (
                            <IncorrectText>✗ Incorrect</IncorrectText>
                        ) : (
                            <div style={{ color: '#6c757d', marginBottom: '1rem' }}>Answer:</div>
                        )}
                        
                        <div style={{ margin: '1rem 0', color: '#6c757d' }}>
                            Correct answer: <strong>{correctWords}</strong>
                        </div>
                    </div>
                )}
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Button 
                        onClick={checkAnswer}
                        style={{
                            background: showResult ? 'none' : '#4dabf7',
                            border: '1px solid #dee2e6',
                            color: showResult ? '#6c757d' : 'white',
                            flex: 1,
                            maxWidth: '200px',
                            cursor: 'pointer',
                            opacity: showResult ? 0.7 : 1
                        }}
                        disabled={showResult}
                    >
                        Check Answer
                    </Button>
                    <PrimaryButton 
                        onClick={handleNext}
                        style={{ 
                            flex: 1,
                            maxWidth: '200px',
                            background: showResult ? '#4dabf7' : 'none',
                            color: showResult ? 'white' : '#6c757d',
                            border: '1px solid #dee2e6'
                        }}
                    >
                        Next Question
                    </PrimaryButton>
                </div>
            </div>
            )}
        </div>
    );
}

const pickMode = ['leastAnswered', 'leastCorrect', 'random'];

function Root() {
    const [stats, setStats] = useState({ 
        size: 0, 
        global: { correct: 0, total: 0, record: 0 }, 
        local: { correct: 0, total: 0, record: 0 } 
    });
    
    const [question, setQuestion] = useState({});
    const [questionMode, setQuestionMode] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const resetStats = async () => {
        try {
            await refreshStats();
            await updateStatsCallBack();
        } catch (error) {
            console.error('Error resetting stats:', error);
        }
    };
    
    const updateStatsCallBack = async () => {
        try {
            const statsData = await fetchStats();
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };
    
    const getNextQuestion = async () => {
        try {
            const currentMode = pickMode[questionMode];
            const nextQ = await pickQuestion(currentMode);
            if (nextQ) {
                setQuestion(nextQ);
            }
        } catch (error) {
            console.error('Error getting next question:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextQuestion = async () => {
        setIsLoading(true);
        // Move to next mode
        setQuestionMode(prevMode => (prevMode + 1) % pickMode.length);
        await getNextQuestion();
    };

    useEffect(() => {
        const initialize = async () => {
            await resetStats();
            await getNextQuestion();
        };
        initialize();
    }, []);

    if (isLoading) {
        return (
            <Container>
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
            </Container>
        );
    }

    return (
        <Container>
            <QuestionContainer>
                <QuestionText>{question.kanji || '?'}</QuestionText>
                <QuestionMetaData question={question} qMode={pickMode[questionMode]} />
                
                <Answer 
                    question={question} 
                    setQuestion={setQuestion} 
                    stats={stats} 
                    setStats={setStats} 
                    nextQuestion={handleNextQuestion} 
                />
            </QuestionContainer>
            
            <Stats stats={stats} />
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <Button 
                    onClick={resetStats}
                    style={{ 
                        background: 'none', 
                        border: '1px solid #dee2e6',
                        color: '#6c757d'
                    }}
                >
                    Reset All Stats
                </Button>
            </div>
        </Container>
    );
}

export { Root };
