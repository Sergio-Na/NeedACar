// src/components/ChatInput.js
import React from 'react';
import './ChatInput.css';
import SendIcon from '@mui/icons-material/Send';

const ChatInput = ({ value, onChange, onSend }) => {
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
        placeholder="Type your message..."
        className="chat-input"
        onKeyPress={handleKeyPress}
        aria-label="Type your message"
      />
      <button onClick={onSend} className="send-button" aria-label="Send Message">
        <SendIcon />
      </button>
    </div>
  );
};

export default ChatInput;
