import React, { useState, useEffect } from 'react';

interface TypingEffectProps {
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  className?: string;
}

export const TypingEffect: React.FC<TypingEffectProps> = ({
  phrases,
  typingSpeed = 75,
  deletingSpeed = 40,
  pauseDuration = 2200,
  className = ''
}) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullPhrase = phrases[currentPhraseIndex];

    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing forward
      if (currentText.length < currentFullPhrase.length) {
        timer = setTimeout(() => {
          setCurrentText(currentFullPhrase.substring(0, currentText.length + 1));
        }, typingSpeed);
      } else {
        // Pause at full phrase before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      // Deleting backwards
      if (currentText.length > 0) {
        timer = setTimeout(() => {
          setCurrentText(currentFullPhrase.substring(0, currentText.length - 1));
        }, deletingSpeed);
      } else {
        // Move to next phrase
        setIsDeleting(false);
        setCurrentPhraseIndex(prev => (prev + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentPhraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{currentText}</span>
      <span className="typing-cursor" />
    </span>
  );
};
