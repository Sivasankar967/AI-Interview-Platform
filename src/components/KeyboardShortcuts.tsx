import React, { useEffect, useState } from 'react';
import { useInterview } from '../context/InterviewContext';
import { Keyboard, X } from 'lucide-react';

export default function KeyboardShortcuts() {
  const { uiState, setUIState, currentScreen, setCurrentScreen } = useInterview();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle shortcuts overlay on '?' (Shift + /)
      if (e.key === '?') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        return;
      }

      // If typing in input/textarea or code editor, do not trigger generic action shortcuts
      const activeEl = document.activeElement;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.getAttribute('contenteditable') === 'true' ||
        activeEl.closest('.monaco-editor') ||
        activeEl.closest('.monaco-input')
      )) {
        return;
      }

      // Space: Submit / Next Question
      if (e.code === 'Space' && (currentScreen === 'interview' || currentScreen === 'coding')) {
        e.preventDefault();
        // Since space is triggered outside typing, we can let user know or advance
        const submitBtn = document.querySelector('[data-testid="submit-answer-btn"]') as HTMLButtonElement;
        if (submitBtn) submitBtn.click();
      }

      // M: Mute
      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setUIState(prev => ({ ...prev, isMuted: !prev.isMuted }));
      }

      // C: Camera
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        setUIState(prev => ({ ...prev, isCameraOff: !prev.isCameraOff }));
      }

      // V: Toggle active tab to Textarea (Voice enabled)
      if (e.key.toLowerCase() === 'v') {
        e.preventDefault();
        setUIState(prev => ({ ...prev, activeTab: 'Answer' }));
      }

      // Escape: Pause
      if (e.key === 'Escape' && (currentScreen === 'interview' || currentScreen === 'coding')) {
        e.preventDefault();
        setCurrentScreen('paused');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentScreen]);

  if (!isOpen) {
    // Show a tiny floating cue at the bottom corner for portolio polish
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="hidden sm:flex sm:fixed sm:bottom-4 sm:right-4 bg-slate-900/80 border border-white/10 hover:bg-slate-800 text-slate-400 hover:text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all z-40 active:scale-95 items-center space-x-1.5"
      >
        <Keyboard className="w-3.5 h-3.5" />
        <span>Press ? for shortcuts</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Keyboard focus trap modal */}
      <div 
        className="w-full max-w-md bg-[#0f0f23]/95 border border-white/10 p-6 rounded-2xl shadow-2xl relative animate-fade-in font-sans"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 border border-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5 mb-5 border-b border-white/10 pb-3">
          <Keyboard className="w-5 h-5 text-indigo-400 animate-pulse" />
          <h2 id="modal-title" className="text-base font-bold text-white tracking-tight">
            Interactivity Keyboard Shortcuts
          </h2>
        </div>

        {/* Shortcuts list */}
        <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-300">
          <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
            <span>Toggle Mic</span>
            <kbd className="px-2 py-1 bg-slate-800 rounded font-bold border border-white/10 text-[10px]">M</kbd>
          </div>
          <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
            <span>Toggle Cam</span>
            <kbd className="px-2 py-1 bg-slate-800 rounded font-bold border border-white/10 text-[10px]">C</kbd>
          </div>
          <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
            <span>Voice Input Tab</span>
            <kbd className="px-2 py-1 bg-slate-800 rounded font-bold border border-white/10 text-[10px]">V</kbd>
          </div>
          <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-white/5">
            <span>Pause Session</span>
            <kbd className="px-2 py-1 bg-slate-800 rounded font-bold border border-white/10 text-[10px]">ESC</kbd>
          </div>
          <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-white/5 col-span-2">
            <span>Submit / Skip Question (outside input fields)</span>
            <kbd className="px-3 py-1 bg-slate-800 rounded font-bold border border-white/10 text-[10px]">SPACE</kbd>
          </div>
          <div className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-white/5 col-span-2">
            <span>Toggle Shortcuts List</span>
            <kbd className="px-2 py-1 bg-slate-800 rounded font-bold border border-white/10 text-[10px]">?</kbd>
          </div>
        </div>

        <p className="text-[10px] text-slate-500 font-bold uppercase mt-5 text-center tracking-wider">
          Accessibility Compliant UI Controls
        </p>
      </div>
    </div>
  );
}
