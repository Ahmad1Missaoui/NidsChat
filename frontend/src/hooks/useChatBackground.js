import { useState, useEffect } from 'react';
import { getChatBackground } from '../utils/chatHelpers';

/**
 * Custom hook for deterministic chat background
 * Ensures same background for same chat every time
 * @param {string} chatId 
 * @returns {string} Background image URL
 */
export const useChatBackground = (chatId) => {
  const [backgroundImage, setBackgroundImage] = useState('');

  useEffect(() => {
    if (chatId) {
      const bg = getChatBackground(chatId);
      setBackgroundImage(bg);
    }
  }, [chatId]);

  return backgroundImage;
};
