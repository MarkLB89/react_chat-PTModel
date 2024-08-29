// src/components/Message.js

import DOMPurify from 'dompurify';

class Message {
  constructor(text, sender, image = null) {
    this.text = DOMPurify.sanitize(text);
    this.sender = sender;
    this.image = image;
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
