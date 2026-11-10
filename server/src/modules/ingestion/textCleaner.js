/**
 * ArivuNet (ಅರಿವುನೆಟ್) — Document Text Normalizer & Cleaner
 * 
 * Cleans text for RAG ingestion while preserving:
 * - Kannada Unicode script (\u0C80-\u0CFF), conjuncts, and vowel signs.
 * - Structural Markdown headings (#, ##, ###) and list items.
 * - Official terminology, numbers, percentages, and currencies (₹).
 */

/**
 * Clean and normalize extracted document text.
 * 
 * @param {string} rawText - Raw text from document parser
 * @returns {string} Cleaned and normalized text
 */
export function cleanText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  return rawText
    // Remove control characters except standard newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize Windows CRLF and CR to standard LF
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove excessive zero-width characters
    .replace(/[\u200B\u200E\u200F\uFEFF]/g, '')
    // Replace non-breaking spaces with standard space
    .replace(/\u00A0/g, ' ')
    // Normalize multiple spaces and tabs within a line to a single space
    .replace(/[ \t]+/g, ' ')
    // Normalize 3 or more consecutive newlines to double newline (paragraph boundary)
    .replace(/\n{3,}/g, '\n\n')
    // Trim leading/trailing whitespace on each line
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();
}

/**
 * Detect language of the text.
 * Returns 'kn' if substantial Kannada Unicode characters are present, otherwise 'en'.
 * 
 * @param {string} text
 * @returns {'kn'|'en'}
 */
export function detectLanguage(text) {
  if (!text) return 'en';
  // Kannada Unicode block is 0x0C80 to 0x0CFF
  const kannadaCharCount = (text.match(/[\u0C80-\u0CFF]/g) || []).length;
  // If at least 5 Kannada characters or > 5% of characters are Kannada
  return kannadaCharCount >= 5 || (kannadaCharCount / Math.max(text.length, 1)) > 0.05 ? 'kn' : 'en';
}

