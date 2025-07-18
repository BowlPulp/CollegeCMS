import React, { useEffect } from 'react';
import { X, ExternalLink, Calendar, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function SheetPreview({ sheet, onClose }) {
  const { theme } = useTheme();

  // Lock background scrolling while this modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleOpenInNewTab = () => {
    window.open(sheet.originalLink, '_blank');
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--secondary)] rounded-xl w-full max-w-6xl  f flex-col shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--accent)]/20">
          <div className="flex-1 mr-4">
            <h2 className="text-xl font-semibold text-[var(--neutral)] mb-1">
              {sheet.title}
            </h2>
            <p className="text-[var(--neutral)]/70 text-sm mb-3">
              {sheet.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-[var(--neutral)]/60">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{sheet.uploadedBy}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(sheet.uploadDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleOpenInNewTab}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--primary)] rounded-lg hover:bg-[var(--accent)]/90 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Open in New Tab
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[var(--neutral)]/70 hover:text-[var(--accent)] transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Iframe Container */}
        <div className="flex-1 p-6 flex flex-col">
        <div className="flex-1 w-full min-h-[500px] bg-[var(--primary)] rounded-lg overflow-hidden box-border flex">
            <iframe
            src={sheet.embeddableLink}
            title={sheet.title}
            className="flex-1 border-0 box-border"
            frameBorder="0"
            allowFullScreen
            loading="lazy"
            />
        </div>
        </div>


        {/* Footer */}
        <div className="px-5 py-2 border-t border-[var(--accent)]/20">
          <div className="flex items-center justify-between">
            <p className="text-[var(--neutral)]/60 text-sm">
              Preview
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-lg hover:bg-[var(--accent)] hover:text-[var(--primary)] transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
