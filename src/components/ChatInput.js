import React, { Component } from 'react';
import axios from 'axios';
import ImageHandler from '../services/ImageHandler';
import PopupLoader from './PopupLoader';

class ChatInput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            input: '',
            image: null,
            imagePreviewUrl: null,
            fileName: '',
            availableFiles: [],
            selectedFile: '',
            loading: false,
            chatStarted: false,
            loadingFiles: true,
        };
        this.imageHandler = new ImageHandler();
    }

    async componentDidMount() {
        this.pollForAvailableFiles();
    }

    pollForAvailableFiles = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/available-files');
            const files = response.data.files.map((file) => file);
            if (files.length > 0) {
                this.setState({ availableFiles: files, loadingFiles: false });
            } else {
                setTimeout(this.pollForAvailableFiles, 1000);
            }
        } catch (error) {
            console.error('Error fetching available files:', error);
            setTimeout(this.pollForAvailableFiles, 1000);
        }
    };

    handleChange = (e) => {
        this.setState({ input: e.target.value });
    };

    handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Create a Base64 encoded image preview URL
                const imageBase64 = reader.result;
                const previewUrl = `data:${file.type};base64,${imageBase64.split(',')[1]}`;
                this.setState({
                    image: file,
                    imagePreviewUrl: previewUrl,
                    fileName: file.name,
                });
            };
            reader.readAsDataURL(file);
        }
    };

    handleFileSelection = (e) => {
        this.setState({ selectedFile: e.target.value });
    };

    handleSend = async () => {
        if (this.state.input.trim() === '' && !this.state.image) return;
    
        this.setState({ loading: true });
        const loader = PopupLoader.showLoader(document.body);
    
        const userMessage = this.state.input;
        this.props.onSendMessage(userMessage, this.state.imagePreviewUrl); // Sending preview URL
    
        if (!this.state.image) {
            try {
                const response = await axios.post('http://127.0.0.1:5000/ask-question', {
                    question: userMessage,
                    file_name: this.state.selectedFile,
                });
    
                const predictionText = response.data.answer;
                this.props.onModelPrediction(predictionText);
            } catch (error) {
                console.error('Error fetching prediction from Flask backend:', error);
                this.props.onModelPrediction('Oops, something went wrong. Can you rephrase the question? Also, make sure you choose a topic.');
            }
        } else {
            const formData = new FormData();
            formData.append('image', this.state.image);
    
            try {
                const response = await axios.post('http://127.0.0.1:5000/process-image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
    
                const predictionText = response.data.response;
                let extractedText = response.data.extracted_text;
    
                // Check if no text was found and update the message accordingly
                if (!extractedText || extractedText.trim() === '') {
                    extractedText = 'No text found';
                }
    
                const combinedPredictionText = `${predictionText}\n\nExtracted Text:\n${extractedText}`;
                this.props.onModelPrediction(combinedPredictionText);
            } catch (error) {
                console.error('Error processing the image:', error);
                this.props.onModelPrediction('Oops, something went wrong while processing the image.');
            }
        }
    
        this.setState({ input: '', image: null, imagePreviewUrl: null, fileName: '', loading: false });
        PopupLoader.hideLoader(loader);
    };
    

    triggerFileInput = () => {
        this.fileInput.click();
    };

    handleRemoveImage = () => {
        this.setState({ image: null, imagePreviewUrl: null, fileName: '' });
    };

    handleStartChat = () => {
        if (!this.state.chatStarted) {
            this.setState({ chatStarted: true });
        }
    };

    render() {
        const { chatStarted, availableFiles, loadingFiles, imagePreviewUrl, fileName, input, loading } = this.state;

        return (
            <div className="chat-container">
                <div className="start-chat-section">
                    {!chatStarted ? (
                        <button className="start-chat-button" onClick={this.handleStartChat}>
                            Start Chat
                        </button>
                    ) : loadingFiles ? (
                        <div>Loading...Topics...</div>
                    ) : (
                        <div className="chat-input-container">
                            {loading && <div className="loading-overlay">Loading...</div>}
                            {imagePreviewUrl && (
                                <div className="image-preview">
                                    <img src={imagePreviewUrl} alt="Preview" className="image-thumbnail" />
                                    <button className="remove-image-button" onClick={this.handleRemoveImage}>
                                        &#x2715;
                                    </button>
                                </div>
                            )}
                            {fileName && <div className="file-name">{fileName}</div>}
                            <div className="chat-input">
                                <select onChange={this.handleFileSelection} value={this.state.selectedFile}>
                                    <option value="">Topic</option>
                                    {availableFiles.length > 0 ? (
                                        availableFiles.map((file, index) => (
                                            <option key={index} value={file}>
                                                {file.split('.').slice(0, -1).join('.')}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">No files available</option>
                                    )}
                                </select>

                                <button className="file-input-button" onClick={this.triggerFileInput}>
                                    &#x1F4C1;
                                </button>
                                <input
                                    type="file"
                                    onChange={this.handleFileChange}
                                    accept="image/*"
                                    ref={(input) => (this.fileInput = input)}
                                    style={{ display: 'none' }}
                                />
                                <input
                                    type="text"
                                    value={input}
                                    onChange={this.handleChange}
                                    placeholder="Type a message..."
                                />
                                <button onClick={this.handleSend}>Send</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default ChatInput;
