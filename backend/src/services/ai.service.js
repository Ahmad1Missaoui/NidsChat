import axios from 'axios';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { ENV } from '../lib/env.js';

/**
 * AI Service using Groq API
 * Provides document summarization, text analysis, and chat capabilities
 */

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

/**
 * Summarize a document or text content
 */
export const summarizeDocument = async (documentText, documentName = 'document') => {
  try {
    const response = await axios.post(
      `${GROQ_BASE_URL}/chat/completions`,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a professional document summarizer. Provide concise, well-structured summaries that capture the key points and main ideas.',
          },
          {
            role: 'user',
            content: `Please summarize the following document titled "${documentName}":\n\n${documentText}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.5,
      },
      {
        headers: {
          'Authorization': `Bearer ${ENV.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      summary: response.data.choices[0].message.content,
      documentName,
    };
  } catch (error) {
    console.error('AI Summarization Error:', error.response?.data || error.message);
    throw new Error('Failed to summarize document');
  }
};

/**
 * Extract text from document URL (PDF, DOCX, TXT supported)
 */
export const extractTextFromUrl = async (documentUrl) => {
  try {
    console.log('Fetching document from URL:', documentUrl);
    
    const response = await axios.get(documentUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NidsChat/1.0)',
      },
    });

    const contentType = response.headers['content-type'] || '';
    const buffer = Buffer.from(response.data);
    
    console.log('Content-Type:', contentType);
    console.log('Buffer size:', buffer.length);
    console.log('First 4 bytes:', buffer.slice(0, 4).toString());
    
    // Check URL extension ignoring query params
    const urlPath = new URL(documentUrl).pathname.toLowerCase();
    console.log('URL Path:', urlPath);

    // Check Magic Bytes for PDF (%PDF)
    const isPdfMagic = buffer.slice(0, 4).toString() === '%PDF';
    const isPKZip = buffer.slice(0, 2).toString('hex') === '504b';

    // DOCX (ZIP-based format)
    if (
      contentType.includes('wordprocessingml') || 
      urlPath.endsWith('.docx') ||
      (isPKZip && (urlPath.includes('.docx') || contentType.includes('document')))
    ) {
      console.log('Detected DOCX format');
      const result = await mammoth.extractRawText({ buffer });
      if (!result.value || result.value.trim().length === 0) {
        throw new Error('DOCX appears to be empty or invalid');
      }
      return result.value;
    }
    
    // PDF
    if (
      contentType.includes('application/pdf') || 
      urlPath.endsWith('.pdf') ||
      isPdfMagic
    ) {
      console.log('Detected PDF format');
      
      // Convert Buffer to Uint8Array for pdfjs-dist
      const uint8Array = new Uint8Array(buffer);
      
      // Load PDF document using pdfjs-dist (without worker for Node.js)
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      });
      const pdfDocument = await loadingTask.promise;
      
      const numPages = pdfDocument.numPages;
      console.log('PDF has', numPages, 'pages');
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      if (!fullText || fullText.trim().length === 0) {
        throw new Error('PDF appears to be empty or contains only images');
      }
      
      console.log('Extracted text length:', fullText.length);
      return fullText.trim();
    }

    // Identify if it's an image and reject it (Garbage prevention)
    if (contentType.startsWith('image/') || urlPath.match(/\.(jpeg|jpg|png|gif|webp|avif)$/)) {
      throw new Error('Image files cannot be summarized. Please upload a PDF or Word document.');
    }

    // If we can't detect the format, throw an error
    throw new Error(`Unsupported file format. Content-Type: ${contentType}. Only PDF and DOCX files are supported.`);
  } catch (error) {
    console.error('Document extraction error:', error.message);
    throw new Error('Failed to extract text from document');
  }
};

/**
 * Generate smart reply suggestions based on message context
 */
export const generateSmartReplies = async (messageContext, count = 3) => {
  try {
    const response = await axios.post(
      `${GROQ_BASE_URL}/chat/completions`,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Generate brief, natural reply suggestions (max 15 words each). Return only the suggestions, one per line.',
          },
          {
            role: 'user',
            content: `Generate ${count} reply suggestions for this message: "${messageContext}"`,
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${ENV.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0].message.content;
    return content.split('\n').filter(s => s.trim().length > 0).slice(0, count);
  } catch (error) {
    console.error('Smart reply error:', error.response?.data || error.message);
    return []; // Return empty array on error gracefully
  }
};

/**
 * Translate message to target language
 */
export const translateMessage = async (text, targetLanguage = 'en') => {
  try {
    const response = await axios.post(
      `${GROQ_BASE_URL}/chat/completions`,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `Translate the following text to ${targetLanguage}. Return only the translation, no explanations.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        max_tokens: 200,
        temperature: 0.3,
      },
      {
        headers: {
          'Authorization': `Bearer ${ENV.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      translatedText: response.data.choices[0].message.content,
      targetLanguage,
    };
  } catch (error) {
    console.error('Translation error:', error.response?.data || error.message);
    throw new Error('Failed to translate message');
  }
};

/**
 * Chat with AI assistant
 */
export const chatWithAssistant = async (userMessage, conversationHistory = []) => {
  try {
    const messages = [
      {
        role: 'system',
        content: `You are Nids AI, an advanced AI assistant integrated into the NidsChat application.
        
        Traits & Personality:
        - You are highly intelligent, friendly, witty, and deeply philosophical.
        - You are capable of writing code, analyzing documents, and discussing complex topics.
        - You are supportive and always improved by "training" (contextual feedback).
        - Your goal is to be the ultimate companion for the user, helping them with work, code, or just casual chat.
        - You are concise when needed, but can be verbose and detailed if the topic requires it.
        - You have a touch of humor and personality, not just a robotic responder.
        
        Context:
        - The user is using NidsChat, a modern chat application developed by Ahmed Missaoui.
        - You are the dedicated AI assistant for this user.`,
      },
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage,
      },
    ];

    const response = await axios.post(
      `${GROQ_BASE_URL}/chat/completions`,
      {
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 4096,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${ENV.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      message: response.data.choices[0].message.content,
    };
  } catch (error) {
    console.error('AI chat error:', error.response?.data || error.message);
    throw new Error('Failed to chat with AI assistant');
  }
};
