import React from 'react';
import { useInterview } from '../context/InterviewContext';
import { X } from 'lucide-react';

export default function TranscriptPanel() {
  const { uiState, setUIState } = useInterview();

  if (!uiState.isTranscriptOpen) return null;

  // Mock transcript
  const mockTranscript = [
    { speaker: 'AI', text: "Hello! Welcome to your frontend developer interview. Are you ready to begin?" },
    { speaker: 'Candidate', text: "Yes, I'm ready." },
    { speaker: 'AI', text: "Great. Let's start with a technical question. Can you explain the difference between the Virtual DOM and the Real DOM in React?" }
  ];

  return (
    <div className="absolute bottom-20 right-8 w-96 max-w-[calc(100vw-2rem)] h-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col z-50 overflow-hidden transform transition-all">
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Live Transcript</h3>
        <button 
          onClick={() => setUIState({ ...uiState, isTranscriptOpen: false })}
          className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {mockTranscript.map((item, i) => (
          <div key={i} className={`flex flex-col ${item.speaker === 'Candidate' ? 'items-end' : 'items-start'}`}>
            <span className="text-xs text-slate-500 mb-1">{item.speaker}</span>
            <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${
              item.speaker === 'Candidate' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
            }`}>
              {item.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
