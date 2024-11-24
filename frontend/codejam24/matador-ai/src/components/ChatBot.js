// src/components/ChatBot.js
import React, { useState, useEffect } from 'react';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ChatSidebar from './ChatSidebar';
import { Card } from '@mui/material';
import './ChatBot.css';
import logo from '../components/logo.png'; // Ensure logo.png is in src/assets/
import axios from 'axios';

const ChatBot = () => {
  const [conversations, setConversations] = useState(() => {
    const savedConversations = localStorage.getItem('conversations');
    return savedConversations
      ? JSON.parse(savedConversations)
      : [
        {
          id: Date.now(),
          title: 'New Conversation',
          lastUpdated: new Date().toISOString(),
          messages: [
            { sender: 'bot', text: 'Hello! How can I assist you today?', cars: [] },
          ],
        },
      ];
  });

  const [currentConversationId, setCurrentConversationId] = useState(() => {
    const savedCurrentId = localStorage.getItem('currentConversationId');
    return savedCurrentId ? Number(savedCurrentId) : conversations[0].id;
  });

  const [userMessage, setUserMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('currentConversationId', currentConversationId);
  }, [currentConversationId]);

  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );

  const handleSendMessage = () => {
    if (userMessage.trim() !== '') {
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          if (conv.id === currentConversationId) {
            const isFirstUserMessage = conv.messages.filter(
              (msg) => msg.sender === 'user'
            ).length === 0;
            const updatedConv = {
              ...conv,
              messages: [...conv.messages, { sender: 'user', text: userMessage, cars: [] }],
              lastUpdated: new Date().toISOString(),
            };
            if (isFirstUserMessage) {
              updatedConv.title =
                userMessage.length > 50
                  ? userMessage.substring(0, 47) + '...'
                  : userMessage;
            }
            return updatedConv;
          }
          return conv;
        });
      });
      const message = userMessage;
      setUserMessage('');
      sendMessageToBackend(message);
    }
  };

  const sendMessageToBackend = async (message) => {
    try {
      const response = await axios.post('http://localhost:8000/api/chat', {
        message: message,
      });
      console.log('the response is', response)
      const botReply = {
        sender: 'bot',
        text: response.data.response,
        cars: response.data.metadata ?? []
      };
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          if (conv.id === currentConversationId) {
            const updatedConv = {
              ...conv,
              messages: [...conv.messages, botReply],
              lastUpdated: new Date().toISOString(),
            };
            return updatedConv;
          }
          return conv;
        });
      });
    } catch (error) {
      console.error('Error communicating with backend:', error);
      const botReply = {
        sender: 'bot',
        text: 'Sorry, something went wrong.',
        cars: [],
      };
      setConversations((prevConversations) => {
        return prevConversations.map((conv) => {
          if (conv.id === currentConversationId) {
            const updatedConv = {
              ...conv,
              messages: [...conv.messages, botReply],
              lastUpdated: new Date().toISOString(),
            };
            return updatedConv;
          }
          return conv;
        });
      });
    }
  };

  const handleSelectConversation = (id) => {
    setCurrentConversationId(id);
  };

  const handleNewConversation = async () => {
    await axios.delete('http://localhost:8000/api/chat')
    const newConv = {
      id: Date.now(),
      title: 'New Conversation',
      lastUpdated: new Date().toISOString(),
      messages: [
        { sender: 'bot', text: 'Hello! How can I assist you today?', cars: [] },
      ],
    };
    setConversations((prevConversations) => [newConv, ...prevConversations]);
    setCurrentConversationId(newConv.id);
  };

  const handleDeleteConversation = async (id) => {
    await axios.delete('http://localhost:8000/api/chat')
    const confirmed = window.confirm(
      'Are you sure you want to delete this conversation?'
    );
    if (!confirmed) return;

    setConversations((prevConversations) => {
      const updatedConversations = prevConversations.filter(
        (conv) => conv.id !== id
      );

      if (id === currentConversationId) {
        if (updatedConversations.length > 0) {
          setCurrentConversationId(updatedConversations[0].id);
        } else {
          const newConv = {
            id: Date.now(),
            title: 'New Conversation',
            lastUpdated: new Date().toISOString(),
            messages: [
              { sender: 'bot', text: 'Hello! How can I assist you today?', cars: [] },
            ],
          };
          updatedConversations.push(newConv);
          setCurrentConversationId(newConv.id);
        }
      }

      return updatedConversations;
    });
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  console.log('conversations', conversations)

  return (
    <div className={`chatbot-container ${isSidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <ChatSidebar
        conversations={conversations}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        currentConversationId={currentConversationId}
        isOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
      />
      <Card className="chatbot-main" elevation={6}>
        <div className="chatbot-header">
          <div className="logo-wrapper">
            <img src={logo} alt="Logo" className="header-logo glow-effect" />
          </div>
        </div>
        <div className="chat-header-bar">
          <h2 className="chat-title">
            {currentConversation?.title || 'New Conversation'}
          </h2>
        </div>
        <div className="chatbot-messages-container">
          <ChatMessages messages={currentConversation?.messages || []} />
        </div>
        <ChatInput
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onSend={handleSendMessage}
        />
      </Card>
    </div>
  );
};

export default ChatBot;
