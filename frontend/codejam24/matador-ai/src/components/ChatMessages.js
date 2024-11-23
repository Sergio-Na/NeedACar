// src/components/ChatMessages.js
import React from 'react';
import ChatBubble from './ChatBubble';
import './ChatMessages.css';

const ChatMessages = ({ messages }) => (
  <div className="chat-messages">
    {messages.map((msg, index) => (
      <ChatBubble
        key={index}
        sender={msg.sender}
        text={msg.text}
        image={msg.image}
        actions={msg.actions}
      />
    ))}
  </div>
);

export default ChatMessages;
