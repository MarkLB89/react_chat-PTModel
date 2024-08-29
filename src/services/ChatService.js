// src/services/ChatService.js

import axios from 'axios';
import * as mobilenet from '@tensorflow-models/mobilenet';

class ChatService {
  constructor() {
    this.apiEndpoint = 'YOUR_PRETRAINED_MODEL_API_ENDPOINT';
    this.localModel = null;
  }

  async loadLocalModel() {
    if (!this.localModel) {
      this.localModel = await mobilenet.load();
    }
  }

  async sendMessage(message, image = null) {
    let responses = [];

    // Try to use the API if it's available
    if (this.apiEndpoint) {
      try {
        const response = await axios.post(this.apiEndpoint, {
          message: message,
        });
        responses.push(`API Prediction: ${response.data.response}`);
      } catch (error) {
        console.error('Error communicating with the pretrained model API:', error);
        responses.push('API Error: Request failed with status code 404');
      }
    }

    // If the image is available, use the local model
    if (image && this.localModel) {
      try {
        const predictions = await this.localModel.classify(image);
        const predictionText = predictions.map(p => `${p.className}: ${(p.probability * 100).toFixed(2)}%`).join('\n');
        responses.push(`Local Model Prediction: ${predictionText}`);
      } catch (error) {
        console.error('Error using the local model:', error);
        responses.push('Local Model Error: ' + error.message);
      }
    }

    if (responses.length > 0) {
      return responses.join('\n\n');
    }

    return 'Sorry, something went wrong.';
  }
}

export default ChatService;
