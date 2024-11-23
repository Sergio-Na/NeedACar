// src/components/ChatBubble.js
import React from 'react';
import { Card } from '@mui/material';
import Markdown from 'markdown-to-jsx';
import './ChatBubble.css';
import botAvatar from '../components/download.png'; // Ensure botAvatar.png is in src/assets/

const ChatBubble = ({ sender, text, image, actions }) => {
  const handleActionClick = (action) => {
    // Implement action handling logic here
    console.log(`Action clicked: ${action.type}`);
    // Expand this function based on your action requirements
  };

  const isUser = sender === 'user';
  const messageClass = isUser ? 'user-container' : 'bot-container';

  return (
    <div className={`chat-bubble-container ${messageClass}`}>
      {!isUser && (
        <img src={botAvatar} alt="Bot Avatar" className="avatar" />
      )}
      <Card
        className={`chat-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}
        elevation={4}
      >
        {text && (
          <div className="chat-text">
            <Markdown>{text}</Markdown>
          </div>
        )}
        {image && <img src={image} alt="Content" className="chat-image" />}
        {actions &&
          actions.map((action, index) => (
            <button
              key={index}
              className="action-button"
              onClick={() => handleActionClick(action)}
            >
              {action.label}
            </button>
          ))}
      </Card>
    </div>
  );
};

export default ChatBubble;
