// src/components/Loader.js

import React from 'react';
import '../css/Loader.css';

class Loader extends React.Component {
    static showLoader(messageContainer) {
        const loaderElement = document.createElement('div');
        loaderElement.className = 'response';
        loaderElement.innerHTML = `
      <div class="loader-container">
        <div class="loader-text">Getting Ready... please wait. This may take several minutes depending upon your network connection.</div>
        <div class="circle-container">
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
        </div>
      </div>
    `;
        messageContainer.appendChild(loaderElement);
        return loaderElement;
    }

    static hideLoader(loaderElement) {
        loaderElement.remove();
    }

    render() {
        return null; // This component is used statically
    }
}

export default Loader;
