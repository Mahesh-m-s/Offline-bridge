/**
 * OfflineBridge — Bilingual Text-to-Speech (TTS) Engine
 * 
 * Implements browser SpeechSynthesis API supporting:
 * - Kannada speech synthesis ('kn-IN')
 * - Indian / Global English speech synthesis ('en-IN' / 'en-US')
 * - Markdown & syntax sanitization for clean, natural speech
 * - Sentence-chunking engine to overcome Chrome's 15-second cutoff bug
 * - Voice availability inspection with graceful fallbacks
 */

/**
 * Check if SpeechSynthesis is supported in the current browser.
 * 
 * @returns {boolean}
 */
export function isSpeechSynthesisSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window);
}

/**
 * Strip Markdown formatting, URLs, and code symbols for natural voice narration.
 * 
 * @param {string} rawText
 * @param {'kn'|'en'} [lang='en']
 * @returns {string} Sanitized plain text suitable for speech synthesis
 */
export function cleanTextForSpeech(rawText, lang = 'en') {
  if (!rawText || typeof rawText !== 'string') return '';

  const isKn = lang === 'kn';

  return rawText
    // Remove XML/HTML tags
    .replace(/<[^>]+>/g, '')
    // Replace markdown links [label](url) with just the label
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove standalone HTTP/HTTPS URLs
    .replace(/https?:\/\/\S+/gi, isKn ? 'ಅಧಿಕೃತ ಪೋರ್ಟಲ್' : 'official portal')
    // Remove markdown bold, italic, strikethrough: **text**, *text*, ~~text~~
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove headers: #, ##, ###
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bullet points and dashes
    .replace(/^\s*[•\-*]\s+/gm, '')
    // Remove citation numbers like [1], [2]
    .replace(/\[\d+\]/g, '')
    // Replace currency symbol ₹ with spoken word
    .replace(/₹\s*([0-9,]+)/g, isKn ? '$1 ರೂಪಾಯಿ' : '$1 rupees')
    // Normalize newlines to sentence pauses
    .replace(/\n+/g, '. ')
    // Clean up duplicate periods and punctuation collisions
    .replace(/\.\s*\./g, '.')
    .replace(/:\s*\./g, ': ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split long narrative into natural sentence chunks (<= 160 chars)
 * to circumvent Chrome's 15-second speech cutoff bug.
 * 
 * @param {string} text
 * @param {number} [maxChunkLen=160]
 * @returns {Array<string>}
 */
export function splitIntoSentenceChunks(text, maxChunkLen = 160) {
  if (!text) return [];

  // Helper to split a large string by word boundaries
  const splitByWords = (str) => {
    const words = str.split(/\s+/);
    const wordChunks = [];
    let cur = '';

    for (const w of words) {
      if (!w) continue;
      if (!cur) {
        cur = w;
      } else if ((cur + ' ' + w).length <= maxChunkLen) {
        cur += ' ' + w;
      } else {
        wordChunks.push(cur);
        cur = w;
      }
    }
    if (cur.trim()) wordChunks.push(cur.trim());
    return wordChunks;
  };

  // Split on sentence terminators: . ? ! । or newline
  const rawSentences = text.match(/[^.!?।\n]+[.!?।\n]*/g) || [text];
  const chunks = [];

  for (const sentence of rawSentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (trimmed.length <= maxChunkLen) {
      chunks.push(trimmed);
    } else {
      // Split on clause boundaries (, ; : -)
      const parts = trimmed.split(/([,;:\-—]\s+)/);
      let current = '';

      for (const part of parts) {
        if (!part) continue;

        if (part.length > maxChunkLen) {
          if (current.trim()) {
            chunks.push(current.trim());
            current = '';
          }
          const subChunks = splitByWords(part);
          for (let i = 0; i < subChunks.length; i++) {
            if (i === subChunks.length - 1) {
              current = subChunks[i];
            } else {
              chunks.push(subChunks[i]);
            }
          }
        } else if ((current + part).length <= maxChunkLen) {
          current += part;
        } else {
          if (current.trim()) chunks.push(current.trim());
          current = part;
        }
      }
      if (current.trim()) chunks.push(current.trim());
    }
  }

  return chunks.length > 0 ? chunks : [text];
}

/**
 * Speech Synthesis Controller
 * Coordinates voice loading, language matching, queue management, and playback controls.
 */
class SpeechSynthesisManager {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.activeMessageId = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentUtterances = [];
    this.currentChunkIndex = 0;
    this.onEndHandler = null;

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  /**
   * Load available browser system voices into cache.
   */
  loadVoices() {
    if (!this.synth) return [];
    try {
      this.voices = this.synth.getVoices() || [];
    } catch {
      this.voices = [];
    }
    return this.voices;
  }

  /**
   * Find the optimal system voice for the given language.
   * 
   * @param {'kn'|'en'} language
   * @returns {SpeechSynthesisVoice|null}
   */
  getBestVoice(language = 'en') {
    const voices = this.voices.length > 0 ? this.voices : this.loadVoices();
    const isKn = language === 'kn';

    if (isKn) {
      // Look for kn-IN or any voice containing kannada in name or lang
      const knVoice = voices.find((v) =>
        v.lang === 'kn-IN' ||
        v.lang === 'kn_IN' ||
        v.lang.toLowerCase().startsWith('kn') ||
        v.name.toLowerCase().includes('kannada')
      );
      return knVoice || null;
    }

    // English voice search (prefer en-IN, then en-US/en-GB)
    const enInVoice = voices.find((v) => v.lang === 'en-IN' || v.lang === 'en_IN');
    if (enInVoice) return enInVoice;

    const enVoice = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
    return enVoice || voices[0] || null;
  }

  /**
   * Check whether an authentic voice for the requested language is installed on the host.
   * 
   * @param {'kn'|'en'} language
   * @returns {boolean}
   */
  isVoiceAvailable(language = 'en') {
    if (!this.synth) return false;
    if (language === 'en') return true; // English is universally available
    return Boolean(this.getBestVoice('kn'));
  }

  /**
   * Speak structured assistant response.
   * 
   * @param {object} options
   * @param {string} options.messageId - Unique message identifier
   * @param {string} options.text - Raw markdown response text
   * @param {'kn'|'en'} [options.language='en'] - Target response language
   * @param {function} [options.onStart] - Callback when playback starts
   * @param {function} [options.onEnd] - Callback when playback finishes
   * @param {function} [options.onError] - Callback on synthesis error
   * @param {function} [options.onVoiceUnavailable] - Callback when Kannada voice is missing
   */
  speak({
    messageId,
    text,
    language = 'en',
    onStart,
    onEnd,
    onError,
    onVoiceUnavailable
  } = {}) {
    if (!this.synth || !isSpeechSynthesisSupported()) {
      if (onError) onError({ code: 'NOT_SUPPORTED', message: 'Speech synthesis is not supported on this browser.' });
      return;
    }

    // Stop previous audio session
    this.stop();

    const isKn = language === 'kn';
    const voice = this.getBestVoice(language);

    // If Kannada voice is requested but not installed on this OS
    if (isKn && !voice) {
      if (onVoiceUnavailable) {
        onVoiceUnavailable({
          language: 'kn',
          message: 'Kannada voice is not installed on this device. The answer is available as text above.'
        });
      }
      return;
    }

    const cleanText = cleanTextForSpeech(text, language);
    if (!cleanText) {
      if (onEnd) onEnd();
      return;
    }

    const chunks = splitIntoSentenceChunks(cleanText);
    if (chunks.length === 0) {
      if (onEnd) onEnd();
      return;
    }

    this.activeMessageId = messageId;
    this.isPlaying = true;
    this.isPaused = false;
    this.currentChunkIndex = 0;
    this.onEndHandler = onEnd;

    if (onStart) onStart();

    const speakChunk = (index) => {
      if (!this.isPlaying || index >= chunks.length) {
        this.isPlaying = false;
        this.activeMessageId = null;
        if (this.onEndHandler) this.onEndHandler();
        return;
      }

      this.currentChunkIndex = index;
      const utterance = new SpeechSynthesisUtterance(chunks[index]);

      if (voice) {
        utterance.voice = voice;
      }
      utterance.lang = isKn ? 'kn-IN' : (voice?.lang || 'en-IN');
      utterance.rate = isKn ? 0.95 : 1.0; // Slightly slower pace for Kannada clarity
      utterance.pitch = 1.0;

      utterance.onend = () => {
        speakChunk(index + 1);
      };

      utterance.onerror = (event) => {
        if (event.error === 'interrupted' || event.error === 'canceled') {
          // Normal interruption from stop()
          return;
        }
        this.isPlaying = false;
        this.activeMessageId = null;
        if (onError) {
          onError({
            code: event.error || 'TTS_ERROR',
            message: `Speech error: ${event.error || 'unknown'}`
          });
        }
      };

      try {
        this.synth.speak(utterance);
      } catch (err) {
        this.isPlaying = false;
        this.activeMessageId = null;
        if (onError) onError({ code: 'SPEAK_FAILED', message: err.message });
      }
    };

    speakChunk(0);
  }

  /**
   * Pause active speech playback.
   */
  pause() {
    if (this.synth && this.isPlaying && !this.isPaused) {
      try {
        this.synth.pause();
        this.isPaused = true;
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Resume paused playback.
   */
  resume() {
    if (this.synth && this.isPlaying && this.isPaused) {
      try {
        this.synth.resume();
        this.isPaused = false;
      } catch {
        // Ignore
      }
    }
  }

  /**
   * Stop all active speech synthesis playback.
   */
  stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {
        // Ignore
      }
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.activeMessageId = null;
    this.currentChunkIndex = 0;
  }

  /**
   * Get ID of the currently speaking message.
   * 
   * @returns {string|null}
   */
  getActiveMessageId() {
    return this.activeMessageId;
  }

  /**
   * Check if speech synthesis is currently active.
   * 
   * @returns {boolean}
   */
  getIsPlaying() {
    return this.isPlaying;
  }
}

// Export singleton instance for app-wide use
export const speechSynthesisManager = new SpeechSynthesisManager();
