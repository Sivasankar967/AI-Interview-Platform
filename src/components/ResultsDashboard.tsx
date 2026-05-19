import React, { useEffect, useRef, useState } from 'react';
import { useInterview } from '../context/InterviewContext';
import RadarChart from './RadarChart';
import { Download, RefreshCw, Share2, Award, Clock, BookOpen, Crown, Star, Check, AlertTriangle, X, Shield } from 'lucide-react';
import { feedbackSnippets } from '../data/mockResponses';
import html2canvas from 'html2canvas';

export default function ResultsDashboard() {
  const { candidateInfo, interviewState, setCurrentScreen } = useInterview();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // States for reveal sequence
  const [screenVisible, setScreenVisible] = useState(false);
  const [gaugeScore, setGaugeScore] = useState(0);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  // Calculate dynamic overall score based on actual answers
  const answersList = Object.values(interviewState.answers);
  const calculatedOverall = answersList.length > 0
    ? Math.round(answersList.reduce((acc, curr) => acc + curr.score, 0) / answersList.length)
    : 84; // default portfolio showcase score

  // 5 axes: Technical, Communication, Problem Solving, Code Quality, System Design
  const calculatedTechnical = Math.round(calculatedOverall - (Math.random() * 6 - 3));
  const calculatedComm = Math.round(calculatedOverall + (Math.random() * 8 - 2));
  const calculatedProb = Math.round(calculatedOverall - (Math.random() * 5 - 2));
  const calculatedCode = Math.round(calculatedOverall + (Math.random() * 4 - 2));
  const calculatedDesign = Math.round(calculatedOverall - (Math.random() * 8 - 4));

  const radarData = [
    { label: 'Technical', value: calculatedTechnical },
    { label: 'Communication', value: calculatedComm },
    { label: 'Problem Solving', value: calculatedProb },
    { label: 'Code Quality', value: calculatedCode },
    { label: 'System Design', value: calculatedDesign }
  ];

  // Grade badge generator
  const getGradeInfo = (score: number) => {
    if (score >= 90) return { label: 'S', color: 'from-amber-400 to-yellow-500 text-yellow-950 border-amber-300', shadow: 'shadow-amber-500/20', icon: <Crown className="w-8 h-8" /> };
    if (score >= 80) return { label: 'A', color: 'from-indigo-500 to-indigo-600 text-white border-indigo-400', shadow: 'shadow-indigo-500/20', icon: <Star className="w-8 h-8" /> };
    if (score >= 70) return { label: 'B', color: 'from-teal-500 to-emerald-600 text-white border-teal-400', shadow: 'shadow-teal-500/20', icon: <Check className="w-8 h-8" /> };
    if (score >= 60) return { label: 'C', color: 'from-amber-500 to-orange-600 text-white border-amber-400', shadow: 'shadow-amber-500/20', icon: <AlertTriangle className="w-8 h-8" /> };
    return { label: 'D', color: 'from-red-500 to-rose-600 text-white border-red-400', shadow: 'shadow-rose-500/20', icon: <X className="w-8 h-8" /> };
  };

  const grade = getGradeInfo(calculatedOverall);

  // Upgrade 8: Pure JS Confetti Burst Animation (No external library)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles: Array<{
      x: number;
      y: number;
      size: number;
      color: string;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];
    
    const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#3b82f6'];

    // Spawn 200 particles from the center/bottom
    for (let i = 0; i < 200; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.7,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 20 - 5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      });
    }

    let animationFrameId: number;
    let startTime = Date.now();

    const animateConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = Date.now() - startTime;

      if (elapsed > 4000) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return; // Auto stop after 4 seconds
      }

      particles.forEach(p => {
        p.vy += 0.45; // gravity
        p.vx *= 0.98; // air resistance
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(animateConfetti);
    };

    animateConfetti();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Premium Reveal Sequencing
  useEffect(() => {
    // 1. Screen fade-in
    setScreenVisible(true);

    // 2. Score gauge counts up
    const gaugeTimeout = setTimeout(() => {
      let count = 0;
      const interval = setInterval(() => {
        count += 1;
        if (count >= calculatedOverall) {
          setGaugeScore(calculatedOverall);
          clearInterval(interval);
        } else {
          setGaugeScore(count);
        }
      }, 1200 / calculatedOverall);
    }, 200);

    // 3. Staggered Metric Cards slide-in after 800ms
    const cardsTimeout = setTimeout(() => {
      setCardsVisible(true);
    }, 800);

    // 4. Feedback section fades in last (1400ms)
    const feedbackTimeout = setTimeout(() => {
      setFeedbackVisible(true);
    }, 1400);

    return () => {
      clearTimeout(gaugeTimeout);
      clearTimeout(cardsTimeout);
      clearTimeout(feedbackTimeout);
    };
  }, [calculatedOverall]);

  // Upgrade 8: Dynamic PNG Screenshot Generation
  const handleShare = async () => {
    const card = shareCardRef.current;
    if (!card) return;

    // Temporarily bring off-screen div into view or render it to canvas
    card.style.display = 'block';
    
    try {
      const canvas = await html2canvas(card, {
        backgroundColor: '#0f0f23',
        scale: 2,
        logging: false
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `InterviewAI_${candidateInfo.name || 'Candidate'}_Report.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Screenshot generation failed:', e);
    } finally {
      card.style.display = 'none';
    }
  };

  return (
    <div className={`min-h-screen bg-[#090913] p-4 md:p-8 text-slate-100 overflow-x-hidden relative transition-opacity duration-500 font-sans ${
      screenVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      
      {/* Confetti Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />

      {/* Main Results Container */}
      <div className="max-w-6xl mx-auto space-y-6 pb-24">
        
        {/* Header Hero panel */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white/5 border border-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Subtle light orb accent */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="z-10 text-center md:text-left">
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 shadow">
                Evaluation Completed
              </span>
              <span className="text-[11px] font-bold text-green-400 uppercase tracking-widest bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 shadow">
                Status: Submitted for Review
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mt-3 mb-2 bg-gradient-to-r from-white via-indigo-200 to-indigo-300 bg-clip-text text-transparent">
              Outstanding Work, {candidateInfo.name || 'Candidate'}!
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              You've successfully completed the <strong className="text-slate-200">{candidateInfo.role}</strong> simulation.
            </p>
          </div>
          
          {/* SVG Circular Gauge & Grade Badge row */}
          <div className="mt-8 md:mt-0 flex items-center space-x-6 z-10">
            {/* Circular Gauge */}
            <div className="relative w-24 h-24 flex items-center justify-center select-none shadow">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
                <circle 
                  cx="48" 
                  cy="48" 
                  r="40" 
                  stroke="#6366f1" 
                  strokeWidth="7" 
                  fill="none" 
                  strokeDasharray="251.2" 
                  strokeDashoffset={251.2 - (251.2 * gaugeScore) / 100}
                  className="transition-all duration-300 drop-shadow-[0_0_6px_rgba(99,102,241,0.6)]"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-black text-slate-100 tracking-tighter">{gaugeScore}%</span>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Score</span>
              </div>
            </div>

            {/* Achievement Grade Badge */}
            <div className={`flex flex-col items-center bg-gradient-to-br ${grade.color} ${grade.shadow} border px-4 py-2.5 rounded-2xl animate-[bounce_1.5s_infinite] max-w-[100px]`}>
              {grade.icon}
              <span className="text-[10px] font-extrabold uppercase mt-1 tracking-wider">Grade {grade.label}</span>
            </div>
          </div>
        </header>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Results Body */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Score Grid Cards */}
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 transition-all duration-500 ${
              cardsVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              {radarData.map((stat, i) => (
                <div 
                  key={i} 
                  className="bg-white/5 border border-white/10 backdrop-blur-md p-4 rounded-2xl shadow hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="text-slate-400 font-bold uppercase tracking-wider text-[9px] mb-1.5">{stat.label}</div>
                  <div className="text-xl font-black text-slate-200 tracking-tight">{stat.value}<span className="text-xs text-slate-500 font-normal">/100</span></div>
                </div>
              ))}
              
              {/* Attempted Questions Card */}
              <div 
                className="bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md p-4 rounded-2xl shadow hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                style={{ transitionDelay: `400ms` }}
              >
                <div className="text-indigo-400 font-bold uppercase tracking-wider text-[9px] mb-1.5">Questions Attempted</div>
                <div className="text-xl font-black text-slate-200 tracking-tight">
                  {Object.keys(interviewState.answers).length}<span className="text-xs text-slate-500 font-normal">/{interviewState.questions.length}</span>
                </div>
              </div>
            </div>

            {/* AI Reviewer Feedback Panel */}
            <div className={`bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-3xl shadow transition-all duration-500 ${
              feedbackVisible ? 'opacity-100' : 'opacity-0'
            }`}>
              <h2 className="text-lg font-bold mb-6 flex items-center tracking-tight">
                <Award className="w-5 h-5 mr-2 text-indigo-400" />
                Interviewer Performance Review
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 shadow-inner">
                  <h3 className="text-green-400 font-bold mb-3.5 flex items-center text-xs tracking-wider uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    Primary Strengths
                  </h3>
                  <ul className="space-y-3 font-sans">
                    {feedbackSnippets.strengths.slice(0, 3).map((item, i) => (
                      <li key={i} className="flex items-start text-xs leading-relaxed text-slate-400 font-medium">
                        <span className="text-green-500 font-bold mr-2 text-[14px]">✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Improvements */}
                <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 shadow-inner">
                  <h3 className="text-amber-400 font-bold mb-3.5 flex items-center text-xs tracking-wider uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
                    Actionable Insights
                  </h3>
                  <ul className="space-y-3 font-sans">
                    {feedbackSnippets.improvements.slice(0, 3).map((item, i) => (
                      <li key={i} className="flex items-start text-xs leading-relaxed text-slate-400 font-medium">
                        <span className="text-amber-500 font-bold mr-2 text-[14px]">!</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Structured Outage Timeline */}
            <div className={`bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-3xl shadow transition-all duration-500 ${
              feedbackVisible ? 'opacity-100' : 'opacity-0'
            }`}>
              <h2 className="text-lg font-bold mb-5 flex items-center tracking-tight">
                <Clock className="w-5 h-5 mr-2 text-indigo-400" />
                Response Timeline
              </h2>
              
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {interviewState.questions.map((q, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-950/40 rounded-xl border border-white/5">
                    <div>
                      <div className="font-bold text-xs text-slate-200">Q{i + 1}: {q.topic}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs sm:max-w-md mt-0.5">{q.question}</div>
                    </div>
                    <span className="px-2.5 py-1 bg-green-500/10 text-green-400 border border-green-500/25 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                      Assessed
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Sidebar Columns */}
          <div className="space-y-6">
            
            {/* SVG Radar Chart Panel */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-3xl shadow flex flex-col items-center">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 self-start">
                Skill Topology Breakdown
              </h2>
              <RadarChart data={radarData} />
            </div>

            {/* Curated Recommendations */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-3xl shadow">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-indigo-400" />
                Tailored Upskilling Prep
              </h2>
              
              <div className="space-y-2">
                {['Advanced System Design Patterns', 'High Performance Execution Secrets', 'Data Structures Survival Kit'].map((title, i) => (
                  <a 
                    key={i} 
                    href="https://google.com" 
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3 bg-slate-950/40 hover:bg-white/5 rounded-xl border border-white/5 transition-colors group"
                  >
                    <span className="text-xs font-semibold text-slate-300">{title}</span>
                    <Shield className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  </a>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Floating Action Menu */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-3 bg-[#0f0f23]/90 border border-white/10 backdrop-blur-md p-2 rounded-2xl shadow-2xl z-40">
        <button 
          onClick={handleShare}
          className="flex items-center px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
        >
          <Share2 className="w-4 h-4 mr-2 text-indigo-400" />
          Share Results
        </button>
        
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg active:scale-95 transition-all"
        >
          <RefreshCw className="w-4 h-4 mr-2 animate-spin-slow" />
          New Interview
        </button>
      </div>

      {/* Upgrade 8: Hidden Shared Card Template for html2canvas screenshot download */}
      <div 
        ref={shareCardRef}
        style={{ display: 'none' }}
        className="fixed w-[600px] bg-[#0f0f23] border-4 border-indigo-500 p-8 rounded-3xl shadow-2xl text-slate-100 z-[-1000]"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">InterviewAI</h1>
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest mt-0.5">interviewer score report</p>
          </div>
          <div className="bg-indigo-600/90 text-white font-black text-xl px-4 py-2 rounded-2xl shadow">
            GRADE {grade.label}
          </div>
        </div>

        <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase">CANDIDATE</span>
              <p className="text-lg font-bold text-slate-100">{candidateInfo.name || 'Candidate'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase">ROLE</span>
              <p className="text-lg font-bold text-indigo-400">{candidateInfo.role}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-slate-950/40 p-6 rounded-2xl border border-white/5 mb-6">
          <div className="text-center flex-1">
            <span className="text-[9px] text-slate-500 font-bold uppercase block">OVERALL PERFORMANCE</span>
            <span className="text-5xl font-black text-indigo-400 tracking-tighter">{calculatedOverall}%</span>
          </div>
          <div className="w-[1.5px] h-12 bg-white/10 mx-6"></div>
          <div className="flex-1 font-sans">
            <span className="text-[9px] text-slate-500 font-bold uppercase block mb-1">TOP STRENGTHS</span>
            <ul className="space-y-1 text-xs text-slate-300">
              <li>✓ Exceptional clarity and structuring</li>
              <li>✓ Excellent architectural considerations</li>
              <li>✓ Confident communication style</li>
            </ul>
          </div>
        </div>

        <div className="text-center text-[10px] text-slate-600 font-bold uppercase tracking-wider">
          VERIFIED BY INTERVIEWAI COACH • PORTFOLIO DEMO
        </div>
      </div>

    </div>
  );
}
