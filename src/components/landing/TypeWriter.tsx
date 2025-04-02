
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TypeWriterProps {
  text: string;
  delay?: number;
  infinite?: boolean;
  className?: string;
}

const TypeWriter: React.FC<TypeWriterProps> = ({
  text,
  delay = 100,
  infinite = false,
  className
}) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPaused) {
      timer = setTimeout(() => {
        setIsPaused(false);
      }, 1500); // Pause at the end for 1.5 seconds
      return () => clearTimeout(timer);
    }

    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentText(text.substring(0, currentIndex - 1));
        setCurrentIndex(prevIndex => prevIndex - 1);
        
        if (currentIndex <= 1) {
          setIsDeleting(false);
          setCurrentIndex(0);
        }
      }, delay / 2);
    } else {
      timer = setTimeout(() => {
        setCurrentText(text.substring(0, currentIndex + 1));
        setCurrentIndex(prevIndex => prevIndex + 1);
        
        if (currentIndex >= text.length - 1) {
          if (infinite) {
            setIsPaused(true);
            setTimeout(() => {
              setIsDeleting(true);
            }, 1500);
          }
        }
      }, delay);
    }

    return () => clearTimeout(timer);
  }, [currentIndex, delay, infinite, isDeleting, isPaused, text]);

  return (
    <span className={cn("text-primary", className)}>
      {currentText}
      <span className="inline-block w-0.5 h-6 ml-1 bg-primary animate-pulse-subtle">|</span>
    </span>
  );
};

export default TypeWriter;
