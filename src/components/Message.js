// src/components/Message.js

class Message {
    constructor(text, sender) {
        this.text = text;
        this.sender = sender;
        this.timestamp = new Date();
    }

    getFormattedTime() {
        return this.timestamp.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }
}

export default Message;
