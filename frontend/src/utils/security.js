/**
 * Security utilities for message and file validation
 * XSS protection and safe content handling
 */

/**
 * Allowed file types for document uploads
 */
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const ALLOWED_DOCUMENT_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx'
];

/**
 * Validate document file type
 * @param {File} file 
 * @returns {boolean}
 */
export const isValidDocument = (file) => {
  if (!file) return false;
  
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  // Check MIME type
  if (!ALLOWED_DOCUMENT_TYPES.includes(fileType)) {
    return false;
  }
  
  // Check extension as additional safety
  const hasValidExtension = ALLOWED_DOCUMENT_EXTENSIONS.some(ext => 
    fileName.endsWith(ext)
  );
  
  return hasValidExtension;
};

/**
 * Sanitize text to prevent XSS attacks
 * @param {string} text 
 * @returns {string}
 */
export const sanitizeText = (text) => {
  if (!text) return '';
  
  // Basic HTML entity encoding
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate URL for safety
 * Prevents javascript:, data:, and other malicious schemes
 * @param {string} url 
 * @returns {boolean}
 */
export const isValidUrl = (url) => {
  if (!url) return false;
  
  try {
    const parsed = new URL(url);
    
    // Only allow http, https, and relative URLs
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    return true;
  } catch {
    // Assume relative URLs are safe
    return url.startsWith('/') || url.startsWith('./');
  }
};

/**
 * Validate image file
 * @param {File} file 
 * @returns {boolean}
 */
export const isValidImage = (file) => {
  if (!file) return false;
  return file.type.startsWith('image/');
};

/**
 * Validate video file
 * @param {File} file 
 * @returns {boolean}
 */
export const isValidVideo = (file) => {
  if (!file) return false;
  return file.type.startsWith('video/');
};

/**
 * Check file size (max 50MB for videos, 10MB for images/docs)
 * @param {File} file 
 * @param {string} type - 'image', 'video', 'document'
 * @returns {boolean}
 */
export const isValidFileSize = (file, type) => {
  if (!file) return false;
  
  const MAX_SIZES = {
    image: 10 * 1024 * 1024, // 10MB
    video: 50 * 1024 * 1024, // 50MB
    document: 10 * 1024 * 1024, // 10MB
    voice: 5 * 1024 * 1024, // 5MB
  };
  
  return file.size <= (MAX_SIZES[type] || MAX_SIZES.document);
};
