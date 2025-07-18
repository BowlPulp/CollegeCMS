import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer className="bg-[var(--secondary)] border-t border-[var(--accent)]/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Left - University Name with Logo */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <img 
                src="/chitkara.jpeg" 
                alt="Chitkara University Logo" 
                className="h-10 w-10 rounded-sm object-cover"
              />
              <h3 className="text-lg font-semibold text-[var(--accent)]">
                Chitkara University
              </h3>
            </div>
          </div>

          {/* Center - System Name & Rights */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[var(--neutral)] mb-1">
              Chitkara Cluster Management System
            </h3>
            {/* <p className="text-sm font-medium text-[var(--accent)]">
              CCMS
            </p> */}
            <p className="text-sm text-[var(--neutral)]/70 mt-2">
              All rights reserved
            </p>
          </div>

          {/* Right - Creators */}
          <div className="text-center md:text-right">
            <p className="text-sm text-[var(--neutral)]/70">
              Created by
            </p>
            <p className="text-sm font-medium text-[var(--accent)]">
              Jatin Jaglan & Kartik Arora
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
