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
            typingMessage: null,
        };
    }

    setLoading = (isLoading) => {
        this.setState({ isLoading });
    };

    handleSendMessage = async (text, image) => {
        const userMessage = new Message(text, 'user', image);
        this.setState((prevState) => ({
            messages: [...prevState.messages, userMessage],
            isLoading: false,
        }));
    };

    handleModelPrediction = (predictionText) => {
        this.setState({ typingMessage: predictionText });
        this.typingEffect(predictionText, () => {
            const predictionMessage = new Message(predictionText, 'bot');
            this.setState((prevState) => ({
                messages: [...prevState.messages, predictionMessage],
                typingMessage: null,
            }));
        });
    };

    typingEffect = (text, callback, speed = 50) => {
        let index = 0;
        const typingInterval = setInterval(() => {
            if (index < text.length) {
                this.setState({ typingMessage: text.slice(0, index + 1) });
                index++;
            } else {
                clearInterval(typingInterval);
                callback();
            }
        }, speed);
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
                        <p className="marquee-text">Choose a Topic then ask a question</p>
                    </div>
                </div>
                <div className="chat-messages">
                    <MessageList messages={this.state.messages} />
                    {this.state.isLoading && <Loader />}
                    {this.state.typingMessage && (
                        <div className="chat-message bot">
                            <div className="message-icon">🤖</div>
                            <div className="message-content">
                                <div className="message-text">{this.state.typingMessage}</div>
                                <div className="message-time">{new Date().toLocaleString()}</div>
                            </div>
                        </div>
                    )}
                </div>
                <ChatInput onSendMessage={this.handleSendMessage} setLoading={this.setLoading} onModelPrediction={this.handleModelPrediction} />
            </div>
        );
    }
}

export default Chat;
