import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechResultList;
}

interface SpeechResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export default function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  
  // Keep track of the user's intent to be listening (prevents Chrome auto-timeout)
  const shouldBeListeningRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition() as SpeechRecognitionInstance;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      // Only set to false if the user or auto-system actually intended to stop.
      // If we intended to keep listening, we keep isListening as true to prevent UI flickering.
      if (!shouldBeListeningRef.current) {
        setIsListening(false);
      }
      
      // Auto-restart Keep Alive if user intended to be listening
      if (shouldBeListeningRef.current) {
        setTimeout(() => {
          if (shouldBeListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              // ignore overlap starts
            }
          }
        }, 150);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn('Speech Recognition Error caught:', event.error);
      
      // Ignore silent timeouts, just let onend restart the listener loop
      if (event.error === 'no-speech') {
        return;
      }
      
      setIsListening(false);
      shouldBeListeningRef.current = false; // Stop trying to listen on actual errors
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalSpeech = '';
      let interimSpeech = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result.isFinal) {
          finalSpeech += result[0].transcript;
        } else {
          interimSpeech += result[0].transcript;
        }
      }

      if (finalSpeech) {
        setTranscript(prev => prev + ' ' + finalSpeech.trim());
      }
      setInterimTranscript(interimSpeech);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;
    setInterimTranscript('');
    shouldBeListeningRef.current = true;
    setIsListening(true); // Synchronously set to true to prevent latency
    try {
      recognitionRef.current.start();
    } catch (e) {
      // already active, ignore
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) return;
    shouldBeListeningRef.current = false;
    setIsListening(false); // Synchronously set to false to respond instantly
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.warn('SpeechRecognition stop failed:', e);
    }
  }, [isSupported]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    clearTranscript
  };
}
