import { useState, useEffect, useCallback, useRef } from 'react';

// Create a global array to prevent GC of active utterances (Chrome bug)
if (typeof window !== 'undefined') {
  (window as any)._activeUtterances = (window as any)._activeUtterances || [];
}

export default function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      // Remove any active utterances
      (window as any)._activeUtterances = [];
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((
    text: string, 
    onStart?: () => void, 
    onEnd?: () => void
  ) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not supported in this environment');
      if (onEnd) onEnd();
      return;
    }

    // Chrome Bug Fix: Always call resume() before speak() in case the engine is left paused
    try {
      window.speechSynthesis.resume();
    } catch (e) {
      console.warn('speechSynthesis resume failed:', e);
    }

    // Cancel active synthesis safely (avoiding Chrome lockup by only cancelling if speaking, and using a clean, delayed queue trigger)
    let wasSpeaking = false;
    if (window.speechSynthesis.speaking) {
      wasSpeaking = true;
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('speechSynthesis cancel failed:', e);
      }
    }
    (window as any)._activeUtterances = [];

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Retain in global window array to prevent Chrome garbage collection
    (window as any)._activeUtterances.push(utterance);

    // Voice Selection Preferences
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = null;
    
    // Choose clear natural female voices first
    const preferences = ['Google UK English Female', 'Samantha', 'Microsoft Zira', 'Karen', 'Tessa', 'Moira'];
    
    for (const pref of preferences) {
      const match = voices.find(v => v.name.includes(pref));
      if (match) {
        selectedVoice = match;
        break;
      }
    }

    if (!selectedVoice) {
      selectedVoice = voices.find(v => 
        (v.lang.startsWith('en') || v.lang.startsWith('EN')) && 
        v.name.toLowerCase().includes('female')
      ) || null;
    }

    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      // Already handled synchronously inside speak() to prevent state gaps,
      // but maintained as a backup safeguard.
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      // Remove from global retention list
      const index = (window as any)._activeUtterances.indexOf(utterance);
      if (index > -1) {
        (window as any)._activeUtterances.splice(index, 1);
      }
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis utterance error:', event);
      const index = (window as any)._activeUtterances.indexOf(utterance);
      if (index > -1) {
        (window as any)._activeUtterances.splice(index, 1);
      }
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };

    // Set speaking state and call callback synchronously to prevent transient state gaps
    setIsSpeaking(true);
    if (onStart) onStart();

    if (wasSpeaking) {
      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn('Delayed speech speak failed:', e);
          setIsSpeaking(false);
          if (onEnd) onEnd();
        }
      }, 100);
    } else {
      try {
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('speechSynthesis.speak failed:', e);
        setIsSpeaking(false);
        if (onEnd) onEnd();
      }
    }
  }, []);

  // Handle voices changing asynchronously (Chrome/Safari voice cache update)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      window.speechSynthesis.getVoices();
      return () => {
        window.speechSynthesis?.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);

  // Cleanup synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        (window as any)._activeUtterances = [];
      }
    };
  }, []);

  return { speak, stopSpeaking, isSpeaking };
}
