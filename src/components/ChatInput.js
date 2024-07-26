// src/components/ChatInput.js

import React from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';
import ImageHandler from '../services/ImageHandler';
import PopupLoader from './PopupLoader';

class ChatInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            input: '',
            image: null,
            imagePreviewUrl: null,
            fileName: '',
            model: null,
            predictions: [], // Initialize predictions as an empty array
        };
        this.imageHandler = new ImageHandler();
    }

    async componentDidMount() {
        await this.loadModel();
        this.props.setLoading(false); // Indicate that loading is complete
    }

    async loadModel() {
        this.props.setLoading(true); // Indicate that loading is starting
        const loader = PopupLoader.showLoader(document.querySelector('.chat-messages'));
        console.log('Loading model...');
        try {
            const model = await mobilenet.load();
            console.log('Model loaded');
            this.setState({ model });
            PopupLoader.hideLoader(loader);
            this.props.setLoading(false); // Indicate that loading is complete
        } catch (error) {
            console.error('Error loading the model:', error);
            PopupLoader.hideLoader(loader);
            this.props.setLoading(false); // Indicate that loading is complete
        }
    }

    classifyImage = async (imageElement) => {
        if (!this.state.model) {
            console.error('Model not loaded yet');
            return [];
        }
        const loader = PopupLoader.showLoader(document.querySelector('.chat-messages'));
        try {
            const predictions = await this.state.model.classify(imageElement);
            console.log('Predictions:', predictions);
            PopupLoader.hideLoader(loader);
            this.setState({ predictions });
            const predictionText = predictions.map(p => `${p.className}: ${(p.probability * 100).toFixed(2)}%`).join('\n');
            this.props.onModelPrediction(predictionText); // Send prediction as a message
            return predictions;
        } catch (error) {
            console.error('Error classifying the image:', error);
            PopupLoader.hideLoader(loader);
            this.props.onModelPrediction("Sorry, something went wrong."); // Send error message as a bot message
            return [];
        }
    };

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

        if (this.state.image) {
            const imageElement = new Image();
            imageElement.src = this.state.image;
            imageElement.onload = async () => {
                this.props.onSendMessage(this.state.input, this.state.image);
                await this.classifyImage(imageElement);
                this.setState({ input: '', image: null, imagePreviewUrl: null, fileName: '', predictions: [] });
            };
        } else {
            this.props.onSendMessage(this.state.input, this.state.image);
            this.setState({ input: '', image: null, imagePreviewUrl: null, fileName: '', predictions: [] });
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
