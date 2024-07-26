// src/components/Chat.js

import React from 'react';
import Message from './Message';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ChatService from '../services/ChatService';
import '../css/Chat.css';

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = { messages: [] };
    this.chatService = new ChatService();
  }

  handleSendMessage = async (text) => {
    const userMessage = new Message(text, 'user');
    this.setState((prevState) => ({
      messages: [...prevState.messages, userMessage]
    }));

    try {
      const botResponseText = await this.chatService.sendMessage(text);
      const botMessage = new Message(botResponseText, 'bot');
      this.setState((prevState) => ({
        messages: [...prevState.messages, botMessage]
      }));
    } catch (error) {
      const errorMessage = new Message("Sorry, something went wrong.", 'bot');
      this.setState((prevState) => ({
        messages: [...prevState.messages, errorMessage]
      }));
    }
  };

  render() {
    return (
      <div className="card">
        <div className="chat-header">Chat Application</div>
        <MessageList messages={this.state.messages} />
        <ChatInput onSendMessage={this.handleSendMessage} />
      </div>
    );
  }
}

export default Chat;
