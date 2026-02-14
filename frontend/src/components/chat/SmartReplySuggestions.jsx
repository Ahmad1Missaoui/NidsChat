import { memo, useState, useEffect } from 'react';
import { SparklesIcon, LoaderIcon } from 'lucide-react';
import axiosInstance from '../../lib/axios';

/**
 * SmartReplySuggestions Component
 * AI-powered message reply suggestions
 */
const SmartReplySuggestions = memo(({ lastMessage, onSelectSuggestion }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    // Auto-fetch suggestions when a new message arrives
    if (lastMessage && lastMessage.text && !lastMessage.isDeleted) {
      fetchSuggestions(lastMessage.text);
    }
  }, [lastMessage?._id]); // Only trigger when message ID changes

  const fetchSuggestions = async (messageText) => {
    setIsLoading(true);
    setShowSuggestions(true);
    
    try {
      const response = await axiosInstance.post('/ai/smart-replies', {
        message: messageText,
        count: 3,
      });

      if (Array.isArray(response.data)) {
        setSuggestions(response.data);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Smart replies error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    onSelectSuggestion(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  if (!showSuggestions || (!isLoading && suggestions.length === 0)) {
    return null;
  }

  return (
    <div className="px-4 py-2 bg-transparent">
      <div className="flex items-center gap-2 mb-2">
        <SparklesIcon className="w-4 h-4 text-purple-600 dark:text-[#facc15]" />
        <span className="text-xs font-semibold text-purple-700 dark:text-[#facc15]">
          AI Suggestions
        </span>
        <button
          onClick={() => setShowSuggestions(false)}
          className="ml-auto text-xs text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
        >
          Hide
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
          <LoaderIcon className="w-4 h-4 animate-spin" />
          <span className="text-xs">Generating suggestions...</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="px-3 py-1.5 rounded-full text-xs font-medium 
                bg-gray-100 text-gray-700 border border-gray-200 
                hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700
                dark:bg-[#2a2a34] dark:text-gray-200 dark:border-[#facc15]/30 
                dark:hover:bg-[#3a3a44] dark:hover:border-[#facc15]
                transition-all shadow-sm active:scale-95"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

SmartReplySuggestions.displayName = 'SmartReplySuggestions';

export default SmartReplySuggestions;
