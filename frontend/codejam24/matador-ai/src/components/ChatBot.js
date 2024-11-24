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
      const botReply = {
        sender: 'bot',
        text: response.data.response,
        cars: [
          {
            "Type": "Used",
            "Stock": "T237890",
            "VIN": "A9FGFF8ST43CEFJ3Y",
            "Year": 2019,
            "Make": "Mazda",
            "Model": "CX-9",
            "Body": "Sport Utility",
            "ModelNumber": "MACX-VF899A",
            "Doors": 4,
            "ExteriorColor": "Snowflake White Pearl Mica",
            "InteriorColor": "Auburn",
            "EngineCylinders": 4,
            "EngineDisplacement": "2.5 L",
            "Transmission": "Automatic",
            "Miles": 60081,
            "SellingPrice": 18498,
            "MSRP": 0,
            "BookValue": 18498,
            "Invoice": 0,
            "Certified": "False",
            "Style_Description": "Signature AWD",
            "Ext_Color_Generic": "White",
            "Ext_Color_Code": "25D",
            "Int_Color_Generic": "",
            "Int_Color_Code": "TC5",
            "Int_Upholstery": "{feature",
            "Engine_Block_Type": "I",
            "Engine_Aspiration_Type": "Gasoline Direct Injection",
            "Engine_Description": "Intercooled Turbo Regular Unleaded I-4 2.5 L/152",
            "Transmission_Speed": 6,
            "Transmission_Description": "6-Speed Automatic w/OD",
            "Drivetrain": "AWD",
            "Fuel_Type": "Gasoline Fuel",
            "CityMPG": 20,
            "HighwayMPG": 26,
            "EPAClassification": "Small SUV 4WD",
            "Wheelbase_Code": 115.3,
            "Internet_Price": 0,
            "MarketClass": "4WD Sport Utility Vehicles",
            "PassengerCapacity": 7,
            "ExtColorHexCode": "E7E8E8",
            "IntColorHexCode": "",
            "EngineDisplacementCubicInches": 152
          },
          {
            "Type": "Used",
            "Stock": "C120321",
            "VIN": "3RCKVP1GRJK1F6A8A",
            "Year": 2024,
            "Make": "Maserati",
            "Model": "Levante",
            "Body": "Sport Utility",
            "ModelNumber": "MALE-SN743K",
            "Doors": 4,
            "ExteriorColor": "Bianco",
            "InteriorColor": "Black",
            "EngineCylinders": 6,
            "EngineDisplacement": "3.0 L",
            "Transmission": "Automatic",
            "Miles": 75,
            "SellingPrice": 86998,
            "MSRP": 0,
            "BookValue": 86998,
            "Invoice": 0,
            "Certified": "False",
            "Style_Description": "Modena Ultima AWD",
            "Ext_Color_Generic": "",
            "Ext_Color_Code": "",
            "Int_Color_Generic": "Black",
            "Int_Color_Code": "",
            "Int_Upholstery": "{feature",
            "Engine_Block_Type": "V",
            "Engine_Aspiration_Type": "Gasoline Direct Injection",
            "Engine_Description": "Twin Turbo Premium Unleaded V-6 3.0 L/182",
            "Transmission_Speed": 8,
            "Transmission_Description": "8-Speed Automatic w/OD",
            "Drivetrain": "AWD",
            "Fuel_Type": "Gasoline Fuel",
            "CityMPG": 16,
            "HighwayMPG": 22,
            "EPAClassification": "Standard SUV 4WD",
            "Wheelbase_Code": 118.3,
            "Internet_Price": 0,
            "MarketClass": "4WD Sport Utility Vehicles",
            "PassengerCapacity": 5,
            "ExtColorHexCode": "",
            "IntColorHexCode": "",
            "EngineDisplacementCubicInches": 182
          },
          {
            "Type": "Used",
            "Stock": "K666069",
            "VIN": "1W2XUCYU7BR72MDJR",
            "Year": 2019,
            "Make": "Volkswagen",
            "Model": "Tiguan",
            "Body": "Sport Utility",
            "ModelNumber": "VOTI-UG651L",
            "Doors": 4,
            "ExteriorColor": "Platinum Gray Metallic",
            "InteriorColor": "Gray",
            "EngineCylinders": 4,
            "EngineDisplacement": "2.0 L",
            "Transmission": "Automatic",
            "Miles": 72266,
            "SellingPrice": 14498,
            "MSRP": 0,
            "BookValue": 14498,
            "Invoice": 0,
            "Certified": "False",
            "Style_Description": "2.0T SE FWD",
            "Ext_Color_Generic": "Gray",
            "Ext_Color_Code": "",
            "Int_Color_Generic": "Gray",
            "Int_Color_Code": "",
            "Int_Upholstery": "{feature",
            "Engine_Block_Type": "I",
            "Engine_Aspiration_Type": "Gasoline Direct Injection",
            "Engine_Description": "Intercooled Turbo Regular Unleaded I-4 2.0 L/121",
            "Transmission_Speed": 8,
            "Transmission_Description": "8-Speed Automatic w/OD",
            "Drivetrain": "FWD",
            "Fuel_Type": "Gasoline Fuel",
            "CityMPG": 22,
            "HighwayMPG": 29,
            "EPAClassification": "Small SUV 2WD",
            "Wheelbase_Code": 109.8,
            "Internet_Price": 0,
            "MarketClass": "2WD Sport Utility Vehicles",
            "PassengerCapacity": 7,
            "ExtColorHexCode": "",
            "IntColorHexCode": "",
            "EngineDisplacementCubicInches": 121
          }
        ]
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

  const handleNewConversation = () => {
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

  const handleDeleteConversation = (id) => {
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
