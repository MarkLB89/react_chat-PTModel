// src/components/ImageClassifier.js

import React from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import '@tensorflow/tfjs';
import ImageHandler from '../services/ImageHandler';
import { Loader } from './PopupLoader';
import '../css/ImageClassifier.css';

let model;
let isLoadingModel = false;

class ImageClassifier extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imageURL: null,
            predictions: [],
        };
        this.imageHandler = new ImageHandler();
    }

    componentDidMount() {
        this.loadModel();
    }

    async loadModel() {
        if (isLoadingModel) {
            console.log('Model is already loading...');
            return;
        }

        isLoadingModel = true;
        const loader = Loader.showLoader(document.body);
        console.log('Loading model...');
        try {
            model = await mobilenet.load();
            console.log('Model loaded');
            Loader.hideLoader(loader);
            isLoadingModel = false;
        } catch (error) {
            console.error('Error loading the model:', error);
            Loader.hideLoader(loader);
            isLoadingModel = false;
        }
    }

    async classifyImage(imageElement) {
        if (!model) {
            console.error('Model not loaded yet');
            return [];
        }
        const loader = Loader.showLoader(document.body);
        try {
            const predictions = await model.classify(imageElement);
            console.log('Predictions:', predictions);
            Loader.hideLoader(loader);
            this.setState({ predictions });
        } catch (error) {
            console.error('Error classifying the image:', error);
            Loader.hideLoader(loader);
        }
    }

    handleImageUpload = (e) => {
        this.imageHandler.handleImageUpload(e.target, (imageURL) => {
            this.setState({ imageURL }, () => {
                if (this.imageRef) {
                    this.classifyImage(this.imageRef);
                }
            });
        });
    };

    triggerFileInput = () => {
        this.fileInput.click();
    };

    render() {
        const { imageURL, predictions } = this.state;
        return (
            <div className="image-classifier-container">
                <h2>Image Classifier</h2>
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
                            ref={(img) => (this.imageRef = img)}
                        />
                    </div>
                )}
                <div className="predictions">
                    {predictions.map((prediction, index) => (
                        <div key={index}>
                            <strong>{prediction.className}</strong>: {(prediction.probability * 100).toFixed(2)}%
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}

export default ImageClassifier;
