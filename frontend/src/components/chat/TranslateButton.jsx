import { memo, useState } from 'react';
import { createPortal } from 'react-dom';
import { LanguagesIcon, LoaderIcon, XIcon, CheckIcon } from 'lucide-react';
import axiosInstance from '../../lib/axios';

/**
 * TranslateButton Component
 * Allows users to translate messages to different languages
 */
const TranslateButton = memo(({ messageText }) => {
  const [showModal, setShowModal] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('');

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  ];

  const handleTranslate = async (langCode, langName) => {
    setIsTranslating(true);
    setSelectedLanguage(langName);
    setTranslatedText(null);

    try {
      const response = await axiosInstance.post('/ai/translate', {
        text: messageText,
        targetLanguage: langCode,
      });

      if (response.data.success) {
        setTranslatedText(response.data.translatedText);
      }
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText('❌ Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setTranslatedText(null);
    setSelectedLanguage('');
  };

  return (
    <>
      {/* Translate Button */}
      <button
        onClick={() => setShowModal(true)}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a34] text-gray-500 dark:text-gray-400 hover:text-[#facc15] transition-colors"
        title="Translate message"
      >
        <LanguagesIcon className="w-4 h-4" />
      </button>

      {/* Translation Modal */}
      {showModal &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
              onClick={closeModal}
            />

            {/* Modal Container */}
            <div
              className="relative z-10 w-full max-w-2xl mx-auto flex flex-col max-h-[85vh] bg-white dark:bg-[#1a1a24] rounded-2xl shadow-xl overflow-hidden ring-1 ring-black/5 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 dark:border-[#2a2a34]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-[#facc15]/10 text-blue-600 dark:text-[#facc15]">
                    <LanguagesIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      Translate Message
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Choose a language to translate this message
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

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {/* Original Text */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Original Message
                  </label>
                  <div className="bg-gray-50 dark:bg-[#2a2a34] rounded-xl p-4 border border-gray-100 dark:border-[#facc15]/10">
                    <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
                      {messageText}
                    </p>
                  </div>
                </div>

                {/* Language Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Select Target Language
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleTranslate(lang.code, lang.name)}
                        disabled={isTranslating}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-[#2a2a34] hover:border-[#facc15] dark:hover:border-[#facc15] bg-white dark:bg-[#1a1a24] hover:bg-gray-50 dark:hover:bg-[#2a2a34] text-gray-700 dark:text-gray-200 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="truncate">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Translation Result */}
                {(isTranslating || translatedText) && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      {isTranslating ? 'Translating...' : `Translated to ${selectedLanguage}`}
                    </label>
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-[#facc15]/10 dark:to-[#facc15]/5 rounded-xl p-4 border border-blue-100 dark:border-[#facc15]/20">
                      {isTranslating ? (
                        <div className="flex items-center justify-center py-4">
                          <LoaderIcon className="w-6 h-6 animate-spin text-blue-600 dark:text-[#facc15]" />
                        </div>
                      ) : (
                        <p className="text-gray-900 dark:text-white text-sm leading-relaxed whitespace-pre-wrap">
                          {translatedText}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 dark:border-[#2a2a34] bg-gray-50 dark:bg-[#1a1a24]">
                <button
                  onClick={closeModal}
                  className="w-full py-2.5 rounded-xl font-medium text-sm bg-blue-600 hover:bg-blue-700 dark:bg-[#facc15] dark:hover:bg-[#d4af37] text-white dark:text-black transition-colors shadow-sm"
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

TranslateButton.displayName = 'TranslateButton';

export default TranslateButton;
