import React, { useEffect, useRef, useState } from 'react';
import { useInterview } from '../context/InterviewContext';
import AvatarAria from './AvatarAria';
import { 
  Mic, 
  Video, 
  ChevronRight, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  History, 
  Award,
  CheckCircle,
  Briefcase,
  Monitor,
  Database,
  Layers,
  Terminal,
  Mail,
  Cpu,
  FileText,
  Upload,
  Wifi,
  Volume2,
  Lock,
  ArrowLeft,
  Loader2,
  Clock
} from 'lucide-react';

export default function Lobby() {
  const { 
    candidateInfo, 
    setCandidateInfo, 
    startInterview, 
    pastInterviews 
  } = useInterview();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lobbyVideoRef = useRef<HTMLVideoElement>(null);
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [expectAccordionOpen, setExpectAccordionOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  
  // Hardware status
  const [permissions, setPermissions] = useState({ video: false, audio: false });
  const [lobbyStream, setLobbyStream] = useState<MediaStream | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string }>({});
  
  // Locked to premium breathing 'idle' state for logo display
  const logoState = 'idle';
  
  // Resume upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<string>('');

  // Internet Status simulation
  const [internetChecking, setInternetChecking] = useState(true);
  const [internetStatus, setInternetStatus] = useState({ ping: 22, speed: 45.8, quality: 'Strong Connection' });

  // 1. Particle Canvas Background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{ x: number; y: number; vx: number; vy: number }> = [];
    const numParticles = window.innerWidth < 768 ? 30 : 60;
    const connectionDist = 120;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
        ctx.fill();

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 2. Hardware Checks & Microphone Analyser inside Step 3
  useEffect(() => {
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let animationId: number;

    const initHardware = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 180 }, audio: true });
        setLobbyStream(stream);
        setPermissions({ video: true, audio: true });

        if (lobbyVideoRef.current) {
          lobbyVideoRef.current.srcObject = stream;
        }

        // Web Audio API for level meter
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 128;
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateMicLevel = () => {
          if (!analyser) return;
          if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume().catch(e => console.warn(e));
          }
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          // Scale to percentage
          setMicLevel(Math.min(100, Math.round((average / 128) * 100) * 2.5));
          animationId = requestAnimationFrame(updateMicLevel);
        };
        updateMicLevel();

      } catch (err) {
        console.warn('Hardware permission denied or error:', err);
        setPermissions({ video: false, audio: false });
      }
    };

    if (step === 3) {
      initHardware();
      // Simulate network speed test
      setInternetChecking(true);
      const netTimer = setTimeout(() => {
        setInternetChecking(false);
      }, 1500);

      return () => {
        clearTimeout(netTimer);
        if (stream) {
          stream.getTracks().forEach(t => t.stop());
        }
        if (audioContext) {
          audioContext.close();
        }
        cancelAnimationFrame(animationId);
      };
    }
  }, [step]);

  // Synchronize lobby stream to video element when permissions or stream updates
  useEffect(() => {
    if (permissions.video && lobbyStream && lobbyVideoRef.current) {
      if (lobbyVideoRef.current.srcObject !== lobbyStream) {
        lobbyVideoRef.current.srcObject = lobbyStream;
      }
    }
  }, [permissions.video, lobbyStream]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (candidateInfo.name?.trim() && permissions.audio && permissions.video) {
      startInterview();
    }
  };

  const handleProceedToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; email?: string } = {};

    if (!candidateInfo.name?.trim()) {
      errors.name = "Full Name is required!";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!candidateInfo.email?.trim()) {
      errors.email = "Email Address is required!";
    } else if (!emailRegex.test(candidateInfo.email.trim())) {
      errors.email = "Please enter a valid email address!";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setStep(3);
  };

  // Mock Resume Upload Progression
  const simulateResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file.name);
    setIsUploading(true);
    setUploadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setCandidateInfo({ ...candidateInfo, resumeName: file.name });
      }
    }, 250);
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'Frontend Dev': return <Monitor className="w-4 h-4 text-indigo-400" />;
      case 'Backend Dev': return <Database className="w-4 h-4 text-indigo-400" />;
      case 'Full Stack': return <Layers className="w-4 h-4 text-indigo-400" />;
      case 'Data Scientist': return <Terminal className="w-4 h-4 text-indigo-400" />;
      default: return <Briefcase className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#090913] flex items-center justify-center p-4 overflow-x-hidden text-slate-100 font-sans">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-xl bg-[#0f0f23]/85 border border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-6 md:p-8 transition-all duration-300">
        
        {/* Dynamic header step indicator */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">Setup Wizard</span>
            <span className="text-slate-600 text-xs">/</span>
            <span className="text-slate-400 text-xs font-bold">Step {step} of 3</span>
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3].map((s) => (
              <span 
                key={s} 
                className={`w-4 h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? 'bg-indigo-500 w-6' : s < step ? 'bg-indigo-500/40' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ================= STEP 1: WELCOME & INSTRUCTIONS ================= */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col items-center text-center">
              {/* Dynamic Animated Avatar Branding Logo */}
              <div className="mb-4 flex items-center justify-center relative">
                {/* Elegant subtle glass glow background under the avatar */}
                <div className="absolute w-28 h-28 bg-indigo-500/10 rounded-full blur-xl pointer-events-none"></div>
                <AvatarAria state={logoState} size={110} />
              </div>
              
              <h1 className="text-3xl font-extrabold tracking-tight mb-1 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                InterviewAI
              </h1>
              <p className="text-xs font-bold text-indigo-350 tracking-widest uppercase mb-4">
                AI-Powered Interview Coach
              </p>
              
              <div className="flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-inner">
                <Clock className="w-4 h-4 mr-1 text-indigo-350" />
                <span>Estimated Duration: ~15 mins</span>
              </div>
            </div>

            <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 space-y-3.5 shadow-inner">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center">
                <Award className="w-4 h-4 mr-2 text-indigo-400" />
                Guidelines
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                You are about to undergo a realistic, role-tailored hiring simulation conducted by our advanced AI interviewer, **Aria**.
              </p>
              <div className="space-y-2 text-xs text-slate-400 font-sans leading-relaxed">
                <div className="flex items-start">
                  <span className="text-indigo-400 font-bold mr-2 text-[14px]">01.</span>
                  <span><strong>AI Speech & Voice Synthesis</strong>: Aria will verbally speak all questions. Ensure you have speakers or headphones on.</span>
                </div>
                <div className="flex items-start">
                  <span className="text-indigo-400 font-bold mr-2 text-[14px]">02.</span>
                  <span><strong>Mic Recording Answer Drafts</strong>: Answer questions by typing or using the real-time voice microphone translation features.</span>
                </div>
                <div className="flex items-start">
                  <span className="text-indigo-400 font-bold mr-2 text-[14px]">03.</span>
                  <span><strong>Workspace Coding Sandbox</strong>: Coding questions will activate a high-fidelity editor sandbox to input and submit your code logic.</span>
                </div>
              </div>
            </div>

            {/* Accordion What to Expect */}
            <div className="border border-white/5 bg-slate-950/40 rounded-xl overflow-hidden shadow-inner">
              <button
                type="button"
                onClick={() => setExpectAccordionOpen(!expectAccordionOpen)}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-300 hover:text-indigo-250 transition-colors"
              >
                <span className="flex items-center">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  What Focus Areas will be evaluated?
                </span>
                {expectAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {expectAccordionOpen && (
                <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed space-y-2 border-t border-white/5 bg-slate-950/20 font-sans">
                  <p>Aria will gauge your performance across five core quadrants:</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-350 tracking-wide mt-2">
                    <div className="flex items-center space-x-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span><span>Technical Competency</span></div>
                    <div className="flex items-center space-x-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span><span>Problem Solving</span></div>
                    <div className="flex items-center space-x-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span><span>Communication Style</span></div>
                    <div className="flex items-center space-x-1.5"><span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span><span>System Design Core</span></div>
                  </div>
                </div>
              )}
            </div>


            <button
              onClick={() => setStep(2)}
              className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center transition-all active:scale-[0.98] group shadow-lg border border-indigo-500/30"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1200ms] ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              <span>Begin Candidate Setup</span>
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
        {/* ================= STEP 2: CANDIDATE DETAILS SCREEN ================= */}
        {step === 2 && (
          <form onSubmit={handleProceedToStep3} className="space-y-5 animate-fade-in">
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center">
              <Mail className="w-5 h-5 mr-2 text-indigo-400" />
              Profile Information
            </h2>
            
            <div className="space-y-4 font-sans">
              {/* Name & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="details-name" className="block text-[10px] font-bold text-slate-300 tracking-wider uppercase mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="details-name"
                    type="text"
                    value={candidateInfo.name || ''}
                    onChange={(e) => setCandidateInfo({ ...candidateInfo, name: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-950/60 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm text-slate-100 transition-all placeholder-slate-600 ${
                      formErrors.name ? 'border-rose-500/50 focus:ring-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.15)]' : 'border-white/10'
                    }`}
                    placeholder="Jane Doe"
                  />
                  {formErrors.name && (
                    <span className="text-[10px] text-rose-450 font-bold tracking-wide mt-1.5 animate-pulse flex items-center space-x-1">
                      <span>⚠️</span> <span>{formErrors.name}</span>
                    </span>
                  )}
                </div>
                
                <div>
                  <label htmlFor="details-email" className="block text-[10px] font-bold text-slate-300 tracking-wider uppercase mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="details-email"
                    type="text"
                    value={candidateInfo.email || ''}
                    onChange={(e) => setCandidateInfo({ ...candidateInfo, email: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-950/60 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm text-slate-100 transition-all placeholder-slate-600 ${
                      formErrors.email ? 'border-rose-500/50 focus:ring-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.15)]' : 'border-white/10'
                    }`}
                    placeholder="jane.doe@example.com"
                  />
                  {formErrors.email && (
                    <span className="text-[10px] text-rose-450 font-bold tracking-wide mt-1.5 animate-pulse flex items-center space-x-1">
                      <span>⚠️</span> <span>{formErrors.email}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Role & Experience Level Selects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 tracking-wider uppercase mb-1.5 flex items-center">
                    <span className="mr-1.5 shrink-0">{getRoleIcon(candidateInfo.role)}</span>
                    Applied Job Role
                  </label>
                  <div className="relative">
                    <select
                      value={candidateInfo.role}
                      onChange={(e) => setCandidateInfo({ ...candidateInfo, role: e.target.value })}
                      className="w-full pl-3 pr-7 py-2.5 rounded-xl border border-white/10 bg-slate-950/60 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none text-xs text-slate-200"
                    >
                      <option value="Frontend Dev">Frontend Dev</option>
                      <option value="Backend Dev">Backend Dev</option>
                      <option value="Full Stack">Full Stack</option>
                      <option value="Data Scientist">Data Scientist</option>
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 tracking-wider uppercase mb-1.5 flex items-center">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400 mr-1.5 shrink-0" />
                    Experience Level
                  </label>
                  <div className="relative">
                    <select
                      value={candidateInfo.difficulty}
                      onChange={(e) => setCandidateInfo({ ...candidateInfo, difficulty: e.target.value })}
                      className="w-full pl-3 pr-7 py-2.5 rounded-xl border border-white/10 bg-slate-950/60 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none text-xs text-slate-200"
                    >
                      <option value="Junior">Junior (0-2 yrs)</option>
                      <option value="Mid">Mid Level (2-5 yrs)</option>
                      <option value="Senior">Senior (5+ yrs)</option>
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Input */}
              <div>
                <label htmlFor="details-skills" className="block text-[10px] font-bold text-slate-300 tracking-wider uppercase mb-1.5">
                  Core Skills / Technologies
                </label>
                <input
                  id="details-skills"
                  type="text"
                  value={candidateInfo.skills || ''}
                  onChange={(e) => setCandidateInfo({ ...candidateInfo, skills: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-950/60 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm text-slate-100 transition-all placeholder-slate-650"
                  placeholder="React, Node.js, TypeScript, HSL CSS"
                />
              </div>

              {/* Drag-and-Drop Resume Upload UI (Optional UI Only) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-300 tracking-wider uppercase mb-1.5 flex items-center">
                  <FileText className="w-3.5 h-3.5 text-indigo-400 mr-1.5 shrink-0" />
                  Resume Attachment (Optional UI)
                </label>
                
                <div className="relative border-2 border-dashed border-white/10 rounded-2xl bg-slate-950/45 p-4 text-center hover:border-indigo-500/40 transition-colors cursor-pointer group">
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={simulateResumeUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center py-2 space-y-2">
                      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                      <span className="text-xs text-slate-400">Uploading {selectedFile}... ({uploadProgress}%)</span>
                      <div className="w-36 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-200" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>
                  ) : candidateInfo.resumeName ? (
                    <div className="flex flex-col items-center justify-center py-2 space-y-1.5">
                      <CheckCircle className="w-7 h-7 text-green-400 animate-pulse" />
                      <span className="text-xs font-bold text-green-400">Upload Complete!</span>
                      <span className="text-[10px] text-slate-450 font-mono bg-slate-950 px-2 py-0.5 rounded border border-white/5">
                        {candidateInfo.resumeName}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2 space-y-1">
                      <Upload className="w-6 h-6 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                      <span className="text-xs text-slate-350 font-semibold">Drag & Drop Resume here, or browse</span>
                      <span className="text-[9px] text-slate-550">Supports PDF, DOCX up to 5MB</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Back & Next Actions */}
            <div className="flex flex-col sm:flex-row space-y-2.5 sm:space-y-0 sm:space-x-3.5 pt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back
              </button>
              
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-indigo-650 to-indigo-550 hover:from-indigo-600 hover:to-indigo-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all active:scale-95 shadow-md border border-indigo-500/20"
              >
                Hardware Check
                <ChevronRight className="w-3.5 h-3.5 ml-1.5" />
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 3: HARDWARE SETUP & GUIDELINES SCREEN ================= */}
        {step === 3 && (
          <form onSubmit={handleStart} className="space-y-5 animate-fade-in">
            <style>{`
              @keyframes scan {
                0% { transform: translateY(-180%); opacity: 0.15; }
                50% { transform: translateY(180%); opacity: 1; }
                100% { transform: translateY(-180%); opacity: 0.15; }
              }
              @keyframes wave-pulse {
                0%, 100% { transform: scaleY(0.2); }
                50% { transform: scaleY(1); }
              }
              .animate-scan {
                animation: scan 2.5s ease-in-out infinite;
              }
              .animate-wave-pulse {
                transform-origin: center;
                animation: wave-pulse 1s ease-in-out infinite alternate;
              }
            `}</style>
            
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center">
              <Wifi className="w-5 h-5 mr-2 text-indigo-400" />
              Hardware & Signal Setup
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Webcam Preview Box */}
              <div className="relative aspect-video md:h-[130px] rounded-2xl bg-slate-900 border border-white/10 overflow-hidden group flex items-center justify-center">
                {permissions.video ? (
                  <>
                    <video 
                      ref={(el) => {
                        (lobbyVideoRef as any).current = el;
                        if (el && lobbyStream) {
                          el.srcObject = lobbyStream;
                        }
                      }}
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-[9px] font-bold text-green-400 rounded-full border border-green-500/20 flex items-center space-x-1">
                      <span className="w-1 h-1 rounded-full bg-green-500 animate-ping"></span>
                      <span>Camera Live</span>
                    </span>
                    
                    {/* Face Recognition overlay in Lobby setup video feed */}
                    <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                      <div className="w-[85px] h-[85px] border border-green-500/35 rounded-xl relative flex items-center justify-center animate-breath">
                        <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-green-400 rounded-tl-sm"></div>
                        <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-green-400 rounded-tr-sm"></div>
                        <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-green-400 rounded-bl-sm"></div>
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-green-400 rounded-br-sm"></div>
                        
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm border border-green-500/25 px-1.5 py-0.5 rounded text-[6px] font-mono text-green-400 tracking-wider uppercase font-bold whitespace-nowrap shadow">
                          FACE LOCK: OK
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 bg-slate-950 flex items-center justify-center overflow-hidden font-mono text-[9px] text-slate-400">
                    {/* Retro sci-fi scanning laser sweep */}
                    <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#22d3ee] animate-scan pointer-events-none"></div>
                    
                    {/* Targeting concentric rings */}
                    <div className="relative border border-indigo-500/20 border-dashed rounded-full w-24 h-24 flex items-center justify-center animate-spin-slow">
                      <div className="border border-indigo-500/30 rounded-full w-16 h-16 flex items-center justify-center">
                      </div>
                    </div>

                    {/* Human Face Silhouette outline placed in absolute center */}
                    <div className="absolute flex items-center justify-center pointer-events-none">
                      <svg className="w-14 h-14 text-indigo-400/70 drop-shadow-[0_0_6px_rgba(129,140,248,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>

                    {/* AI Face Recognition lock-on around the silhouette */}
                    <div className="absolute w-[68px] h-[68px] border border-green-500/30 rounded-xl flex items-center justify-center animate-breath pointer-events-none">
                      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-green-400 rounded-tl-sm"></div>
                      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-green-400 rounded-tr-sm"></div>
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-green-400 rounded-bl-sm"></div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-green-400 rounded-br-sm"></div>
                      <span className="absolute -top-4.5 bg-black/85 border border-green-500/25 px-1 py-0.5 rounded text-[5px] font-mono text-green-400 tracking-wider uppercase font-bold whitespace-nowrap shadow-md">
                        FACE LOCK: OK
                      </span>
                    </div>

                    {/* Metadata overlays */}
                    <span className="absolute top-2 left-2.5 text-rose-500 font-extrabold uppercase flex items-center tracking-wider animate-pulse">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mr-1.5"></span>
                      REC
                    </span>
                    <span className="absolute top-2 right-2.5 font-bold tracking-tight opacity-60">
                      1080P 60FPS
                    </span>
                    <span className="absolute bottom-2 right-2.5 font-extrabold text-[8px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-widest shadow-sm">
                      Simulated Active
                    </span>
                    <span className="absolute bottom-2 left-2.5 font-bold opacity-60">
                      ISO 400
                    </span>
                  </div>
                )}
              </div>

              {/* Microphone & Internet check col */}
              <div className="space-y-3.5 flex flex-col justify-between">
                
                {/* Real Voice Volume Meter */}
                <div className="bg-slate-950/45 p-3 rounded-2xl border border-white/5 space-y-2 flex-grow shadow-inner">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    <span className="flex items-center"><Volume2 className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Microphone Sensor</span>
                    <span className="text-green-400 font-extrabold">
                      {permissions.audio ? 'Live Feed' : 'Active (Simulated)'}
                    </span>
                  </div>
                                    {/* Dynamic pulsing volume bar */}
                  <div className="h-5 w-full bg-slate-900/80 rounded-lg overflow-hidden border border-white/5 relative flex items-center px-1">
                    <div className="flex items-center justify-between w-full h-full px-4 py-0.5">
                      {[0.4, 0.8, 0.5, 0.9, 0.3, 0.7, 0.4, 0.8, 0.6, 0.9, 0.5, 0.3].map((val, idx) => {
                        // Calculate dynamic height scaling: base pulse + mic level scaling!
                        const scale = permissions.audio ? Math.max(0.35, micLevel / 40) : 1;
                        return (
                          <div
                            key={idx}
                            className="w-1 bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-full animate-wave-pulse"
                            style={{
                              height: `${Math.min(95, Math.max(15, val * 100 * scale))}%`,
                              animationDelay: `${idx * 0.08}s`,
                              animationDuration: `${0.4 + val * 0.5}s`
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-500 italic leading-tight">
                    {permissions.audio ? '🎙️ Talk now to watch your voice levels activate in real-time!' : '✅ Simulated soundwaves are active and visually verifying your signal!'}
                  </p>
                </div>

                {/* Internet latency Indicator */}
                <div className="bg-slate-950/45 p-3 rounded-2xl border border-white/5 flex items-center justify-between shadow-inner">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center">
                    <Wifi className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Connection Bandwidth
                  </span>
                  
                  {internetChecking ? (
                    <div className="flex items-center space-x-1 text-slate-500 animate-pulse text-[9px] font-extrabold uppercase">
                      <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                      <span>Checking Pings</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 bg-green-500/10 text-green-400 border border-green-500/25 px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider uppercase shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                      <span>22ms / Strong</span>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Safeguard warnings */}
            <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 text-xs text-amber-300 leading-relaxed font-sans space-y-2">
              <h4 className="font-bold flex items-center uppercase text-[10px] tracking-wider">
                <Lock className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                Anti-Plagiarism & Screen Rules
              </h4>
              <p>
                To maintain hiring standards, an anti-cheat shield is active. **Leaving full-screen mode, minimizing windows, or switching browser tabs** will register warnings and log alerts in your recruiter dashboard.
              </p>
            </div>

            {/* Back & Submit arena */}
            <div className="flex flex-col sm:flex-row space-y-2.5 sm:space-y-0 sm:space-x-3.5 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-3.5 border border-white/10 hover:bg-white/5 text-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back
              </button>
              
              <button
                type="submit"
                disabled={!permissions.video || !permissions.audio}
                className="flex-1 py-3.5 bg-gradient-to-r from-green-600 to-indigo-600 hover:from-green-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center transition-all active:scale-95 group shadow-lg border border-indigo-500/20"
              >
                <span>Enter Interview Arena</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {(!permissions.video || !permissions.audio) && (
              <div className="flex flex-col items-center space-y-2 pt-2 text-center shrink-0">
                <p className="text-[10px] text-amber-400/90 font-bold uppercase tracking-wider animate-pulse">
                  ⚠️ Grant microphone and webcam browser prompts to initiate
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPermissions({ video: true, audio: true });
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold transition-colors focus:outline-none"
                >
                  Or, skip setup check & proceed with simulated mock hardware
                </button>
              </div>
            )}
          </form>
        )}

      </div>
    </div>
  );
}
