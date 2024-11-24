// src/components/ChatMessages.js
import React from 'react';
import ChatBubble from './ChatBubble';
import CarCarousel from './CarCarousel';
import './ChatMessages.css';

const ChatMessages = ({ messages }) => (
  <div className="chat-messages">
    {messages.map((msg, index) => {
      console.log(msg, msg.sender, msg.text, msg.image, msg.actions, msg.cars)
      return (<ChatBubble
        key={index}
        sender={msg.sender}
        text={msg.text}
        image={msg.image}
        actions={msg.actions}
        cars={msg.cars}
      />
      )
    })}
  </div>
);

export default ChatMessages;
