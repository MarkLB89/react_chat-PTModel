// src/components/TypingEffect.js

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const TypingEffect = ({ text, speed, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        let index = 0;
        const intervalId = setInterval(() => {
            setDisplayedText((prev) => prev + text[index]);
            index += 1;
            if (index === text.length) {
                clearInterval(intervalId);
                onComplete();
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [text, speed, onComplete]);

    return <span>{displayedText}</span>;
};

TypingEffect.propTypes = {
    text: PropTypes.string.isRequired,
    speed: PropTypes.number,
    onComplete: PropTypes.func,
};

TypingEffect.defaultProps = {
    speed: 50, // default typing speed
    onComplete: () => {},
};

export default TypingEffect;
