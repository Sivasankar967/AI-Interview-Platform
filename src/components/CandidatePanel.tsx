import React, { useEffect, useState, useRef } from 'react';
import { useInterview, TabType } from '../context/InterviewContext';
import CodeEditor from './CodeEditor';
import Whiteboard from './Whiteboard';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { Code2, PenTool, AlignLeft, Mic, MicOff, AlertCircle } from 'lucide-react';

export default function CandidatePanel() {
  const { uiState, setUIState, currentQuestion, interviewState, setInterviewState } = useInterview();
  const { answerDraft } = interviewState;
  
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    clearTranscript
  } = useSpeechRecognition();

  // Keep track of manual keyboard typed content separately
  const manualTextRef = useRef('');

  // Handle automatic mic start once Aria finishes speaking (moves from speaking -> listening)
  useEffect(() => {
    let delayTimeout: NodeJS.Timeout | null = null;

    if (!uiState.isAIThinking && !uiState.isAISpeaking && uiState.activeTab === 'Answer' && isSupported) {
      delayTimeout = setTimeout(() => {
        startListening();
      }, 800);
    } else {
      stopListening();
    }

    return () => {
      if (delayTimeout) clearTimeout(delayTimeout);
    };
  }, [uiState.isAISpeaking, uiState.isAIThinking, uiState.activeTab]);

  // Upgrade: Synchronized Accumulated Voice Sync
  // Voice appends smoothly to manual text, preventing duplicate or missing words
  useEffect(() => {
    if (isListening && transcript) {
      const base = manualTextRef.current.trim();
      const spoken = transcript.trim();
      const combined = base ? `${base}\n\n${spoken}` : spoken;
      
      setInterviewState(prev => ({
        ...prev,
        answerDraft: combined
      }));
    }
  }, [transcript, isListening]);

  // Reset local states and clean transcripts on question change
  useEffect(() => {
    clearTranscript();
    manualTextRef.current = '';
  }, [currentQuestion?.id]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    manualTextRef.current = val; // Always keep manual ref in sync
    setInterviewState(prev => ({ ...prev, answerDraft: val }));
  };

  const tabs: { id: TabType; icon: React.ReactNode; label: string }[] = [
    { id: 'Answer', icon: <AlignLeft className="w-4 h-4" />, label: 'Text Answer' },
    { id: 'Code Editor', icon: <Code2 className="w-4 h-4" />, label: 'Code Editor' },
    { id: 'Whiteboard', icon: <PenTool className="w-4 h-4" />, label: 'Whiteboard' }
  ];

  return (
    <div className="flex flex-col h-full bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200/10 bg-slate-50/5 dark:bg-slate-900/30 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setUIState(prev => ({ ...prev, activeTab: tab.id }))}
            className={`flex items-center justify-center flex-1 sm:flex-initial px-3 py-2.5 sm:px-6 sm:py-4 text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide transition-all active:scale-[0.98] min-w-0 ${
              uiState.activeTab === tab.id
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-white/5'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <span className="mr-1.5 sm:mr-2 shrink-0">{tab.icon}</span>
            <span className="whitespace-nowrap truncate">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Workspace Area */}
      <div className="flex-1 p-5 overflow-hidden relative flex flex-col">
        {uiState.activeTab === 'Answer' && (
          <div className="h-full flex flex-col flex-1 relative">
            
            {/* Coding question tab reminder */}
            {currentQuestion?.type === 'Code Question' && (
              <div className="mb-4 p-4 bg-indigo-500/10 text-indigo-300 rounded-xl text-xs border border-indigo-500/20 font-medium flex items-center justify-between shadow-sm">
                <span>
                  <strong>Coding Challenge:</strong> Switch to the <strong>Code Editor</strong> tab to write and test your solution.
                </span>
                <button
                  onClick={() => setUIState(prev => ({ ...prev, activeTab: 'Code Editor' }))}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-semibold transition-colors"
                >
                  Go to Editor
                </button>
              </div>
            )}

            {/* Browser Speech support warning */}
            {!isSupported && (
              <div className="mb-4 p-3 bg-amber-500/10 text-amber-400 rounded-xl text-xs border border-amber-500/20 font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>Voice input is not supported in this browser. Please type your answer directly.</span>
              </div>
            )}

            {/* Answer Textarea */}
            <div className="flex-1 relative flex flex-col min-h-0">
              <textarea
                value={answerDraft}
                onChange={handleTextChange}
                placeholder="Type or speak your answer here..."
                className="w-full flex-1 p-4 rounded-xl border border-white/10 bg-slate-900/60 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-[15px] font-sans leading-relaxed text-slate-200 transition-all focus:bg-slate-900/80 shadow-inner"
              />
              
              {/* Blinking cursor / interim transcript overlay inside textarea if speaking */}
              {isListening && interimTranscript && (
                <div className="absolute bottom-12 left-4 right-4 bg-slate-900/90 border border-indigo-500/30 backdrop-blur-sm p-3 rounded-lg text-sm text-slate-300 pointer-events-none animate-fade-in shadow-lg">
                  <span className="text-indigo-400 font-semibold mr-1.5 text-xs uppercase tracking-wider">Hearing:</span>
                  <span className="opacity-80 leading-relaxed font-sans">{interimTranscript}</span>
                  <span className="inline-block w-1.5 h-3.5 ml-1 bg-green-500 animate-pulse align-middle"></span>
                </div>
              )}
            </div>

            {/* AirPods / Bluetooth tip message */}
            {isSupported && (
              <p className="text-[10px] text-slate-500/90 mt-1 font-sans italic text-center">
                🎧 AirPods / Bluetooth headphones? Mic will trigger automatically with a brief delay after Aria finishes speaking.
              </p>
            )}

            {/* Bottom Info Bar inside tab */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
              {/* Voice status indicator */}
              <div className="flex flex-wrap items-center gap-1.5 font-medium">
                {isListening ? (
                  <div className="flex items-center space-x-2 bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full border border-green-500/20 shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="font-semibold">Listening...</span>
                    
                    {/* Equalizer mini bars */}
                    <div className="flex items-end space-x-[2px] h-3 ml-1.5">
                      {[0.1, 0.4, 0.2, 0.5, 0.3].map((delay, idx) => (
                        <div
                          key={idx}
                          className="w-[2px] bg-green-400 rounded-t animate-equalizer"
                          style={{ animationDelay: `${delay}s`, height: '2px' }}
                        ></div>
                      ))}
                    </div>
                  </div>
                ) : (
                  isSupported && (
                    <button
                      type="button"
                      onClick={startListening}
                      className="flex items-center space-x-1.5 text-slate-400 hover:text-white transition-colors bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Start Voice Input</span>
                    </button>
                  )
                )}

                {isListening && (
                  <button
                    type="button"
                    onClick={stopListening}
                    className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold px-3 py-1.5 rounded-full border border-red-700 shadow transition-all active:scale-95"
                  >
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Stop Recording</span>
                  </button>
                )}
              </div>

              <div className="font-mono text-slate-500">
                {answerDraft.length} characters
              </div>
            </div>
          </div>
        )}

        {uiState.activeTab === 'Code Editor' && <CodeEditor />}
        
        {uiState.activeTab === 'Whiteboard' && <Whiteboard />}
      </div>
    </div>
  );
}
