import React from 'react';

export default function Waveform({ isSpeaking }: { isSpeaking: boolean }) {
  if (!isSpeaking) {
    return (
      <div className="flex items-center justify-center space-x-1 h-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full transition-all duration-300"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center space-x-1 h-8">
      {[0.1, 0.4, 0.2, 0.5, 0.3].map((delay, i) => (
        <div
          key={i}
          className="w-1.5 bg-primary dark:bg-indigo-400 rounded-full animate-wave"
          style={{ animationDelay: `${delay}s`, height: '8px' }}
        ></div>
      ))}
    </div>
  );
}
