// src/services/ChatService.js

import axios from 'axios';

class ChatService {
    async sendMessage(message) {
        try {
            const response = await axios.post('YOUR_PRETRAINED_MODEL_API_ENDPOINT', {
                message: message,
            });
            return response.data.response;
        } catch (error) {
            console.error('Error communicating with the pretrained model API:', error);
            return 'Sorry, something went wrong.';
        }
    }
}

export default ChatService;
