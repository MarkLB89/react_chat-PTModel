// src/components/Chat.js

import React, { useState } from 'react';
import axios from 'axios';
import '../css/Chat.css'; // Ensure this path is correct

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (input.trim() === '') return;

    const newMessage = { text: input, sender: 'user' };
    setMessages([...messages, newMessage]);
    setInput('');

    // Send message to pretrained model API
    try {
      const response = await axios.post('YOUR_PRETRAINED_MODEL_API_ENDPOINT', {
        message: input,
      });
      const botMessage = { text: response.data.response, sender: 'bot' };
      setMessages([...messages, newMessage, botMessage]);
    } catch (error) {
      console.error('Error communicating with the pretrained model API:', error);
    }
  };

  return (
    <div className="card">
      <div className="chat-header">
        Chat Application
      </div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
