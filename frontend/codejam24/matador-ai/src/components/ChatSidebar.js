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
  // Utility function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  };

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
            {conversations.map((conv) => {
              // Extract the title or fallback to a default
              const conversationTitle = truncateText(conv.title || 'New Conversation', 30);

              return (
                <ListItem
                  button
                  key={conv.id}
                  selected={conv.id === currentConversationId}
                  className={`sidebar-item ${
                    conv.id === currentConversationId ? 'active' : ''
                  }`}
                  onClick={() => onSelectConversation(conv.id)}
                  aria-label={`Conversation: ${conv.title || 'New Conversation'}`}
                >
                  <ListItemText
                    primary={
                      <div className="sidebar-item-text" title={conv.title || 'New Conversation'}>
                        {conversationTitle}
                      </div>
                    }
                  />
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    className="delete-button"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the conversation select
                      onDeleteConversation(conv.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              );
            })}
          </List>
        </>
      ) : (
        <List>
          {conversations.map((conv) => {
            // Extract the first character of the title for collapsed view
            const firstChar = conv.title ? conv.title.charAt(0).toUpperCase() : 'C';

            return (
              <Tooltip
                key={conv.id}
                title={conv.title || 'New Conversation'}
                placement="right"
                arrow
              >
                <ListItem
                  button
                  className={`sidebar-item ${
                    conv.id === currentConversationId ? 'active' : ''
                  }`}
                  onClick={() => onSelectConversation(conv.id)}
                  aria-label={`Conversation: ${conv.title || 'New Conversation'}`}
                >
                  {/* Display the first character as a placeholder */}
                  <div className="sidebar-item-text">
                    {firstChar}
                  </div>
                </ListItem>
              </Tooltip>
            );
          })}
        </List>
      )}
    </div>
  );
};

export default ChatSidebar;
