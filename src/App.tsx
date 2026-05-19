import React from 'react';
import { InterviewProvider, useInterview } from './context/InterviewContext';
import Lobby from './components/Lobby';
import InterviewScreen from './components/InterviewScreen';
import ResultsDashboard from './components/ResultsDashboard';
import PauseModal from './components/PauseModal';
import KeyboardShortcuts from './components/KeyboardShortcuts';

function AppContent() {
  const { currentScreen } = useInterview();

  return (
    <div className="min-h-screen bg-[#090913] text-slate-100 select-none antialiased">
      {currentScreen === 'lobby' && <Lobby />}
      {currentScreen === 'interview' && <InterviewScreen />}
      {currentScreen === 'coding' && <InterviewScreen />}
      
      {/* Paused state renders InterviewScreen behind with PauseModal overlay on top */}
      {currentScreen === 'paused' && (
        <>
          <InterviewScreen />
          <PauseModal />
        </>
      )}
      
      {currentScreen === 'results' && <ResultsDashboard />}
      
      {/* Universal accessibility keyboard shortcuts cue/modal */}
      <KeyboardShortcuts />
    </div>
  );
}

export default function App() {
  return (
    <InterviewProvider>
      <AppContent />
    </InterviewProvider>
  );
}
