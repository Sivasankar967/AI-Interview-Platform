import React, { useEffect, useState, useRef } from 'react';
import { useInterview } from '../context/InterviewContext';
import AvatarAria, { AriaState } from './AvatarAria';
import useSpeech from '../hooks/useSpeech';
import { Volume2, VolumeX } from 'lucide-react';

export default function AIInterviewer() {
  const { uiState, setUIState, currentQuestion, toggleSpeakerMute } = useInterview();
  const [displayedText, setDisplayedText] = useState('');
  const { speak, stopSpeaking, isSpeaking } = useSpeech();
  const [ariaState, setAriaState] = useState<AriaState>('idle');
  const [isThinking, setIsThinking] = useState(false);
  const textIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isShortScreen = windowHeight < 780;
  const avatarSize = isShortScreen ? 90 : 130;

  // Main Question Transition Flow: Thinking -> Speaking (Typewriter + Speech) -> Listening
  useEffect(() => {
    if (!currentQuestion) return;

    // Reset typewriter text
    setDisplayedText('');
    if (textIntervalRef.current) clearInterval(textIntervalRef.current);
    stopSpeaking();

    // 1. Thinking phase
    setIsThinking(true);
    setAriaState('thinking');
    setUIState(prev => ({ ...prev, isAIThinking: true, isAISpeaking: false }));

    let fallbackTimeout: NodeJS.Timeout | null = null;
    let simulationTimeout: NodeJS.Timeout | null = null;

    const thinkingTimeout = setTimeout(() => {
      setIsThinking(false);
      setUIState(prev => ({ ...prev, isAIThinking: false }));

      // 2. Typewriter Effect (Slicing method guarantees 100% stable typewriter without skips)
      let index = 0;
      const fullText = currentQuestion.question;
      
      if (textIntervalRef.current) clearInterval(textIntervalRef.current);
      
      textIntervalRef.current = setInterval(() => {
        index++;
        setDisplayedText(fullText.slice(0, index));
        if (index >= fullText.length) {
          if (textIntervalRef.current) clearInterval(textIntervalRef.current);
        }
      }, 20); // 20ms per char

      // 3. Audio Speech Synthesis (if not muted)
      if (!uiState.isSpeakerMuted) {
        const speechText = `${currentQuestion.ariaComment}. ${currentQuestion.question}`;
        let speechStarted = false;

        // Fail-safe fallback timer: If speech does not trigger within 1.5 seconds (e.g. blocked by PC autoplay / OS),
        // we automatically transition safely so the interview never hangs!
        fallbackTimeout = setTimeout(() => {
          if (!speechStarted) {
            console.warn('Speech synthesis failed to start within 1.5s. Firing fallback simulation...');
            setAriaState('speaking');
            setUIState(prev => ({ ...prev, isAISpeaking: true }));

            const simulationTime = fullText.length * 20 + 800;
            simulationTimeout = setTimeout(() => {
              setAriaState('listening');
              setUIState(prev => ({ ...prev, isAISpeaking: false }));
            }, simulationTime);
          }
        }, 1500);

        speak(
          speechText,
          () => {
            speechStarted = true;
            if (fallbackTimeout) clearTimeout(fallbackTimeout);
            setAriaState('speaking');
            setUIState(prev => ({ ...prev, isAISpeaking: true }));
          },
          () => {
            if (fallbackTimeout) clearTimeout(fallbackTimeout);
            setAriaState('listening');
            setUIState(prev => ({ ...prev, isAISpeaking: false }));
          }
        );
      } else {
        // If speaker is muted, simulate "speaking" avatar state for typing length, then set to listening
        setAriaState('speaking');
        setUIState(prev => ({ ...prev, isAISpeaking: true }));
        
        const simulationTime = fullText.length * 20 + 800;
        simulationTimeout = setTimeout(() => {
          setAriaState('listening');
          setUIState(prev => ({ ...prev, isAISpeaking: false }));
        }, simulationTime);
      }

    }, 1200); // 1.2s thinking time

    return () => {
      clearTimeout(thinkingTimeout);
      if (fallbackTimeout) clearTimeout(fallbackTimeout);
      if (simulationTimeout) clearTimeout(simulationTimeout);
      if (textIntervalRef.current) clearInterval(textIntervalRef.current);
    };
  }, [currentQuestion?.id, uiState.isSpeakerMuted]);

  return (
    <div className="flex flex-col bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl shadow-xl p-2.5 sm:p-4 lg:p-6 h-full transition-all duration-300 relative overflow-hidden">
      
      {/* Floating speaker toggle */}
      <button
        onClick={toggleSpeakerMute}
        aria-label={uiState.isSpeakerMuted ? "Unmute interviewer voice" : "Mute interviewer voice"}
        className="absolute top-3 right-3 lg:top-4 lg:right-4 p-1.5 lg:p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all shadow z-20"
      >
        {uiState.isSpeakerMuted ? (
          <VolumeX className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-rose-400" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-indigo-400" />
        )}
      </button>

      {/* ================= MOBILE VIEW (Horizontal Layout < 1024px) ================= */}
      <div className="lg:hidden flex flex-row items-center space-x-3 w-full h-full min-h-0">
        
        {/* Compact Avatar */}
        <div className="shrink-0">
          <AvatarAria state={ariaState} size={70} hideStatus={true} />
        </div>

        {/* Compact Speech Bubble Container */}
        <div className="flex-1 min-w-0 h-full flex flex-col justify-center pr-[92px] sm:pr-32 lg:pr-0">
          <div className="bg-slate-900/40 py-2 px-3 rounded-xl border border-slate-200/5 dark:border-slate-800/50 shadow-inner overflow-y-auto max-h-[64px] sm:max-h-[110px] flex items-center">
            {isThinking ? (
              <div className="flex items-center space-x-1.5 py-0.5">
                <span className="text-[11px] font-semibold text-slate-400 animate-pulse">Aria formulating...</span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              </div>
            ) : (
              <p className="text-slate-200 text-[11px] font-medium leading-relaxed font-sans text-left">
                {displayedText}
                {ariaState === 'speaking' && <span className="inline-block w-1.5 h-3.5 ml-1 bg-indigo-500 animate-pulse align-middle"></span>}
              </p>
            )}
          </div>
          
          <div className="mt-1 flex items-center justify-between text-[9px] text-slate-500 font-semibold tracking-wider uppercase shrink-0">
            <span>Aria (AI)</span>
            {currentQuestion?.topic && <span className="text-indigo-400">Topic: {currentQuestion.topic}</span>}
          </div>
        </div>
      </div>

      {/* ================= DESKTOP VIEW (Vertical Layout >= 1024px) ================= */}
      <div className="hidden lg:flex flex-col items-center h-full w-full">
        {/* Avatar Wrapper */}
        <div className={`shrink-0 transition-all duration-300 ${isShortScreen ? 'mt-2 mb-2' : 'mt-8 mb-6'}`}>
          <AvatarAria state={ariaState} size={avatarSize} />
        </div>

        <h2 className={`font-bold text-slate-900 dark:text-white mb-0.5 tracking-tight shrink-0 transition-all duration-300 ${isShortScreen ? 'text-base' : 'text-xl'}`}>Aria</h2>
        <p className={`font-medium text-indigo-400/90 dark:text-indigo-300/80 uppercase tracking-wider shrink-0 transition-all duration-300 ${
          isShortScreen ? 'text-[10px] mb-2' : 'text-xs mb-6'
        }`}>
          AI Interviewer
        </p>

        {/* Speech Bubble */}
        <div className={`w-full relative flex-1 flex flex-col min-h-0 transition-all duration-300 ${isShortScreen ? 'mt-2' : 'mt-4'}`}>
          {/* Subtle arrow pointer */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-100/90 dark:bg-slate-800/80 backdrop-blur-md transform rotate-45 border-l border-t border-slate-200/50 dark:border-slate-700/50"></div>
          
          <div className={`flex-grow bg-slate-100/90 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-slate-700/50 relative z-10 text-center shadow-inner flex items-center justify-center overflow-y-auto transition-all duration-300 ${
            isShortScreen ? 'py-3 px-4 min-h-[75px]' : 'p-5 min-h-[120px]'
          }`}>
            {isThinking ? (
              <div className="flex flex-col items-center space-y-2 py-4">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
                  Aria is formulating question...
                </span>
                <div className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            ) : (
              <p className={`text-slate-800 dark:text-slate-200 font-medium font-sans transition-all duration-300 ${
                isShortScreen ? 'text-[12.5px] leading-snug' : 'text-[15px] leading-relaxed'
              }`} aria-live="polite">
                {displayedText}
                {ariaState === 'speaking' && <span className="inline-block w-2 h-4 ml-1 bg-indigo-500 animate-pulse align-middle"></span>}
              </p>
            )}
          </div>
        </div>

        {/* Aria Speech indicator message */}
        {!isThinking && ariaState === 'speaking' && (
          <span className="text-[11px] text-indigo-400/80 mt-2 animate-pulse font-medium shrink-0">
            Aria is speaking...
          </span>
        )}

        {/* Topic Badge */}
        <div className={`shrink-0 transition-all duration-300 ${isShortScreen ? 'mt-2 pt-2' : 'mt-auto pt-6'}`}>
          <span className="px-3.5 py-1.5 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold border border-indigo-500/20 shadow-sm uppercase tracking-wider">
            {currentQuestion?.topic || 'General'}
          </span>
        </div>
      </div>

    </div>
  );
}
