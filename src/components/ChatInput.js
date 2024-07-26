// src/components/ChatInput.js

import React from 'react';
import ImageHandler from '../services/ImageHandler';

class ChatInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            input: '',
            image: null,
            imagePreviewUrl: null,
            fileName: '',
        };
        this.imageHandler = new ImageHandler();
    }

    handleChange = (e) => {
        this.setState({ input: e.target.value });
    };

    handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            this.setState({ fileName: file.name });
            this.imageHandler.handleImageUpload(e.target, (resizedImageUrl) => {
                this.setState({ image: resizedImageUrl, imagePreviewUrl: resizedImageUrl });
            });
        }
    };

    handleSend = () => {
        if (this.state.input.trim() === '' && !this.state.image) return;

        this.props.onSendMessage(this.state.input, this.state.image);
        this.setState({ input: '', image: null, imagePreviewUrl: null, fileName: '' });
    };

    triggerFileInput = () => {
        this.fileInput.click();
    };

    handleRemoveImage = () => {
        this.setState({ image: null, imagePreviewUrl: null, fileName: '' });
    };

    render() {
        return (
            <div className="chat-input-container">
                {this.state.imagePreviewUrl && (
                    <div className="image-preview">
                        <img src={this.state.imagePreviewUrl} alt="Preview" className="image-thumbnail" />
                        <button className="remove-image-button" onClick={this.handleRemoveImage}>✖</button>
                    </div>
                )}
                {this.state.fileName && (
                    <div className="file-name">{this.state.fileName}</div>
                )}
                <div className="chat-input">
                    <button className="file-input-button" onClick={this.triggerFileInput}>📁</button>
                    <input
                        type="file"
                        onChange={this.handleFileChange}
                        accept="image/*"
                        ref={(input) => (this.fileInput = input)}
                        style={{ display: 'none' }}
                    />
                    <input
                        type="text"
                        value={this.state.input}
                        onChange={this.handleChange}
                        placeholder="Type a message..."
                    />
                    <button onClick={this.handleSend}>Send</button>
                </div>
            </div>
        );
    }
}

export default ChatInput;
