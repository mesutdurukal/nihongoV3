import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { refreshStats, updateStats, fetchStats, pickQuestion, updateKanji } from './ApiHandler';
import SpeakerIcon from './components/SpeakerIcon';

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
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  
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

const CategoryBadge = styled.div`
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
    padding: 0.3rem 0.8rem;
  }
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
  position: relative;
  overflow: visible;
`;

const IncorrectText = styled(ResultText)`
  background-color: #fff5f5;
  color: #c92a2a;
  position: relative;
  overflow: visible;
`;

const Confetti = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: ${props => props.color};
  left: ${props => props.left}%;
  animation: confetti-fall 1.5s ease-out forwards;
  opacity: 0;
  
  @keyframes confetti-fall {
    0% {
      top: -20px;
      opacity: 1;
      transform: translateY(0) rotate(0deg);
    }
    100% {
      top: 100px;
      opacity: 0;
      transform: translateY(100px) rotate(${props => props.rotation}deg);
    }
  }
`;

const DisappointedFace = styled.div`
  font-size: 4rem;
  animation: shake 0.5s ease-in-out;
  display: inline-block;
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }
`;

const LanguageSelector = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const LanguageButton = styled(Button)`
  padding: 0.5rem 1.5rem;
  background-color: ${props => props.active ? '#4dabf7' : 'white'};
  color: ${props => props.active ? 'white' : '#6c757d'};
  border: 2px solid ${props => props.active ? '#4dabf7' : '#dee2e6'};
  font-weight: ${props => props.active ? '600' : '500'};
  
  &:hover {
    border-color: #4dabf7;
    background-color: ${props => props.active ? '#339af0' : '#f1f3f5'};
  }
`;

function Stats({ stats, onReset }) {
    const safeStats = {
        size: stats?.size || 0,
        global: stats?.global || { correct: 0, total: 0, record: 0 },
        local: stats?.local || { correct: 0, total: 0, record: 0 }
    };
    
    const globalAccuracy = safeStats.global?.total > 0 
        ? Math.round((safeStats.global.correct / safeStats.global.total) * 100) 
        : 0;
    
    const localAccuracy = safeStats.local?.total > 0 
        ? Math.round((safeStats.local.correct / safeStats.local.total) * 100) 
        : 0;

    return (
        <div>
            <StatsContainer>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h2 style={{ margin: 0, color: '#2c3e50' }}>Stats</h2>
                    <Button 
                        onClick={onReset}
                        style={{ 
                            background: 'none', 
                            border: '1px solid #dee2e6',
                            color: '#6c757d',
                            padding: '0.3rem 0.8rem',
                            fontSize: '0.85rem'
                        }}
                    >
                        Reset Local Stats
                    </Button>
                </div>
                <StatRow>
                    <StatItem>Vocab: {safeStats.size}</StatItem>
                    <StatItem>Global: {safeStats.global.correct}/{safeStats.global.total} ({globalAccuracy}%)</StatItem>
                    <StatItem>Record: {safeStats.global.record}</StatItem>
                    <StatItem>Session: {safeStats.local.correct}/{safeStats.local.total} ({localAccuracy}%)</StatItem>
                    <StatItem>Session Record: {safeStats.local.record}</StatItem>
                </StatRow>
            </StatsContainer>
        </div>
    );
}

function QuestionMetaData({ question, qMode, language, direction }) {
    const statsKey = language === 'dutch' ? direction : 'kanji2en';
    const stats = question[statsKey] || { correct: 0, total: 0, percentage: 0 };
    const percentage = stats.total > 0 ? Math.round(stats.percentage * 100) : 0;
    
    return (
        <MetaData>
            <MetaItem>🎯 {qMode}</MetaItem>
            <MetaItem>✅ {stats.correct}/{stats.total} ({percentage}%)</MetaItem>
        </MetaData>
    );
}

function Answer({ question, stats, setQuestion, setStats, nextQuestion, language, direction }) {
    const [userInput, setInput] = useState('');
    const [correctWords, setCorrectWords] = useState('');
    const [isCorrect, setIsCorrect] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);

    // Reset answer state when direction or question changes
    useEffect(() => {
        setInput('');
        setCorrectWords('');
        setIsCorrect(null);
        setShowResult(false);
        setShowAnimation(false);
    }, [direction, question.id]);

    const checkAnswer = async () => {
        const currentQ = { ...question };
        // Determine which field to check based on language and direction
        let meaningField;
        if (language === 'dutch') {
            meaningField = direction === 'dutch2en' ? 'en' : 'dutch';
        } else {
            meaningField = 'meaning';
        }
        const trueWords = currentQ[meaningField].split(',').map(word => word.trim());
        
        if (!userInput.trim()) {
            // Show answer without affecting stats
            setCorrectWords(trueWords.join(', '));
            setShowResult(true);
            setIsCorrect(null); // Use null to indicate no attempt was made
            return;
        }
        
        const userAnswer = userInput.trim().toLowerCase();
        const isAnswerCorrect = trueWords.some(word => word.toLowerCase() === userAnswer);
        
        // Update stats with safe defaults
        const updatedStats = {
            size: stats?.size || 0,
            global: {
                correct: stats?.global?.correct || 0,
                total: stats?.global?.total || 0,
                record: stats?.global?.record || 0
            },
            local: {
                correct: stats?.local?.correct || 0,
                total: stats?.local?.total || 0,
                record: stats?.local?.record || 0
            }
        };
        
        updatedStats.local.total++;
        updatedStats.global.total++;
        
        // Update stats based on language and direction
        const statsKey = language === 'dutch' ? direction : 'kanji2en';
        const wordStats = currentQ[statsKey] || { correct: 0, total: 0, percentage: 0 };
        wordStats.total++;

        if (isAnswerCorrect) {
            updatedStats.global.correct++;
            updatedStats.local.correct++;
            updatedStats.local.record++;
            wordStats.correct++;
            
            if (updatedStats.local.record > updatedStats.global.record) {
                updatedStats.global.record = updatedStats.local.record;
            }
        } else {
            updatedStats.local.record = 0;
        }
        
        wordStats.percentage = wordStats.correct / wordStats.total;
        currentQ[statsKey] = wordStats;
        
        // Update state
        setIsCorrect(isAnswerCorrect);
        setCorrectWords(trueWords.join(', '));
        setShowResult(true);
        setShowAnimation(true);
        setQuestion(currentQ);
        setStats(updatedStats);
        
        // Hide animation after it completes
        setTimeout(() => setShowAnimation(false), 1500);

        // Update backend
        await Promise.all([
            updateStats(updatedStats, language),
            updateKanji(currentQ, language)
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
        setShowAnimation(false);
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
                    <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                        {isCorrect === true ? (
                            <CorrectText>
                                ✓ Correct! Well done!
                                {showAnimation && [
                                    ...Array(20).keys()
                                ].map(i => (
                                    <Confetti 
                                        key={i}
                                        color={['#51cf66', '#94d82d', '#ffd43b', '#74c0fc'][i % 4]}
                                        left={5 + (i * 4.5)}
                                        rotation={Math.random() * 360}
                                    />
                                ))}
                            </CorrectText>
                        ) : isCorrect === false ? (
                            <IncorrectText>
                                {showAnimation && <DisappointedFace>😞</DisappointedFace>}
                                <div>✗ Incorrect</div>
                            </IncorrectText>
                        ) : (
                            <div style={{ color: '#6c757d', marginBottom: '1rem' }}>Answer:</div>
                        )}
                        
                        <div style={{ margin: '1rem 0', color: '#6c757d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                            Correct answer: <strong>{correctWords}</strong>
                            {language === 'dutch' && direction === 'en2dutch' && correctWords && (
                                <SpeakerIcon text={correctWords.split(',')[0].trim()} language="nl-BE" />
                            )}
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
    const [language, setLanguage] = useState('kanji');
    const [direction, setDirection] = useState('dutch2en'); // dutch2en or en2dutch

    const updateStatsCallBack = useCallback(async () => {
        try {
            const statsData = await fetchStats(language);
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }, [language]);
    
    const resetStats = useCallback(async () => {
        try {
            const resetResult = await refreshStats(language);
            if (resetResult) {
                setStats(resetResult);
            } else {
                // Fallback: refetch stats
                await updateStatsCallBack();
            }
        } catch (error) {
            console.error('Error resetting stats:', error);
        }
    }, [updateStatsCallBack, language]);
    
    const getNextQuestion = useCallback(async () => {
        try {
            const currentMode = pickMode[questionMode];
            const nextQ = await pickQuestion(currentMode, language);
            if (nextQ) {
                setQuestion(nextQ);
            }
        } catch (error) {
            console.error('Error getting next question:', error);
        } finally {
            setIsLoading(false);
        }
    }, [questionMode, language]);

    const handleNextQuestion = async () => {
        setIsLoading(true);
        // Move to next mode
        setQuestionMode(prevMode => (prevMode + 1) % pickMode.length);
        await getNextQuestion();
    };

    useEffect(() => {
        const initialize = async () => {
            try {
                setIsLoading(true);
                // Only reset stats if they don't exist
                const currentStats = await fetchStats(language);
                if (!currentStats || !currentStats.global) {
                    await resetStats();
                } else {
                    // Keep the current stats
                    setStats(currentStats);
                }
                await getNextQuestion();
            } catch (error) {
                console.error('Initialization error:', error);
            }
        };
        initialize();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]); // Re-initialize when language changes

    if (isLoading) {
        return (
            <Container>
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
            </Container>
        );
    }

    const handleLanguageChange = (newLanguage) => {
        if (newLanguage !== language) {
            setLanguage(newLanguage);
        }
    };

    return (
        <Container>
            <LanguageSelector>
                <LanguageButton 
                    active={language === 'kanji'}
                    onClick={() => handleLanguageChange('kanji')}
                >
                    🇯🇵 Kanji
                </LanguageButton>
                <LanguageButton 
                    active={language === 'dutch'}
                    onClick={() => handleLanguageChange('dutch')}
                >
                    🇳🇱 Dutch
                </LanguageButton>
            </LanguageSelector>
            
            {language === 'dutch' && (
                <LanguageSelector style={{ marginTop: '-1rem' }}>
                    <LanguageButton 
                        active={direction === 'dutch2en'}
                        onClick={() => setDirection('dutch2en')}
                    >
                        🇳🇱 → 🇬🇧 Dutch to English
                    </LanguageButton>
                    <LanguageButton 
                        active={direction === 'en2dutch'}
                        onClick={() => setDirection('en2dutch')}
                    >
                        🇬🇧 → 🇳🇱 English to Dutch
                    </LanguageButton>
                </LanguageSelector>
            )}
            
            <QuestionContainer>
                {question.category && (
                    <CategoryBadge>{question.category}</CategoryBadge>
                )}
                <QuestionText>
                    {language === 'dutch' 
                        ? (direction === 'dutch2en' ? question.dutch : question.en)
                        : question.kanji
                    } {question.kanji || question.dutch || question.en ? '' : '?'}
                    {language === 'dutch' && direction === 'dutch2en' && question.dutch && (
                        <SpeakerIcon text={question.dutch} language="nl-BE" />
                    )}
                </QuestionText>
                <QuestionMetaData question={question} qMode={pickMode[questionMode]} language={language} direction={direction} />
                
                <Answer 
                    question={question} 
                    setQuestion={setQuestion} 
                    stats={stats} 
                    setStats={setStats} 
                    nextQuestion={handleNextQuestion}
                    language={language}
                    direction={direction}
                />
            </QuestionContainer>
            
            <Stats stats={stats} onReset={resetStats} />
        </Container>
    );
}

export { Root };
