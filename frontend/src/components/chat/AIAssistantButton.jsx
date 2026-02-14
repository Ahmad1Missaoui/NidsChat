import { memo, useState } from 'react';
import { createPortal } from 'react-dom'; // Add createPortal
import { SparklesIcon, LoaderIcon, XIcon, AlertCircleIcon } from 'lucide-react';
import axiosInstance from '../../lib/axios';

/**
 * AIAssistantButton Component - Responsive & Theme Aware
 * Supports Light/Dark mode and fits all screen sizes
 */
const AIAssistantButton = memo(({ documentUrl, documentName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleSummarize = async () => {
    if (!documentUrl) return;
    
    setIsLoading(true);
    setShowModal(true);
    setError(null);
    setSummary(null);
    
    try {
      // Send document URL to backend for parsing and summarization
      const response = await axiosInstance.post('/ai/summarize', { 
        documentUrl,
        documentName 
      });
      
      if (response.data.success) {
        setSummary(response.data.summary);
      } else {
        setError(response.data.message || 'Could not summarize document');
      }
      
    } catch (err) {
      console.error('AI Summarization Error:', err);
      const errorMsg = err.response?.data?.message || 'AI service unavailable. Ensure backend is running and API key is configured.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSummary(null);
    setError(null);
  };

  return (
    <>
      {/* AI Button - Responsive & Theme Aware */}
      <button
        onClick={handleSummarize}
        disabled={isLoading}
        className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl 
          bg-white dark:bg-[#1a1a24] 
          border border-gray-200 dark:border-[#facc15]/30 
          hover:bg-gray-50 dark:hover:bg-[#2a2a34] 
          text-violet-600 dark:text-[#facc15] 
          text-sm font-medium transition-all duration-200 
          shadow-sm hover:shadow-md 
          disabled:opacity-50 disabled:cursor-not-allowed"
        title="Get AI Summary"
      >
        {isLoading ? (
          <>
            <LoaderIcon className="w-4 h-4 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <SparklesIcon className="w-4 h-4" />
            <span>AI Summary</span>
          </>
        )}
      </button>

      {/* Modal - Rendered in Portal to escape overlapping parents */}
      {showModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />

          {/* Modal Container */}
          <div 
            className="relative z-10 w-full max-w-lg mx-auto flex flex-col max-h-[85vh] 
              bg-white dark:bg-[#1a1a24] 
              rounded-2xl shadow-xl overflow-hidden ring-1 ring-black/5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-[#2a2a34]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-50 dark:bg-[#facc15]/10 text-violet-600 dark:text-[#facc15]">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                    AI Summary
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                    {documentName}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#2a2a34] transition-colors"
                title="Close"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              
              {/* Loading State */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-8">
                  <LoaderIcon className="w-10 h-10 animate-spin text-violet-600 dark:text-[#facc15] mb-4" />
                  <p className="text-gray-900 dark:text-white font-medium animate-pulse">
                    Analyzing document...
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    This may take a moment
                  </p>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-900/50">
                  <div className="flex gap-3">
                    <AlertCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-900 dark:text-red-200">
                        Summarization Failed
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1 leading-relaxed">
                        {error}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleSummarize}
                    className="mt-3 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    Try Again →
                  </button>
                </div>
              )}

              {/* Success Result */}
              {summary && !isLoading && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="bg-gray-50 dark:bg-[#2a2a34] rounded-xl p-4 border border-gray-100 dark:border-[#facc15]/10">
                    <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {summary}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-[#2a2a34] bg-gray-50 dark:bg-[#1a1a24]">
              <button
                onClick={closeModal}
                className="w-full py-2.5 rounded-xl font-medium text-sm
                  bg-violet-600 hover:bg-violet-700 dark:bg-[#facc15] dark:hover:bg-[#d4af37]
                  text-white dark:text-black transition-colors shadow-sm"
              >
                Close
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
});

AIAssistantButton.displayName = 'AIAssistantButton';

export default AIAssistantButton;
