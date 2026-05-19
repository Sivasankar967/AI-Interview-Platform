import React, { useEffect, useRef, useState } from 'react';
import AIInterviewer from './AIInterviewer';
import CandidatePanel from './CandidatePanel';
import Dashboard from './Dashboard';
import TranscriptPanel from './TranscriptPanel';
import CandidateCamera from './CandidateCamera';
import { useInterview } from '../context/InterviewContext';
import { MessageSquare, Send, BarChart2, X, Mic, MicOff, Video, VideoOff, SkipForward, Square, AlertTriangle } from 'lucide-react';
import useSpeech from '../hooks/useSpeech';

export default function InterviewScreen() {
  const { 
    uiState, 
    setUIState, 
    nextQuestion, 
    submitAnswer, 
    currentQuestion, 
    interviewState,
    setCurrentScreen
  } = useInterview();

  const { stopSpeaking } = useSpeech();
  const [isDashboardDrawerOpen, setIsDashboardDrawerOpen] = useState(false);
  const [cheatWarnings, setCheatWarnings] = useState(0);
  const [showCheatModal, setShowCheatModal] = useState(false);
  const prevQuestionId = useRef<string | null>(null);

  const handleSkip = () => {
    stopSpeaking();
    nextQuestion();
  };

  const handleEnd = () => {
    stopSpeaking();
    setCurrentScreen('results');
  };

  // Focus textarea when a new question loads
  useEffect(() => {
    if (currentQuestion && currentQuestion.id !== prevQuestionId.current) {
      prevQuestionId.current = currentQuestion.id;
      setTimeout(() => {
        const textarea = document.querySelector('textarea');
        if (textarea) textarea.focus();
      }, 1300);
    }
  }, [currentQuestion?.id]);

  // Anti-cheat / Proctor monitoring: Warn user when they blur or switch tabs
  useEffect(() => {
    const handleBlur = () => {
      setCheatWarnings(prev => {
        const next = prev + 1;
        setShowCheatModal(true);
        return next;
      });
    };

    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  const handleSubmit = () => {
    if (!currentQuestion) return;

    // Flash green border on textarea
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.style.border = '2px solid #22c55e';
      textarea.style.boxShadow = '0 0 10px rgba(34, 197, 94, 0.4)';
    }

    setTimeout(() => {
      if (textarea) {
        textarea.style.border = '';
        textarea.style.boxShadow = '';
      }

      submitAnswer(currentQuestion.id, {
        text: interviewState.answerDraft,
        timeTaken: 45
      });

      nextQuestion();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#090913] p-4 md:p-6 lg:p-8 flex flex-col h-screen transition-colors duration-300 font-sans relative overflow-hidden text-slate-100">
      
      {/* Header Bar */}
      <header className="flex justify-between items-center mb-4 lg:mb-6 shrink-0 z-10">
        <div className="flex items-center">
          <div className="w-7 h-7 sm:w-9 sm:h-9 bg-indigo-500/10 rounded-xl flex items-center justify-center mr-2 sm:mr-3 border border-indigo-500/25 shadow">
            <span className="text-indigo-400 font-black tracking-tight text-xs sm:text-base">IA</span>
          </div>
          <h1 className="text-sm sm:text-xl font-bold tracking-tight text-white">InterviewAI</h1>
        </div>
        <div className="flex items-center space-x-4 text-[9px] sm:text-xs font-semibold uppercase tracking-wider">
          <div className="flex items-center space-x-1.5 text-rose-400 bg-rose-500/10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-rose-500/25 shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Live Recording</span>
          </div>
        </div>
      </header>

      {/* Main Container: Stretching or shrinking exactly within screen height bounds */}
      <div className="flex-grow flex flex-col min-h-0 relative z-10">
        
        {/* ================= MOBILE / TABLET SPLIT INTERFACE (< 1024px) ================= */}
        <div className="lg:hidden flex flex-col flex-grow h-full min-h-0">
          
          {/* Top Row: AI Interviewer (Full Width) with floating Picture-in-Picture webcam feed overlay */}
          <div className="h-[110px] md:h-[140px] shrink-0 mb-4 min-h-0 relative z-20">
            <AIInterviewer />
            
            {/* Elegant Floating PIP Webcam Frame in the bottom-right corner of the interviewer row */}
            <div className="absolute right-3 bottom-2.5 w-[88px] h-[66px] md:w-[130px] md:h-[97.5px] z-30 shadow-2xl rounded-xl overflow-hidden border border-white/20 bg-slate-950/85 transition-all duration-300">
              <CandidateCamera isPIP={true} />
            </div>
          </div>
          
          {/* Bottom Area: Workspace stretches precisely to fill remaining height */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <CandidatePanel />
          </div>
        </div>

        {/* ================= DESKTOP INTERFACE (>= 1024px) ================= */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-6 flex-grow h-full min-h-0">
          
          {/* Left Column: AI Interviewer */}
          <div className="col-span-3 h-full min-h-0">
            <AIInterviewer />
          </div>

          {/* Center Column: Candidate Workspace */}
          <div className="col-span-6 h-full min-h-0">
            <CandidatePanel />
          </div>

          {/* Right Column: Dashboard Panel */}
          <div className="col-span-3 h-full min-h-0">
            <Dashboard />
          </div>
        </div>

      </div>

      {/* Bottom Nav / Controls Bar */}
      <div className="mt-3 sm:mt-4 lg:mt-6 flex flex-wrap justify-between items-center bg-white/5 border border-white/10 backdrop-blur-md p-2 sm:p-3 rounded-2xl shadow-xl shrink-0 z-10 gap-2">
        
        {/* Left Actions Group (Transcript, Dashboard, Mic, Camera) */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          {/* Transcript toggler */}
          <button 
            onClick={() => setUIState(prev => ({ ...prev, isTranscriptOpen: !prev.isTranscriptOpen }))}
            className={`flex items-center px-2 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 ${
              uiState.isTranscriptOpen 
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
            aria-label="Toggle Transcript"
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Transcript</span>
          </button>

          {/* Mobile & Tablet only: Dashboard Toggle Button */}
          <button 
            onClick={() => setIsDashboardDrawerOpen(true)}
            className="lg:hidden flex items-center px-2 py-1.5 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all active:scale-95"
            aria-label="Toggle Dashboard"
          >
            <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400 sm:mr-2" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          {/* Mobile & Tablet only: Quick Mic/Camera Toggles */}
          <div className="lg:hidden flex items-center space-x-1">
            {/* Mic Button */}
            <button
              onClick={() => setUIState(prev => ({ ...prev, isMuted: !prev.isMuted }))}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all active:scale-95 ${
                uiState.isMuted
                  ? 'bg-red-500/15 text-red-400 border-red-500/30'
                  : 'bg-green-500/15 text-green-400 border-green-500/30'
              }`}
              aria-label={uiState.isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {uiState.isMuted ? <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
            
            {/* Camera Button */}
            <button
              onClick={() => setUIState(prev => ({ ...prev, isCameraOff: !prev.isCameraOff }))}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all active:scale-95 ${
                uiState.isCameraOff
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
              }`}
              aria-label={uiState.isCameraOff ? 'Turn camera on' : 'Turn camera off'}
            >
              {uiState.isCameraOff ? <VideoOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>

        {/* Center: Skip and End buttons */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 order-last sm:order-none w-full sm:w-auto justify-center lg:justify-start">
          <button 
            onClick={handleSkip}
            className="flex items-center px-2.5 py-1.5 sm:px-4 sm:py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm"
          >
            <SkipForward className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-2 text-slate-400" />
            <span className="hidden sm:inline">Skip Question</span>
            <span className="sm:hidden">Skip</span>
          </button>
          
          <button 
            onClick={handleEnd}
            className="flex items-center px-2.5 py-1.5 sm:px-4 sm:py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-450 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm"
          >
            <Square className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-2 text-rose-450 shadow-inner" />
            <span className="hidden sm:inline">End Interview</span>
            <span className="sm:hidden">End</span>
          </button>
        </div>

        {/* Submit button with testid */}
        <button 
          data-testid="submit-answer-btn"
          onClick={handleSubmit}
          className="flex items-center px-3 py-1.5 sm:px-6 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all group border border-indigo-500/30"
        >
          <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 sm:mr-2 group-hover:translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Submit Answer</span>
          <span className="sm:hidden ml-1">Submit</span>
        </button>

      </div>

      {/* Transcript slide-out panel */}
      <TranscriptPanel />

      {/* ================= MOBILE / TABLET DASHBOARD DRAWER & OVERLAY ================= */}
      
      {/* Dark overlay backdrop for mobile/tablet drawer */}
      {isDashboardDrawerOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsDashboardDrawerOpen(false)}
        />
      )}

      {/* Tablet Slide-in Overlay Panel (768px to 1023px) */}
      <div 
        className={`hidden md:block lg:hidden fixed inset-y-0 right-0 w-80 bg-[#0f0f23]/95 border-l border-white/10 p-6 z-50 shadow-2xl transition-transform duration-300 transform ${
          isDashboardDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-5 pb-2 border-b border-white/5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dashboard Console</span>
          <button 
            onClick={() => setIsDashboardDrawerOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded bg-white/5 border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="h-[90%] overflow-y-auto pr-1">
          <Dashboard hideCamera={true} />
        </div>
      </div>

      {/* Mobile Bottom-Sheet Drawer (under 768px) */}
      <div 
        className={`md:hidden fixed inset-x-0 bottom-0 bg-[#0f0f23]/95 border-t border-white/10 rounded-t-3xl p-6 z-50 shadow-2xl transition-transform duration-300 transform max-h-[85vh] overflow-y-auto ${
          isDashboardDrawerOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Grab Handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" onClick={() => setIsDashboardDrawerOpen(false)}></div>
        
        <div className="flex justify-between items-center mb-5 pb-2 border-b border-white/5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Dashboard Console</span>
          <button 
            onClick={() => setIsDashboardDrawerOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded bg-white/5 border border-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <Dashboard hideCamera={true} />
      </div>

      {/* Anti-Cheat Proctoring Alert Modal */}
      {showCheatModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="w-full max-w-md bg-[#0f0f23]/95 border-2 border-rose-500/40 p-6 rounded-2xl shadow-2xl relative text-center">
            
            <div className="mx-auto w-14 h-14 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-lg font-extrabold text-white tracking-tight uppercase mb-2">
              Proctoring Security Violation
            </h2>
            
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Our <strong className="text-rose-400">AI Proctor Shield</strong> detected that you switched browser tabs or left the active interview window. This violation has been registered and logged.
            </p>

            <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-3 mb-5">
              <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">
                Violation Warning
              </div>
              <div className="text-xl font-black text-rose-450 tracking-wider">
                Warning count: {cheatWarnings}
              </div>
              <div className="text-[9px] text-slate-400 font-medium mt-1">
                Exceeding limit may lead to automatic disqualification of the session.
              </div>
            </div>

            <button
              onClick={() => setShowCheatModal(false)}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow border border-rose-500/20"
            >
              I understand, return to interview
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
