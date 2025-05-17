// src/components/ChatWindow.jsx
import React from "react";

const ChatWindow = ({ messages }) => {
  return (
    <div className="chat-window">
      {messages.map((msg) => (
        <div key={msg.id} className={`message ${msg.author}`}>
          <div className="author">{msg.author}:</div>
          <div className="text">{msg.text}</div>
        </div>
      ))}
    </div>
  );
};

export default ChatWindow;
