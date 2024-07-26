// src/components/Chat.js

import React from 'react';
import Message from './Message';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import Loader from './Loader';
import '../css/Chat.css';

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      isLoading: true,
    };
  }

  setLoading = (isLoading) => {
    this.setState({ isLoading });
  };

  handleSendMessage = (text, image) => {
    const userMessage = new Message(text, 'user', image);
    this.setState((prevState) => ({
      messages: [...prevState.messages, userMessage],
      isLoading: false,
    }));
  };

  handleModelPrediction = (predictionText) => {
    const predictionMessage = new Message(predictionText, 'bot');
    this.setState((prevState) => ({
      messages: [...prevState.messages, predictionMessage],
    }));
  };

  render() {
    return (
      <div className="card">
        <div className="chat-header">
          Chat Application Demo
          <div className="marquee">
            <p className="marquee-text">Note: This is a Demo. Messages will be cleared when the page reloads.</p>
          </div>
          <div className="marquee">
            <p className="marquee-text">UPLOAD A IMAGE</p>
          </div>
        </div>
        <div className="chat-messages">
          <MessageList messages={this.state.messages} />
          {this.state.isLoading && <Loader />}
        </div>
        <ChatInput onSendMessage={this.handleSendMessage} setLoading={this.setLoading} onModelPrediction={this.handleModelPrediction} />
      </div>
    );
  }
}

export default Chat;
