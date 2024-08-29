// src/components/MessageList.js

import React from 'react';

class MessageList extends React.Component {
    render() {
        return (
            <div className="chat-messages">
                {this.props.messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.sender}`}>
                        <div className="message-icon">
                            {msg.sender === 'user' ? '👨🏾' : '🤖'}
                        </div>
                        <div className="message-content">
                            {msg.image && <img src={msg.image} alt="uploaded" className="message-image" />}
                            <div className="message-text">{msg.text}</div>
                            <div className="message-time">{msg.getFormattedTime()}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
}

export default MessageList;
