import React, { useEffect, useState } from 'react';
import { Mic } from 'lucide-react';

export type AriaState = 'idle' | 'speaking' | 'listening' | 'thinking';

interface AvatarAriaProps {
  state: AriaState;
  size?: number;
  hideStatus?: boolean;
}

export default function AvatarAria({ state, size = 160, hideStatus = false }: AvatarAriaProps) {
  const [mouthOpen, setMouthOpen] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  // SPEAKING mouth alternate
  useEffect(() => {
    if (state !== 'speaking') {
      setMouthOpen(false);
      return;
    }
    const interval = setInterval(() => {
      setMouthOpen(prev => !prev);
    }, 200);
    return () => clearInterval(interval);
  }, [state]);

  // Blink interval (5s for idle, 3.5s for speaking/listening, no blink for thinking as eyes are half closed)
  useEffect(() => {
    if (state === 'thinking') return;
    const intervalTime = state === 'idle' ? 5000 : 3500;
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, intervalTime);
    return () => clearInterval(interval);
  }, [state]);

  // Determine mouth path
  const getMouthPath = () => {
    if (state === 'thinking') {
      // flat straight mouth
      return 'M 70 95 Q 80 95 90 95';
    }
    if (state === 'listening') {
      // small open oval
      return 'M 73 95 A 7 7 0 1 0 87 95 A 7 7 0 1 0 73 95';
    }
    if (state === 'speaking') {
      return mouthOpen 
        ? 'M 70 92 Q 80 108 90 92 Z' // open mouth shape
        : 'M 70 95 Q 80 97 90 95';  // closed line mouth shape
    }
    // Idle (gentle smile)
    return 'M 68 92 Q 80 103 92 92';
  };

  // Status badge config
  const statusConfig = {
    idle: { color: 'bg-slate-400', label: 'Idle' },
    speaking: { color: 'bg-indigo-500', label: 'Speaking' },
    listening: { color: 'bg-green-500', label: 'Listening' },
    thinking: { color: 'bg-amber-500', label: 'Thinking' }
  };

  const status = statusConfig[state] || statusConfig.idle;

  return (
    <div className="flex flex-col items-center select-none">
      <div className="relative" style={{ width: size, height: size }}>
        
        {/* SPEAKING: 3 concentric indigo pulsing rings */}
        {state === 'speaking' && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 rounded-full border border-indigo-500/60 animate-ring-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="absolute inset-0 rounded-full border border-indigo-500/40 animate-ring-pulse" style={{ animationDelay: '400ms' }}></div>
            <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ring-pulse" style={{ animationDelay: '800ms' }}></div>
          </div>
        )}

        {/* LISTENING: Bobbing Mic icon above avatar */}
        {state === 'listening' && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 animate-bob">
            <div className="bg-green-500 text-white p-1.5 rounded-full shadow-lg flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* LISTENING: Pulse ring */}
        <div 
          className={`relative z-10 w-full h-full rounded-full overflow-hidden border-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center transition-all duration-300 ${
            state === 'listening' ? 'border-green-500 animate-green-pulse' :
            state === 'thinking' ? 'border-amber-500' :
            state === 'speaking' ? 'border-indigo-500' :
            'border-slate-700 dark:border-slate-600 animate-breath'
          }`}
        >
          
          {/* Avatar Face (SVG) */}
          <svg viewBox="0 0 160 160" className="w-full h-full">
            {/* Background elements inside SVG */}
            <circle cx="80" cy="80" r="76" fill="url(#bg-grad)" opacity="0.15" />
            
            {/* Eyes */}
            <g id="eyes">
              {state === 'thinking' ? (
                <>
                  {/* Half-closed thinking eyes */}
                  <path d="M 45 68 Q 55 73 65 68" stroke="#818cf8" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M 95 68 Q 105 73 115 68" stroke="#818cf8" strokeWidth="3" fill="none" strokeLinecap="round" />
                </>
              ) : isBlinking ? (
                <>
                  {/* Blinking eyes (closed lines) */}
                  <path d="M 45 70 Q 55 70 65 70" stroke="#818cf8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  <path d="M 95 70 Q 105 70 115 70" stroke="#818cf8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                </>
              ) : state === 'listening' ? (
                <>
                  {/* Listening eyes (wider circle) */}
                  <circle cx="55" cy="70" r="7" fill="#818cf8" />
                  <circle cx="105" cy="70" r="7" fill="#818cf8" />
                  {/* Small inner pupil spark */}
                  <circle cx="53" cy="68" r="2.2" fill="#ffffff" />
                  <circle cx="103" cy="68" r="2.2" fill="#ffffff" />
                </>
              ) : (
                <>
                  {/* Regular eyes (idle/speaking) */}
                  <circle cx="55" cy="70" r="5.5" fill="#818cf8" />
                  <circle cx="105" cy="70" r="5.5" fill="#818cf8" />
                  {/* Small inner pupil spark */}
                  <circle cx="53.5" cy="68.5" r="1.8" fill="#ffffff" />
                  <circle cx="103.5" cy="68.5" r="1.8" fill="#ffffff" />
                </>
              )}
            </g>

            {/* Mouth */}
            <path
              d={getMouthPath()}
              stroke="#818cf8"
              strokeWidth="3.5"
              fill={state === 'listening' || (state === 'speaking' && mouthOpen) ? '#818cf8' : 'none'}
              strokeLinecap="round"
              className="transition-all duration-150"
            />

            {/* Glowing cheeks (for speaking/idle state) */}
            <circle cx="42" cy="80" r="6" fill="#ec4899" opacity={state === 'speaking' ? '0.25' : '0.1'} />
            <circle cx="118" cy="80" r="6" fill="#ec4899" opacity={state === 'speaking' ? '0.25' : '0.1'} />

            {/* SVG Definitions */}
            <defs>
              <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
              </radialGradient>
            </defs>
          </svg>

          {/* THINKING: Rotating SVG spinner overlay */}
          {state === 'thinking' && (
            <svg className="absolute inset-0 w-full h-full animate-spin-slow pointer-events-none p-1" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                stroke="#f59e0b"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="289"
                strokeDashoffset="200"
              />
            </svg>
          )}
        </div>
      </div>

      {!hideStatus && (
        <>
          {/* SPEAKING state: 7 equalizer bars below avatar */}
          {state === 'speaking' ? (
            <div className="flex items-end justify-center space-x-[3px] h-8 mt-5">
              {[0.1, 0.4, 0.25, 0.6, 0.15, 0.5, 0.3].map((delay, idx) => (
                <div
                  key={idx}
                  className="w-1 rounded-t bg-indigo-500 animate-equalizer"
                  style={{ animationDelay: `${delay}s`, width: '4px' }}
                ></div>
              ))}
            </div>
          ) : state === 'thinking' ? (
            /* THINKING state: 3 blinking dots */
            <div className="flex items-center justify-center space-x-1.5 h-8 mt-5">
              {[0, 0.4, 0.8].map((delay, idx) => (
                <div
                  key={idx}
                  className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-dot-blink"
                  style={{ animationDelay: `${delay}s` }}
                ></div>
              ))}
            </div>
          ) : (
            /* Listening or Idle simple placeholder height spacing */
            <div className="h-8 mt-5"></div>
          )}

          {/* Pill Status Badge */}
          <div className="mt-2 transition-all duration-300">
            <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm animate-fade-in">
              <span className={`w-2.5 h-2.5 rounded-full ${status.color} transition-all duration-300`}></span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 tracking-wide" aria-live="assertive">
                {status.label}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
