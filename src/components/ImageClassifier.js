import React from 'react';
import axios from 'axios';
import '../css/ImageClassifier.css';

class ImageClassifier extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imageURL: null,
            predictions: '',
        };
    }

    handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                this.setState({ imageURL: reader.result });
            };
            reader.readAsDataURL(file);

            // Send the image to the backend for classification
            const formData = new FormData();
            formData.append('image', file);

            axios.post('http://127.0.0.1:5000/process-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            .then((response) => {
                this.setState({
                    predictions: response.data.response + (response.data.extracted_text ? `\nExtracted Text: ${response.data.extracted_text}` : ''),
                });
            })
            .catch((error) => {
                console.error('Error processing the image:', error);
                this.setState({
                    predictions: 'Oops, something went wrong while processing the image.',
                });
            });
        }
    };

    triggerFileInput = () => {
        this.fileInput.click();
    };

    render() {
        const { imageURL, predictions } = this.state;
        return (
            <div className="image-classifier-container">
                <h2>Image Object Detector and Text Extractor</h2>
                <div className="file-input-wrapper">
                    <button className="file-input-button" onClick={this.triggerFileInput}>📁</button>
                    <input
                        type="file"
                        onChange={this.handleImageUpload}
                        accept="image/*"
                        ref={(input) => (this.fileInput = input)}
                        style={{ display: 'none' }}
                    />
                </div>
                {imageURL && (
                    <div className="image-preview">
                        <img
                            src={imageURL}
                            alt="Upload Preview"
                            crossOrigin="anonymous"
                        />
                    </div>
                )}
                <div className="predictions">
                    <p>{predictions}</p>
                </div>
            </div>
        );
    }
}

export default ImageClassifier;
