import React, { useState } from 'react';
import styled from 'styled-components';

const SpeakerButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.5rem;
  margin-left: 0.5rem;
  transition: transform 0.2s, opacity 0.2s;
  opacity: 0.7;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  
  @media (max-width: 600px) {
    font-size: 1.2rem;
    padding: 0.3rem;
  }
`;

const SpeakerIcon = ({ text, language = 'nl-BE' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      alert('Sorry, your browser does not support text-to-speech.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9; // Slightly slower for learning
    utterance.pitch = 1.0;

    // Set speaking state
    setIsSpeaking(true);
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    // Speak
    window.speechSynthesis.speak(utterance);
  };

  return (
    <SpeakerButton
      onClick={speak}
      disabled={isSpeaking}
      title={`Pronounce: ${text}`}
      aria-label={`Pronounce ${text}`}
    >
      {isSpeaking ? '🔊' : '🔈'}
    </SpeakerButton>
  );
};

export default SpeakerIcon;
