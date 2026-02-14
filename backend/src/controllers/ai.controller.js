import * as aiService from '../services/ai.service.js';

/**
 * Summarize a document from URL or text
 * POST /api/ai/summarize
 */
export const summarizeDocument = async (req, res) => {
  try {
    const { documentUrl, documentText, documentName } = req.body;

    if (!documentUrl && !documentText) {
      return res.status(400).json({
        success: false,
        message: 'Either documentUrl or documentText is required',
      });
    }

    let textContent = documentText;

    // If URL provided, extract text
    if (documentUrl && !documentText) {
      try {
        console.log('Extracting text from URL:', documentUrl);
        textContent = await aiService.extractTextFromUrl(documentUrl);
        console.log('Extracted text length:', textContent.length);
      } catch (error) {
        console.error('Document extraction failed:', error.message);
        return res.status(400).json({
          success: false,
          message: `Failed to extract text from document URL. ${error.message}`,
        });
      }
    }

    // Limit text length to prevent excessive API usage
    const MAX_TEXT_LENGTH = 10000;
    if (textContent.length > MAX_TEXT_LENGTH) {
      textContent = textContent.substring(0, MAX_TEXT_LENGTH) + '...';
    }

    const result = await aiService.summarizeDocument(textContent, documentName);

    res.status(200).json(result);
  } catch (error) {
    console.error('Summarize error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to summarize document',
    });
  }
};

/**
 * Generate smart reply suggestions
 * POST /api/ai/smart-replies
 */
export const generateSmartReplies = async (req, res) => {
  try {
    const { message, count = 3 } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const suggestions = await aiService.generateSmartReplies(message, count);

    // Return array directly for frontend compatibility
    res.status(200).json(suggestions);
  } catch (error) {
    console.error('Smart replies error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate smart replies',
    });
  }
};

/**
 * Translate message
 * POST /api/ai/translate
 */
export const translateMessage = async (req, res) => {
  try {
    const { text, targetLanguage = 'en' } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required',
      });
    }

    const result = await aiService.translateMessage(text, targetLanguage);

    res.status(200).json(result);
  } catch (error) {
    console.error('Translate error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to translate message',
    });
  }
};

/**
 * Chat with AI assistant
 * POST /api/ai/chat
 */
export const chatWithAssistant = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const result = await aiService.chatWithAssistant(message, history);

    res.status(200).json(result);
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to chat with assistant',
    });
  }
};
