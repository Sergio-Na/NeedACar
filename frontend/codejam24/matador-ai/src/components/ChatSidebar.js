// src/components/ChatSidebar.js
import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DeleteIcon from '@mui/icons-material/Delete';
import './ChatSidebar.css';

const ChatSidebar = ({
  conversations,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  currentConversationId,
  isOpen,
  onToggleSidebar,
}) => {
  return (
    <div className={`chat-sidebar ${isOpen ? '' : 'collapsed'}`}>
      <div className="sidebar-header">
        <IconButton onClick={onToggleSidebar} className="toggle-button" aria-label="Toggle Sidebar">
          <MenuIcon />
        </IconButton>
        {isOpen && <h2 className="sidebar-title">Conversations</h2>}
      </div>
      {isOpen ? (
        <>
          {/* New Chat Button */}
          <Button
            variant="contained"
            onClick={onNewConversation}
            className="new-chat-button"
            aria-label="Start New Chat"
          >
            + New Chat
          </Button>
          <List>
            {conversations.map((conv) => (
              <ListItem
                button
                key={conv.id}
                selected={conv.id === currentConversationId}
                className={`sidebar-item ${
                  conv.id === currentConversationId ? 'active' : ''
                }`}
                onClick={() => onSelectConversation(conv.id)}
                aria-label={`Conversation on ${new Date(conv.lastUpdated).toLocaleDateString('en-CA')}`}
              >
                <ListItemText
                  primary={
                    <div className="sidebar-item-text">
                      {new Date(conv.lastUpdated).toLocaleDateString('en-CA')}
                    </div>
                  }
                />
                <IconButton
                  edge="end"
                  aria-label="delete"
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </>
      ) : (
        <List>
          {conversations.map((conv) => (
            <Tooltip title={new Date(conv.lastUpdated).toLocaleDateString('en-CA')} placement="right" key={conv.id}>
              <ListItem
                button
                className={`sidebar-item ${
                  conv.id === currentConversationId ? 'active' : ''
                }`}
                onClick={() => onSelectConversation(conv.id)}
                aria-label={`Conversation on ${new Date(conv.lastUpdated).toLocaleDateString('en-CA')}`}
              >
                {/* Display the first character of the date as a placeholder */}
                <div className="sidebar-item-text">
                  {new Date(conv.lastUpdated).toLocaleDateString('en-CA').charAt(0)}
                </div>
              </ListItem>
            </Tooltip>
          ))}
        </List>
      )}
    </div>
  );
};

export default ChatSidebar;
