// src/components/ChatInput.js

import React from 'react';
import ImageHandler from '../services/ImageHandler';
import PopupLoader from './PopupLoader';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';

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
        this.localModel = null;
    }

    async componentDidMount() {
        await this.loadModel();
        this.props.setLoading(false);
    }

    async loadModel() {
        this.props.setLoading(true);
        const loader = PopupLoader.showLoader(document.querySelector('.chat-messages'));
        console.log('Loading model...');
        try {
            this.localModel = await mobilenet.load({
                version: 2, // Specify MobileNet version here
                alpha: 1.0, // Specify alpha (width multiplier) here, 1.0 means no reduction
            });
            console.log('Model loaded');
            PopupLoader.hideLoader(loader);
            this.props.setLoading(false);
        } catch (error) {
            console.error('Error loading the model:', error);
            PopupLoader.hideLoader(loader);
            this.props.setLoading(false);
        }
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

    handleSend = async () => {
        if (this.state.input.trim() === '' && !this.state.image) return;

        const userMessage = this.state.input;
        this.props.onSendMessage(userMessage, this.state.image);

        if (this.state.image) {
            const imageElement = new Image();
            imageElement.src = this.state.image;
            imageElement.onload = async () => {
                if (this.localModel) {
                    const predictions = await this.localModel.classify(imageElement);
                    const predictionText = predictions.map(p => `${p.className}: ${(p.probability * 100).toFixed(2)}%`).join('\n');
                    this.props.onModelPrediction(predictionText);
                    this.setState({ input: '', image: null, imagePreviewUrl: null, fileName: '' });
                } else {
                    console.error('Local model not loaded');
                }
            };
        } else {
            const predictionText = `You said: ${userMessage}`;
            this.props.onModelPrediction(predictionText);
            this.setState({ input: '', image: null, imagePreviewUrl: null, fileName: '' });
        }
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
