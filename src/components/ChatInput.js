import React from 'react';
import ImageHandler from '../services/ImageHandler';
import PopupLoader from './PopupLoader';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
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
        this.localModelMobileNet = null;
        this.localModelCocoSsd = null;
    }

    async componentDidMount() {
        await this.loadModels();
        this.props.setLoading(false);
    }

    async loadModels() {
        this.props.setLoading(true);
        const loader = PopupLoader.showLoader(document.querySelector('.chat-messages'));
        console.log('Loading models...');
        try {
            this.localModelMobileNet = await mobilenet.load({
                version: 2, // Specify MobileNet version here
                alpha: 1.0, // Specify alpha (width multiplier) here, 1.0 means no reduction
            });
            this.localModelCocoSsd = await cocoSsd.load();
            console.log('Models loaded');
            PopupLoader.hideLoader(loader);
            this.props.setLoading(false);
        } catch (error) {
            console.error('Error loading the models:', error);
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
            const reader = new FileReader();
            reader.onloadend = () => {
                this.setState({
                    image: reader.result,
                    imagePreviewUrl: reader.result,
                    fileName: file.name
                });
            };
            reader.readAsDataURL(file);
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
                let predictionTexts = [];
                if (this.localModelMobileNet) {
                    const predictionsMobileNet = await this.localModelMobileNet.classify(imageElement);
                    const predictionTextMobileNet = predictionsMobileNet.map(p => `MNM - ${p.className}: ${(p.probability * 100).toFixed(2)}%`).join('\n');
                    predictionTexts.push(predictionTextMobileNet);
                } else {
                    console.error('Local MobileNet model not loaded');
                }

                if (this.localModelCocoSsd) {
                    const predictionsCocoSsd = await this.localModelCocoSsd.detect(imageElement);
                    const predictionTextCocoSsd = predictionsCocoSsd.map(p => `COCOSSD - ${p.class}: ${(p.score * 100).toFixed(2)}%`).join('\n');
                    predictionTexts.push(predictionTextCocoSsd);
                } else {
                    console.error('Local COCO-SSD model not loaded');
                }

                const combinedPredictionText = predictionTexts.join('\n\n');
                this.props.onModelPrediction(combinedPredictionText);
                this.setState({ input: '', image: null, imagePreviewUrl: null, fileName: '' });
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
