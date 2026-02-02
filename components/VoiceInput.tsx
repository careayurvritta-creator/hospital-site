import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  className?: string;
  isCompact?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, className = "", isCompact = false }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US'; // Default to English, could be dynamic based on context

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onTranscript(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } else {
        setIsSupported(false);
      }
    }
  }, [onTranscript]);

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission if inside form
    if (!isSupported) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={toggleListening}
      type="button"
      className={`relative transition-all duration-300 flex items-center justify-center ${
        isListening 
          ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
          : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
      } border rounded-full ${isCompact ? 'p-2' : 'p-3'} ${className}`}
      title={isListening ? "Stop Listening" : "Start Voice Input"}
    >
      {isListening ? <MicOff size={isCompact ? 16 : 20} /> : <Mic size={isCompact ? 16 : 20} />}
      
      {/* Ripple Effect when listening */}
      {isListening && (
        <span className="absolute inset-0 rounded-full border-2 border-red-400 opacity-75 animate-ping"></span>
      )}
    </button>
  );
};

export default VoiceInput;