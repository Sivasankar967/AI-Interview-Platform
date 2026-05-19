import React, { useEffect, useRef, useState } from 'react';
import { useInterview } from '../context/InterviewContext';
import { Mic, MicOff, Video, VideoOff, RotateCw, AlertTriangle, Hourglass } from 'lucide-react';

export default function CandidateCamera({ isPIP = false }: { isPIP?: boolean }) {
  const { candidateInfo, uiState, setUIState, interviewState } = useInterview();
  const { questions, currentQIndex, questionTimeElapsed } = interviewState;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentQIndex];
  
  const timeLeft = currentQuestion?.timeLimit 
    ? Math.max(0, currentQuestion.timeLimit - questionTimeElapsed) 
    : 0;
    
  const isLowTime = currentQuestion?.timeLimit 
    ? timeLeft <= 25 
    : false;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const initCamera = async () => {
    setLoading(true);
    setError(null);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 360 },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Camera access denied');
    } finally {
      setLoading(false);
    }
  };

  // Initialize camera stream when camera is turned on
  useEffect(() => {
    if (!uiState.isCameraOff) {
      initCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setLoading(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [uiState.isCameraOff]);

  const toggleMute = () => {
    setUIState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const toggleCamera = () => {
    setUIState(prev => ({ ...prev, isCameraOff: !prev.isCameraOff }));
  };

  // Get initials for initials fallback placeholder
  const getInitials = (name: string) => {
    if (!name) return 'JD';
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Compact Picture-in-Picture Render
  if (isPIP) {
    return (
      <div className="relative w-full h-full bg-slate-900 overflow-hidden group">
        {/* Loading state shimmer */}
        {loading && !uiState.isCameraOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 dark:bg-slate-950">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-slate-700/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
            <div className="absolute flex flex-col items-center space-y-1">
              <RotateCw className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-[9px] text-slate-500">Camera...</span>
            </div>
          </div>
        )}

        {/* Error / Denied state */}
        {error && !uiState.isCameraOff && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-center p-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 mb-1" />
            <p className="text-[9px] text-slate-400 font-medium">Denied</p>
          </div>
        )}

        {/* Camera Off Placeholder */}
        {uiState.isCameraOff && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950">
            <div className="w-8 h-8 rounded-full bg-slate-800/85 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 shadow-inner">
              {getInitials(candidateInfo.name)}
            </div>
          </div>
        )}

        {/* Video feed */}
        {!uiState.isCameraOff && !error && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              loading ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )}

        {/* AI Face Recognition / Autofocus Overlay Grid (Active when camera is live) */}
        {!uiState.isCameraOff && !error && !loading && (
          <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
            {/* Target Face Box */}
            <div className="w-[50px] h-[50px] border border-green-500/30 rounded-md relative flex items-center justify-center animate-breath">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-green-400 rounded-tl-sm"></div>
              <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-green-400 rounded-tr-sm"></div>
              <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-green-400 rounded-bl-sm"></div>
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-green-400 rounded-br-sm"></div>
              
              {/* Floating tracking metadata label */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur-sm border border-green-500/30 px-1 py-0.5 rounded-[3px] text-[5px] font-mono text-green-400 tracking-wider uppercase font-bold whitespace-nowrap shadow">
                FACE ACTIVE
              </div>
            </div>
          </div>
        )}

        {/* Pulsing red mic-muted indicator overlay */}
        {uiState.isMuted && (
          <div className="absolute top-1.5 right-1.5 z-20 flex items-center justify-center bg-red-600/90 text-white p-1 rounded-full border border-red-500/30 animate-pulse shadow">
            <MicOff className="w-2.5 h-2.5" />
          </div>
        )}
      </div>
    );
  }

  // Full Desktop Render
  return (
    <div className="w-full flex flex-col space-y-3">
      {/* Video Container */}
      <div className="relative w-full aspect-video rounded-xl bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden group">
        
        {/* Upgrade: Thin Question Time Progress Bar along the top edge of camera (highly visible on mobile) */}
        {currentQuestion?.timeLimit && (
          <div className="absolute top-0 inset-x-0 z-30 h-1.5 bg-black/35">
            <div 
              className={`h-full transition-all duration-1000 ${
                isLowTime 
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse' 
                  : 'bg-indigo-500'
              }`}
              style={{ width: `${Math.min(100, (timeLeft / currentQuestion.timeLimit) * 100)}%` }}
            ></div>
          </div>
        )}

        {/* Upgrade: Question countdown overlay badge (extremely handy for mobile/closed drawer views) */}
        {currentQuestion?.timeLimit && (
          <div className="absolute top-3.5 left-3 z-20 flex items-center space-x-1.5 bg-black/75 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] font-bold border border-white/10 shadow">
            <Hourglass className={`w-3 h-3 ${isLowTime ? 'text-rose-500 animate-spin-slow' : 'text-indigo-400'}`} />
            <span className={isLowTime ? 'text-rose-400' : 'text-slate-200'}>{formatTime(timeLeft)}</span>
          </div>
        )}

        {/* Loading state shimmer */}
        {loading && !uiState.isCameraOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 dark:bg-slate-950">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-slate-700/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
            <div className="absolute flex flex-col items-center space-y-2">
              <RotateCw className="w-6 h-6 text-indigo-400 animate-spin" />
              <span className="text-xs text-slate-400">Connecting Camera...</span>
            </div>
          </div>
        )}

        {/* Error / Denied state */}
        {error && !uiState.isCameraOff && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-center p-4">
            <AlertTriangle className="w-8 h-8 text-rose-500 mb-2" />
            <p className="text-xs text-slate-200 font-medium mb-3">{error}</p>
            <button
              onClick={initCamera}
              className="flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5 mr-1.5" />
              Retry Permission
            </button>
          </div>
        )}

        {/* Camera Off Placeholder */}
        {uiState.isCameraOff && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-xl font-bold text-slate-300 shadow-inner">
              {getInitials(candidateInfo.name)}
            </div>
            <span className="text-xs text-slate-500 mt-2 font-medium">Camera Feed Paused</span>
          </div>
        )}

        {/* Video feed */}
        {!uiState.isCameraOff && !error && (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover aspect-video transition-opacity duration-300 ${
              loading ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )}

        {/* AI Face Recognition / Autofocus Overlay Grid (Active when camera is live) */}
        {!uiState.isCameraOff && !error && !loading && (
          <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
            {/* Target Face Box */}
            <div className="w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] border border-green-500/30 rounded-xl relative flex items-center justify-center animate-breath">
              
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-green-400 rounded-tl-md"></div>
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-green-400 rounded-tr-md"></div>
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-green-400 rounded-bl-md"></div>
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-green-400 rounded-br-md"></div>
              
              {/* Floating tracking metadata label */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-sm border border-green-500/30 px-2 py-0.5 rounded text-[8px] font-mono text-green-400 tracking-wider uppercase font-bold flex items-center space-x-1 whitespace-nowrap shadow-md">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping mr-1"></span>
                <span>AI: Face Detected (99.4%)</span>
              </div>
              
              {/* Center target cursor dot */}
              <div className="w-1 h-1 bg-green-400 rounded-full opacity-60"></div>
            </div>

            {/* Simulated target metrics */}
            <div className="absolute top-12 right-3 font-mono text-[7px] text-green-500/75 space-y-0.5 text-right hidden sm:block">
              <div>PITCH: 1.24°</div>
              <div>YAW: -0.82°</div>
              <div>ROLL: 0.15°</div>
            </div>
            
            <div className="absolute top-12 left-3 font-mono text-[7px] text-green-500/75 space-y-0.5 hidden sm:block">
              <div>EYE_CONTACT: OK</div>
              <div>ENGAGEMENT: HIGH</div>
              <div>POSE: STABLE</div>
            </div>
          </div>
        )}

        {/* Pulsing red mic-muted indicator overlay */}
        {uiState.isMuted && (
          <div className="absolute top-3.5 right-3 z-20 flex items-center space-x-1.5 bg-red-600/90 text-white px-2 py-0.5 rounded-full text-[10px] font-semibold border border-red-500/30 animate-pulse shadow">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            <span>Muted</span>
          </div>
        )}

        {/* Lower-third overlay */}
        <div className="absolute bottom-0 inset-x-0 z-20 bg-black/60 backdrop-blur-[4px] px-4 py-2 flex flex-col items-start border-t border-white/5">
          <span className="text-[13px] font-medium text-white tracking-wide">
            {candidateInfo.name || 'Candidate'}
          </span>
          <span className="text-[11px] text-indigo-300 font-normal leading-none mt-0.5">
            {candidateInfo.role || 'Frontend Developer'}
          </span>
        </div>
      </div>

      {/* Controls row below video */}
      <div className="flex items-center justify-center space-x-3 py-1">
        {/* Mic toggle */}
        <button
          onClick={toggleMute}
          aria-label={uiState.isMuted ? 'Unmute microphone' : 'Mute microphone'}
          className={`w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center transition-all duration-150 active:scale-95 ${
            uiState.isMuted
              ? 'bg-red-500 border-red-600 text-white'
              : 'bg-green-500 border-green-600 text-white'
          }`}
        >
          {uiState.isMuted ? (
            <MicOff className="w-4 h-4 transition-transform duration-150 hover:scale-105" />
          ) : (
            <Mic className="w-4 h-4 transition-transform duration-150 hover:scale-105" />
          )}
        </button>

        {/* Camera toggle */}
        <button
          onClick={toggleCamera}
          aria-label={uiState.isCameraOff ? 'Turn camera on' : 'Turn camera off'}
          className={`w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center transition-all duration-150 active:scale-95 ${
            uiState.isCameraOff
              ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              : 'bg-indigo-600 border-indigo-700 text-white'
          }`}
        >
          {uiState.isCameraOff ? (
            <VideoOff className="w-4 h-4 transition-transform duration-150 hover:scale-105" />
          ) : (
            <Video className="w-4 h-4 transition-transform duration-150 hover:scale-105" />
          )}
        </button>
      </div>
    </div>
  );
}
