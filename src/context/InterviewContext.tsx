import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { questions, Question } from '../data/questions';

export type ScreenType = 'lobby' | 'interview' | 'coding' | 'paused' | 'results';
export type TabType = 'Answer' | 'Code Editor' | 'Whiteboard';

export interface CandidateInfo {
  name: string;
  email: string;
  role: string;
  difficulty: string;
  type: string;
  skills: string;
  resumeName?: string;
}

export interface AnswerRecord {
  questionId: string;
  text?: string;
  code?: string;
  timeTaken: number;
  score: number;
}

export interface TranscriptItem {
  speaker: 'AI' | 'Candidate';
  text: string;
  timestamp: Date;
}

export interface PastInterview {
  date: string;
  role: string;
  score: number;
  candidateName: string;
}

export interface InterviewState {
  questions: Question[];
  currentQIndex: number;
  answers: Record<string, AnswerRecord>;
  timeElapsed: number; // overall time in seconds
  questionTimeElapsed: number; // active question timer in seconds
  scores: {
    technical: number;
    communication: number;
    problemSolving: number;
    codeQuality: number;
    overall: number;
  };
  transcript: TranscriptItem[];
  answerDraft: string;
}

export interface UIState {
  isMuted: boolean;
  isCameraOff: boolean;
  isTranscriptOpen: boolean;
  activeTab: TabType;
  isAIThinking: boolean;
  isAISpeaking: boolean;
  isSpeakerMuted: boolean;
}

interface InterviewContextType {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  candidateInfo: CandidateInfo;
  setCandidateInfo: (info: CandidateInfo) => void;
  interviewState: InterviewState;
  setInterviewState: React.Dispatch<React.SetStateAction<InterviewState>>;
  uiState: UIState;
  setUIState: React.Dispatch<React.SetStateAction<UIState>>;
  pastInterviews: PastInterview[];
  
  // Helpers
  startInterview: () => void;
  nextQuestion: () => void;
  submitAnswer: (questionId: string, answer: Partial<AnswerRecord>) => void;
  addTranscript: (speaker: 'AI' | 'Candidate', text: string) => void;
  currentQuestion: Question | null;
  toggleSpeakerMute: () => void;
}

const defaultCandidate: CandidateInfo = {
  name: '',
  email: '',
  role: 'Frontend Dev',
  difficulty: 'Mid',
  type: 'Mixed',
  skills: '',
  resumeName: ''
};

const defaultInterviewState = (initialQuestions: Question[] = []): InterviewState => ({
  questions: initialQuestions,
  currentQIndex: 0,
  answers: {},
  timeElapsed: 0,
  questionTimeElapsed: 0,
  scores: {
    technical: 0,
    communication: 0,
    problemSolving: 0,
    codeQuality: 0,
    overall: 0
  },
  transcript: [],
  answerDraft: ''
});

const defaultUIState: UIState = {
  isMuted: false,
  isCameraOff: false,
  isTranscriptOpen: false,
  activeTab: 'Answer',
  isAIThinking: false,
  isAISpeaking: false,
  isSpeakerMuted: false
};

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export const InterviewProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('lobby');
  const [candidateInfo, setCandidateInfo] = useState<CandidateInfo>(defaultCandidate);
  const [interviewState, setInterviewState] = useState<InterviewState>(() => defaultInterviewState([]));
  const [uiState, setUIState] = useState<UIState>(defaultUIState);
  const [pastInterviews, setPastInterviews] = useState<PastInterview[]>([]);

  // Load persistence from localStorage on mount
  useEffect(() => {
    const savedCandidate = localStorage.getItem('interview_candidate_info');
    if (savedCandidate) {
      try {
        setCandidateInfo(JSON.parse(savedCandidate));
      } catch (e) {
        console.error(e);
      }
    }

    const savedSpeakerMute = localStorage.getItem('interview_speaker_muted');
    if (savedSpeakerMute) {
      setUIState(prev => ({ ...prev, isSpeakerMuted: savedSpeakerMute === 'true' }));
    }

    const savedPast = localStorage.getItem('interview_past_results');
    if (savedPast) {
      try {
        setPastInterviews(JSON.parse(savedPast));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Persist candidateInfo updates
  useEffect(() => {
    if (candidateInfo.name) {
      localStorage.setItem('interview_candidate_info', JSON.stringify(candidateInfo));
    }
  }, [candidateInfo]);

  // Global + Question active timers
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (currentScreen === 'interview' || currentScreen === 'coding') {
      timer = setInterval(() => {
        setInterviewState(prev => {
          const newTimeElapsed = prev.timeElapsed + 1;
          const newQuestionTimeElapsed = prev.questionTimeElapsed + 1;
          const currentQ = prev.questions[prev.currentQIndex];

          // Upgrade: automatic submission when question time limit runs out
          if (currentQ?.timeLimit && newQuestionTimeElapsed >= currentQ.timeLimit) {
            setTimeout(() => {
              const submitBtn = document.querySelector('[data-testid="submit-answer-btn"]') as HTMLButtonElement;
              if (submitBtn) {
                submitBtn.click();
              }
            }, 0);

            return {
              ...prev,
              timeElapsed: newTimeElapsed,
              questionTimeElapsed: 0 // reset
            };
          }

          return {
            ...prev,
            timeElapsed: newTimeElapsed,
            questionTimeElapsed: newQuestionTimeElapsed
          };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentScreen]);

  const currentQuestion = interviewState.questions[interviewState.currentQIndex] || null;

  // Filter and populate questions on starting the interview
  const startInterview = () => {
    const roleQuestions = questions.filter(q => q.role === candidateInfo.role);
    const selected = roleQuestions.length > 0 ? roleQuestions.slice(0, 5) : questions.slice(0, 5);
    
    setInterviewState(defaultInterviewState(selected));
    setCurrentScreen('interview');
  };

  const nextQuestion = () => {
    if (interviewState.currentQIndex < interviewState.questions.length - 1) {
      setInterviewState(prev => ({
        ...prev,
        currentQIndex: prev.currentQIndex + 1,
        questionTimeElapsed: 0, // Reset question timer
        answerDraft: ''
      }));
    } else {
      // Save results to history
      const finalScore = Math.floor(Math.random() * 20) + 75; // Mock overall score
      const newPast: PastInterview = {
        date: new Date().toLocaleDateString(),
        role: candidateInfo.role,
        score: finalScore,
        candidateName: candidateInfo.name
      };
      
      const updatedPast = [newPast, ...pastInterviews];
      setPastInterviews(updatedPast);
      localStorage.setItem('interview_past_results', JSON.stringify(updatedPast));
      setCurrentScreen('results');
    }
  };

  const submitAnswer = (questionId: string, answer: Partial<AnswerRecord>) => {
    const textAnswer = answer.text || '';
    const currentQ = interviewState.questions.find(q => q.id === questionId);
    
    // Evaluate keyword matching
    let keywordMatches = 0;
    if (currentQ?.keywords) {
      currentQ.keywords.forEach(kw => {
        if (textAnswer.toLowerCase().includes(kw.toLowerCase())) {
          keywordMatches++;
        }
      });
    }

    const calculatedScore = Math.min(
      100,
      Math.max(60, 75 + keywordMatches * 5 + (Math.random() * 10 - 5))
    );

    // Update answers
    setInterviewState(prev => {
      const updatedAnswers = {
        ...prev.answers,
        [questionId]: {
          questionId,
          timeTaken: prev.questionTimeElapsed || 30,
          score: Math.round(calculatedScore),
          text: answer.text,
          code: answer.code
        }
      };

      // Trigger follow-ups if keywords matched
      let updatedQuestions = [...prev.questions];
      if (currentQ && currentQ.followUps && currentQ.followUps.length > 0 && keywordMatches > 0) {
        const followUpText = currentQ.followUps[0];
        const comments = [
          "Interesting approach!",
          "Good thinking.",
          "That's a solid foundation.",
          "Let's dig deeper.",
          "I like that answer."
        ];
        const randomComment = comments[Math.floor(Math.random() * comments.length)];

        const followUpQ: Question = {
          id: `${questionId}-followup`,
          type: 'Technical',
          topic: `${currentQ.topic} Follow-up`,
          difficulty: currentQ.difficulty,
          role: currentQ.role,
          timeLimit: 120,
          question: followUpText,
          ariaComment: randomComment,
          hints: ["Consider elaborating further on your logic."],
          keywords: [],
          followUps: []
        };

        const followUpExists = updatedQuestions.some(q => q.id === followUpQ.id);
        if (!followUpExists) {
          updatedQuestions.splice(prev.currentQIndex + 1, 0, followUpQ);
        }
      }

      return {
        ...prev,
        answers: updatedAnswers,
        questions: updatedQuestions
      };
    });
  };

  const addTranscript = (speaker: 'AI' | 'Candidate', text: string) => {
    setInterviewState(prev => ({
      ...prev,
      transcript: [...prev.transcript, { speaker, text, timestamp: new Date() }]
    }));
  };

  const toggleSpeakerMute = () => {
    setUIState(prev => {
      const newState = !prev.isSpeakerMuted;
      localStorage.setItem('interview_speaker_muted', String(newState));
      return { ...prev, isSpeakerMuted: newState };
    });
  };

  return (
    <InterviewContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        candidateInfo,
        setCandidateInfo,
        interviewState,
        setInterviewState,
        uiState,
        setUIState,
        pastInterviews,
        startInterview,
        nextQuestion,
        submitAnswer,
        addTranscript,
        currentQuestion,
        toggleSpeakerMute
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (context === undefined) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};
