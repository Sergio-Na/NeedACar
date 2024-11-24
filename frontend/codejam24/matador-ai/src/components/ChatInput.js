import React, { useState, useRef } from 'react';
import './ChatInput.css';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';

const ChatInput = ({ value, onChange, onSend }) => {
  const [isListening, setIsListening] = useState(false); // State for managing mic status
  const recognitionRef = useRef(null); // Ref for SpeechRecognition instance

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('Speech Recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      console.log('stopping')
      recognitionRef.current?.stop(); // Stop recording
      setIsListening(false);
      return;
    }

    // Initialize recognition instance
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false; // End automatically after speaking stops

    recognition.onresult = (event) => {
      console.log(event)
      const transcript = event.results[0][0].transcript.trim();
      onChange({ target: { value: transcript } }); // Update the input field with the transcript
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = (event) => {
      console.log(event)
      console.log('Speech recognition ended.');
      setIsListening(false);
    };

    recognitionRef.current = recognition; // Store recognition instance in ref
    recognition.start(); // Start recording
    setIsListening(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSend();
    }
  };

  return (
    <div className="chat-input-container">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Type your message or use the mic..."
        className="chat-input"
        onKeyPress={handleKeyPress}
        aria-label="Chat Input"
      />
      <button
        onClick={toggleSpeechRecognition}
        className={`mic-button ${isListening ? 'active' : ''}`}
        aria-label={isListening ? 'Stop Recording' : 'Start Speaking'}
      >
        {isListening ? <StopIcon /> : <MicIcon />}
      </button>
      <button
        onClick={onSend}
        className="send-button"
        aria-label="Send Message"
      >
        <SendIcon />
      </button>
    </div>
  );
};

export default ChatInput;
