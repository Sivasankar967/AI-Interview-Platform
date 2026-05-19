import React from 'react';
import { useInterview } from '../context/InterviewContext';
import CandidateCamera from './CandidateCamera';
import useSpeech from '../hooks/useSpeech';
import { SkipForward, Square, Clock, Hourglass } from 'lucide-react';

export default function Dashboard({ hideCamera = false }: { hideCamera?: boolean }) {
  const { interviewState, nextQuestion, setCurrentScreen } = useInterview();
  const { questions, currentQIndex, timeElapsed, questionTimeElapsed } = interviewState;
  const { stopSpeaking } = useSpeech();

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const currentQuestion = questions[currentQIndex];
  
  // Calculate question countdown
  const timeLeft = currentQuestion?.timeLimit 
    ? Math.max(0, currentQuestion.timeLimit - questionTimeElapsed) 
    : 0;
  
  const isLowTime = currentQuestion?.timeLimit 
    ? timeLeft <= 25 
    : false;
  
  // Fake confidence score (mock data based on time or random)
  const confidenceScore = Math.min(100, Math.max(0, 85 + Math.sin(timeElapsed / 10) * 10));
  const confidenceColor = confidenceScore > 80 
    ? 'bg-green-500 shadow-green-500/20' 
    : confidenceScore > 60 
      ? 'bg-amber-500 shadow-amber-500/20' 
      : 'bg-rose-500 shadow-rose-500/20';

  const handleSkip = () => {
    stopSpeaking();
    nextQuestion();
  };

  const handleEnd = () => {
    stopSpeaking();
    setCurrentScreen('results');
  };

  return (
    <div className="flex flex-col space-y-4 h-full">
      
      {/* Webcam preview */}
      {!hideCamera && <CandidateCamera />}

      {/* Progress & Stats Card */}
      <div className="flex-1 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl shadow-xl p-5 flex flex-col transition-colors duration-300">
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 tracking-tight text-sm">Progress</h3>
          <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/25 uppercase tracking-wider">
            {currentQIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Question Tracker Dots */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {questions.map((_, i) => (
            <div 
              key={i} 
              className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300 active:scale-90 ${
                i < currentQIndex 
                  ? 'bg-indigo-600 text-white scale-[1.05] shadow-md shadow-indigo-500/20' 
                  : i === currentQIndex 
                    ? 'border border-indigo-500 text-indigo-400 bg-indigo-500/5 ring-1 ring-indigo-500/20 animate-pulse' 
                    : 'bg-slate-800/80 text-slate-500 border border-white/5'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Question-specific countdown timer (Requested upgrade) */}
        {currentQuestion?.timeLimit && (
          <div className="mb-5 bg-slate-950/40 border border-white/5 p-3 rounded-xl shadow-inner">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <Hourglass className="w-3.5 h-3.5 mr-1 text-indigo-400 animate-spin-slow" />
                Question Time Left
              </span>
              <span className={`text-lg font-mono font-black tracking-tight ${isLowTime ? 'text-rose-500 animate-pulse' : 'text-indigo-400'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  isLowTime 
                    ? 'bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse' 
                    : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                }`}
                style={{ width: `${Math.min(100, (timeLeft / currentQuestion.timeLimit) * 100)}%` }}
              ></div>
            </div>

            {isLowTime && (
              <p className="text-[9px] text-rose-500 text-center font-bold uppercase tracking-wider mt-1.5 animate-pulse">
                ⚠️ Hurry up! Auto-submitting soon...
              </p>
            )}
          </div>
        )}

        {/* Live Confidence Score Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confidence Index</span>
            <span className="text-xs font-bold text-slate-200">{Math.round(confidenceScore)}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
            <div 
              className={`h-full ${confidenceColor} transition-all duration-[600ms] ease-out shadow-sm`}
              style={{ width: `${confidenceScore}%` }}
            ></div>
          </div>
        </div>

        {/* Global duration tracker */}
        <div className="mt-2 pt-3 border-t border-white/5 flex justify-between items-center text-xs">
          <span className="text-slate-500 flex items-center font-semibold">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Total Session Time
          </span>
          <span className="font-mono font-bold text-slate-300">
            {formatTime(timeElapsed)}
          </span>
        </div>

      </div>
    </div>
  );
}
