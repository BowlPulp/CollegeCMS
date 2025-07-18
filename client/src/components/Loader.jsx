import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function Loader({ message = "Loading..." }) {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);

  // Simulate loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 10 + 5; // Steady progress
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-[var(--primary)] flex items-center justify-center z-50">
      <div className="text-center">
        {/* Logo Container */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-4 relative">
            {/* Simple spinning border */}
            
            {/* Logo */}
            <div className="absolute inset-1 bg-[var(--secondary)] rounded-sm flex items-center justify-center">
              <img 
                src="/chitkara.jpeg" 
                alt="Chitkara University" 
                className="w-26 h-26 rounded-md object-cover"
              />
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--accent)] mb-2">
            ChitkaraCMS
          </h2>
          <p className="text-[var(--neutral)]/70">
            {message}
          </p>
        </div>

        {/* Loading Bar */}
        <div className="w-64 mx-auto mb-3">
          <div className="w-full bg-[var(--secondary)] rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[var(--accent)] h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Progress Text */}
        <p className="text-[var(--neutral)]/60 text-sm">
          {Math.round(Math.min(progress, 100))}%
        </p>
      </div>
    </div>
  );
}
