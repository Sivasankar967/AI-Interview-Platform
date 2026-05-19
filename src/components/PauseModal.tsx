import React, { useEffect, useRef } from 'react';
import { useInterview } from '../context/InterviewContext';
import { Play, LogOut, ShieldAlert } from 'lucide-react';

export default function PauseModal() {
  const { setCurrentScreen, setUIState } = useInterview();
  const resumeButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus resume button and trap focus
  useEffect(() => {
    if (resumeButtonRef.current) {
      resumeButtonRef.current.focus();
    }
  }, []);

  const handleResume = () => {
    setCurrentScreen('interview');
  };

  const handleEnd = () => {
    setCurrentScreen('results');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
      {/* Pause Modal Card */}
      <div 
        className="w-full max-w-sm bg-[#0f0f23]/90 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center animate-fade-in font-sans"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-title"
      >
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 shadow-inner">
          <ShieldAlert className="w-8 h-8 animate-pulse" />
        </div>

        <h2 id="pause-title" className="text-xl font-extrabold text-white tracking-tight mb-2">
          Interview Paused
        </h2>
        <p className="text-xs text-slate-400 font-medium mb-6 max-w-[240px] leading-relaxed">
          Timers are paused. Take a breath and resume whenever you are ready.
        </p>

        {/* Buttons */}
        <div className="w-full flex flex-col space-y-3">
          <button
            ref={resumeButtonRef}
            onClick={handleResume}
            className="w-full flex items-center justify-center py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg border border-indigo-500/20"
          >
            <Play className="w-4 h-4 mr-2" />
            Resume
          </button>
          
          <button
            onClick={handleEnd}
            className="w-full flex items-center justify-center py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-sm font-bold uppercase tracking-wider transition-all active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4 mr-2" />
            End Session
          </button>
        </div>

        <span className="text-[10px] text-slate-600 font-bold uppercase mt-6 tracking-widest">
          InterviewAI Co-pilot
        </span>
      </div>
    </div>
  );
}
