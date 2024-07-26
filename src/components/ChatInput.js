// src/components/ChatInput.js

import React from 'react';

class ChatInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = { input: '' };
    }

    handleChange = (e) => {
        this.setState({ input: e.target.value });
    };

    handleSend = () => {
        if (this.state.input.trim() === '') return;

        this.props.onSendMessage(this.state.input);
        this.setState({ input: '' });
    };

    render() {
        return (
            <div className="chat-input">
                <input
                    type="text"
                    value={this.state.input}
                    onChange={this.handleChange}
                    placeholder="Type a message..."
                />
                <button onClick={this.handleSend}>Send</button>
            </div>
        );
    }
}

export default ChatInput;
