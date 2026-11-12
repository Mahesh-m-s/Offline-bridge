/**
 * OfflineBridge — Bilingual Speech Recognition (STT) Engine
 * 
 * Implements browser Web Speech API (SpeechRecognition / webkitSpeechRecognition)
 * with robust diagnostics, permission pre-flighting, Brave Shield detection,
 * and clear, actionable bilingual error handling.
 * 
 * BCP-47 Code-Switching Constraint:
 * The browser Web Speech API binds to a single language tag per active recognition session.
 * For rural citizens who code-switch between Kannada and English, the engine provides
 * an active dialect selector ('kn-IN' / 'en-IN') and transcribes loan words phonetically.
 * 
 * Cloud Processing Disclosure:
 * Chromium SpeechRecognition streams audio to cloud speech recognition services (Google Cloud).
 * It does NOT perform local offline STT. If the device is offline or Brave Shields block Google
 * services, this engine gracefully informs the citizen and preserves typed input.
 */

/**
 * Diagnostic logger that strictly adheres to privacy rules:
 * NEVER logs audio buffers, speech transcripts, authentication tokens, or PII.
 * 
 * @param {string} event
 * @param {object} [details={}]
 */
function logDiagnostic(event, details = {}) {
  const sanitized = { ...details };
  // Privacy scrub: Ensure no text, audio, or credentials can ever be printed
  delete sanitized.transcript;
  delete sanitized.text;
  delete sanitized.audio;
  delete sanitized.token;
  delete sanitized.password;
  delete sanitized.phone;
  delete sanitized.name;

  console.info(`[OfflineBridge STT] ${event}:`, sanitized);
}

/**
 * Check if the current browser environment supports the Web Speech API.
 * 
 * @returns {boolean}
 */
export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Check if the current window origin is a Secure Context (HTTPS or localhost).
 * Modern browsers strictly block microphone access on insecure HTTP origins.
 * 
 * @returns {boolean}
 */
export function isSecureOrigin() {
  if (typeof window === 'undefined') return false;
  if (window.isSecureContext) return true;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}

/**
 * Detect whether the current browser is Brave.
 * Brave disables Google speech services by default, causing an immediate 'network' error
 * unless the citizen enables "Use Google services for speech recognition" in brave://settings/system.
 * 
 * @returns {Promise<boolean>}
 */
export async function isBraveBrowser() {
  if (typeof navigator === 'undefined') return false;
  try {
    return Boolean(navigator.brave && (await navigator.brave.isBrave()));
  } catch {
    return false;
  }
}

/**
 * Inspect microphone hardware presence and permission state without recording.
 * 
 * @returns {Promise<{ hasMediaDevices: boolean, permissionState: 'granted'|'prompt'|'denied'|'unknown', hasAudioDevice: boolean, isSecure: boolean }>}
 */
export async function inspectMicrophoneEnvironment() {
  if (typeof navigator === 'undefined') {
    return { hasMediaDevices: false, permissionState: 'unsupported', hasAudioDevice: false, isSecure: false };
  }

  const isSecure = isSecureOrigin();
  let permissionState = 'unknown';

  if (navigator.permissions && navigator.permissions.query) {
    try {
      const status = await navigator.permissions.query({ name: 'microphone' });
      permissionState = status.state; // 'granted', 'prompt', 'denied'
    } catch {
      permissionState = 'unknown';
    }
  }

  let hasAudioDevice = true;
  if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter((d) => d.kind === 'audioinput');
      if (devices.length > 0) {
        hasAudioDevice = mics.length > 0;
      }
    } catch {
      hasAudioDevice = true;
    }
  }

  return {
    hasMediaDevices: Boolean(navigator.mediaDevices),
    permissionState,
    hasAudioDevice,
    isSecure
  };
}

/**
 * Translate browser speech recognition error codes into citizen-friendly bilingual messages.
 * Distinguishes Brave Shields, offline states, microphone denials, and hardware absence.
 * 
 * @param {string} errCode
 * @param {boolean} [isKannada=false]
 * @param {object} [context={}]
 * @returns {string}
 */
export function translateSpeechError(errCode, isKannada = false, context = {}) {
  const isBrave = Boolean(context.isBrave);
  const isOffline = Boolean(context.isOffline || (typeof navigator !== 'undefined' && navigator.onLine === false));
  const isNonSecure = Boolean(context.isNonSecure || (typeof window !== 'undefined' && !isSecureOrigin()));

  switch (errCode) {
    case 'not-allowed':
    case 'service-not-allowed':
    case 'PERMISSION_DENIED':
      return isKannada
        ? 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿಯನ್ನು ನಿರಾಕರಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್ ವಿಳಾಸ ಪಟ್ಟಿಯ (URL) ಎಡಭಾಗದಲ್ಲಿರುವ ಲಾಕ್ ಅಥವಾ ಸೆಟ್ಟಿಂಗ್ಸ್ ಐಕಾನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿಸಿ.'
        : 'Microphone permission was denied. Please click the lock or settings icon in your browser address bar to allow microphone access.';

    case 'audio-capture':
    case 'NO_MICROPHONE_DEVICE':
      return isKannada
        ? 'ಯಾವುದೇ ಮೈಕ್ರೊಫೋನ್ ಪತ್ತೆಯಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಆಡಿಯೋ ಇನ್‌ಪುಟ್ ಸಾಧನವನ್ನು ಸಂಪರ್ಕಿಸಿ ಅಥವಾ ಕೆಳಗೆ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ.'
        : 'No microphone was found on this device. Please connect an audio input device or type your question below.';

    case 'no-speech':
      return isKannada
        ? 'ಯಾವುದೇ ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೈಕ್ರೊಫೋನ್ ಬಟನ್ ಒತ್ತಿ ಪುನಃ ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ.'
        : 'No speech detected. Please tap the microphone and speak clearly.';

    case 'UNSUPPORTED_BROWSER':
      return isKannada
        ? 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು Google Chrome, Microsoft Edge ಅಥವಾ Android ಬ್ರೌಸರ್ ಬಳಸಿ.'
        : 'Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or an Android browser.';

    case 'language-not-supported':
      return isKannada
        ? 'ಆಯ್ಕೆ ಮಾಡಿದ ಭಾಷೆ (ಕನ್ನಡ/English) ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು Google Chrome ಅಥವಾ Edge ಬಳಸಿ.'
        : 'The selected speech language is not supported by this browser engine. Please use Google Chrome or Edge.';

    case 'INSECURE_CONTEXT':
      return isKannada
        ? 'ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶಕ್ಕೆ HTTPS ಅಥವಾ localhost ಅಗತ್ಯವಿದೆ. ದಯವಿಟ್ಟು ಸುರಕ್ಷಿತ ಸಂಪರ್ಕದಲ್ಲಿ ಬಳಸಿ.'
        : 'Microphone access is blocked on insecure HTTP origins. Please open OfflineBridge over HTTPS or localhost.';

    case 'network':
      if (isNonSecure) {
        return isKannada
          ? 'ಮೈಕ್ರೊಫೋನ್ ಪ್ರವೇಶಕ್ಕೆ HTTPS ಅಥವಾ localhost ಅಗತ್ಯವಿದೆ. ದಯವಿಟ್ಟು ಸುರಕ್ಷಿತ ಸಂಪರ್ಕದಲ್ಲಿ ಬಳಸಿ.'
          : 'Microphone access is blocked on insecure HTTP origins. Please open OfflineBridge over HTTPS or localhost.';
      }
      if (isBrave) {
        return isKannada
          ? 'Brave ಬ್ರೌಸರ್ Google ಧ್ವನಿ ಸೇವೆಯನ್ನು ನಿರ್ಬಂಧಿಸುತ್ತದೆ. brave://settings/system ನಲ್ಲಿ "Google ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ" ಸಕ್ರಿಯಗೊಳಿಸಿ ಅಥವಾ Chrome/Edge ಬಳಸಿ. ನೀವು ಕೆಳಗೆ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಬಹುದು.'
          : 'Brave browser blocks Google speech services by default. Please enable "Use Google services for speech recognition" in brave://settings/system, or use Google Chrome / Edge. You can also type your question below.';
      }
      if (isOffline) {
        return isKannada
          ? 'ಧ್ವನಿ ಇನ್‌ಪುಟ್‌ಗೆ ಇಂಟರ್ನೆಟ್ ಅಥವಾ ನೆಟ್‌ವರ್ಕ್ ಸಂಪರ್ಕದ ಅಗತ್ಯವಿದೆ (ಧ್ವನಿ ಸಂಸ್ಕರಣೆ ಕ್ಲೌಡ್ ಆಧಾರಿತವಾಗಿದೆ). ನೀವು ಕೆಳಗೆ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಬಹುದು.'
          : 'Voice recognition requires an active internet connection (speech-to-text requires cloud processing). You can type your question in the input box below.';
      }
      return isKannada
        ? 'ಬ್ರೌಸರ್‌ನ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಸರ್ವರ್ ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ (Brave ಅಥವಾ ನೆಟ್‌ವರ್ಕ್ ನಿರ್ಬಂಧಿಸಿದೆ). ದಯವಿಟ್ಟು Chrome ಬಳಸಿ ಅಥವಾ ಕೆಳಗೆ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ.'
        : 'Speech recognition service is unreachable (cloud STT service blocked by Brave Shields or network firewall). Please check brave://settings/system, use Chrome/Edge, or type your question below.';

    case 'aborted':
      return '';

    default:
      return isKannada
        ? `ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ದೋಷ: ${errCode}. ನೀವು ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಬಹುದು.`
        : `Voice recognition error: ${errCode}. You can continue by typing your question below.`;
  }
}

/**
 * Safely merge accumulated and newly recognized transcripts without duplication.
 * Preserves Kannada Unicode, English text, and sentence boundaries.
 * 
 * @param {string} base
 * @param {string} addition
 * @returns {string}
 */
export function mergeTranscripts(base = '', addition = '') {
  const trimmedBase = (base || '').trim();
  const trimmedAdd = (addition || '').trim();
  if (!trimmedBase) return trimmedAdd;
  if (!trimmedAdd) return trimmedBase;

  // If base already contains addition at the very end, do not duplicate
  if (trimmedBase.endsWith(trimmedAdd)) {
    return trimmedBase;
  }

  // Word-level suffix matching to prevent overlapping phrase duplicates
  const baseWords = trimmedBase.split(/\s+/);
  const addWords = trimmedAdd.split(/\s+/);

  let maxOverlap = 0;
  const maxCheck = Math.min(baseWords.length, addWords.length);
  for (let len = maxCheck; len > 0; len--) {
    const baseSlice = baseWords.slice(baseWords.length - len).join(' ');
    const addSlice = addWords.slice(0, len).join(' ');
    if (baseSlice.toLowerCase() === addSlice.toLowerCase()) {
      maxOverlap = len;
      break;
    }
  }

  if (maxOverlap > 0) {
    const nonOverlapping = addWords.slice(maxOverlap).join(' ');
    return nonOverlapping ? `${trimmedBase} ${nonOverlapping}` : trimmedBase;
  }

  return `${trimmedBase} ${trimmedAdd}`;
}

/**
 * Advanced Continuous Bilingual Speech Recognition Controller
 * 
 * Implements:
 * - Continuous listening (continuous = true, interimResults = true)
 * - Controlled automatic session restart on unexpected browser cutoff / silence
 * - Accumulated transcript preservation across session restarts and language changes
 * - Manual edit synchronization so user typing is not wiped out
 * - Language switching ('kn-IN' <-> 'en-IN') preserving existing speech history
 * - Finite retry limits (prevents infinite loops on persistent errors)
 * - Safe lifecycle destruction for unmount and chatbot closure
 */
export class SpeechRecognitionManager {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.desiredListening = false;
    this.isExplicitlyStopped = true;
    this.currentLanguage = 'kn-IN';

    // Callbacks
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
    this.onStartCallback = null;
    this.onRestartCallback = null;

    // Accumulated and active transcript buffers
    this.accumulatedFinal = '';
    this.currentSessionFinal = '';
    this.interimTranscript = '';

    // Reliability & Restart control
    this.isBrave = false;
    this.consecutiveRestarts = 0;
    this.maxRestartsWithoutSpeech = 4;
    this.restartTimeoutId = null;
    this.isRestarting = false;
    this.isStarting = false;
  }

  /**
   * Initialize and start a continuous speech recognition session.
   * 
   * @param {object} options
   * @param {'kn-IN'|'en-IN'} [options.language='kn-IN'] - BCP-47 language tag
   * @param {string} [options.initialText=''] - Existing text to preserve/append to
   * @param {function} options.onResult - Receives { transcript, accumulatedFinal, interim, isFinal }
   * @param {function} [options.onError] - Receives { code, message, isBrave, fatal }
   * @param {function} [options.onEnd] - Invoked when recording completely stops
   * @param {function} [options.onStart] - Invoked when microphone starts capturing
   * @param {function} [options.onRestart] - Invoked when session automatically reconnects
   * @returns {Promise<boolean>}
   */
  async start({
    language = 'kn-IN',
    initialText = '',
    onResult,
    onError,
    onEnd,
    onStart,
    onRestart
  } = {}) {
    if (this.isStarting) return false;
    this.isStarting = true;

    try {
      this.desiredListening = true;
      this.isExplicitlyStopped = false;
      this.consecutiveRestarts = 0;
      this.currentLanguage = language;
      this.onResultCallback = onResult;
      this.onErrorCallback = onError;
      this.onEndCallback = onEnd;
      this.onStartCallback = onStart;
      this.onRestartCallback = onRestart;

      // Seed transcript with any initial text already present in input
      this.accumulatedFinal = (initialText || '').trim();
      this.currentSessionFinal = '';
      this.interimTranscript = '';

      // Clear any pending restart timers
      this.clearRestartTimer();

      // Stop existing recognition if active
      if (this.recognition) {
        try {
          this.recognition.onend = null;
          this.recognition.onerror = null;
          this.recognition.abort();
        } catch {}
        this.recognition = null;
      }

      // 1. Check browser API support
      const isSupported = isSpeechRecognitionSupported();
      const isSecure = isSecureOrigin();
      this.isBrave = await isBraveBrowser();

      logDiagnostic('PRE_FLIGHT_CHECK', {
        browserSupported: isSupported,
        isSecureContext: isSecure,
        isBrave: this.isBrave,
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
        requestedLanguage: language
      });

      if (!isSupported) {
        this.desiredListening = false;
        this.isExplicitlyStopped = true;
        if (this.onErrorCallback) {
          this.onErrorCallback({
            code: 'UNSUPPORTED_BROWSER',
            message: translateSpeechError('UNSUPPORTED_BROWSER', language === 'kn-IN'),
            fatal: true
          });
        }
        return false;
      }

      if (!isSecure) {
        this.desiredListening = false;
        this.isExplicitlyStopped = true;
        if (this.onErrorCallback) {
          this.onErrorCallback({
            code: 'INSECURE_CONTEXT',
            message: translateSpeechError('INSECURE_CONTEXT', language === 'kn-IN', { isNonSecure: true }),
            fatal: true
          });
        }
        return false;
      }

      // 2. Pre-flight microphone permission and device inspection
      const { permissionState, hasAudioDevice } = await inspectMicrophoneEnvironment();
      logDiagnostic('HARDWARE_AND_PERMISSION_STATUS', { permissionState, hasAudioDevice });

      if (!hasAudioDevice) {
        this.desiredListening = false;
        this.isExplicitlyStopped = true;
        if (this.onErrorCallback) {
          this.onErrorCallback({
            code: 'NO_MICROPHONE_DEVICE',
            message: translateSpeechError('NO_MICROPHONE_DEVICE', language === 'kn-IN'),
            fatal: true
          });
        }
        return false;
      }

      if (permissionState === 'denied') {
        this.desiredListening = false;
        this.isExplicitlyStopped = true;
        if (this.onErrorCallback) {
          this.onErrorCallback({
            code: 'not-allowed',
            message: translateSpeechError('not-allowed', language === 'kn-IN'),
            fatal: true
          });
        }
        return false;
      }

      // 3. Prompt user media permission if state is 'prompt'
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia && permissionState === 'prompt') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
          logDiagnostic('MEDIA_STREAM_PERMISSION_GRANTED');
        } catch (mediaErr) {
          logDiagnostic('MEDIA_STREAM_PERMISSION_REJECTED', { name: mediaErr.name });
          if (mediaErr.name === 'NotAllowedError' || mediaErr.name === 'PermissionDeniedError') {
            this.desiredListening = false;
            this.isExplicitlyStopped = true;
            if (this.onErrorCallback) {
              this.onErrorCallback({
                code: 'not-allowed',
                message: translateSpeechError('not-allowed', language === 'kn-IN'),
                fatal: true
              });
            }
            return false;
          }
        }
      }

      return this.initiateRecognitionSession();
    } finally {
      this.isStarting = false;
    }
  }

  /**
   * Internal session initiator with event handlers, continuous accumulation and restart logic.
   * 
   * @returns {boolean}
   */
  initiateRecognitionSession() {
    if (!this.desiredListening || this.isExplicitlyStopped) {
      return false;
    }

    const SpeechRecognition = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    if (!SpeechRecognition) {
      return false;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = this.currentLanguage;
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.isRestarting = false;
        logDiagnostic('RECOGNITION_SESSION_STARTED', {
          language: this.currentLanguage,
          isBrave: this.isBrave,
          continuous: true
        });
        if (this.onStartCallback) {
          this.onStartCallback({
            language: this.currentLanguage,
            accumulatedTranscript: this.getFullTranscript()
          });
        }
      };

      this.recognition.onresult = (event) => {
        let sessionFinal = '';
        let interimText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';

          if (result.isFinal) {
            sessionFinal = mergeTranscripts(sessionFinal, text);
          } else {
            interimText = (interimText + ' ' + text).trim();
          }
        }

        // On successful speech recognition, reset restart counter
        if (sessionFinal || interimText) {
          this.consecutiveRestarts = 0;
        }

        if (sessionFinal) {
          this.currentSessionFinal = mergeTranscripts(this.currentSessionFinal, sessionFinal);
        }
        this.interimTranscript = interimText;

        const currentFinal = mergeTranscripts(this.accumulatedFinal, this.currentSessionFinal);
        const combined = interimText ? `${currentFinal} ${interimText}`.trim() : currentFinal;

        if (this.onResultCallback) {
          this.onResultCallback({
            transcript: combined,
            accumulatedFinal: currentFinal,
            interim: interimText,
            isFinal: Boolean(sessionFinal)
          });
        }
      };

      this.recognition.onerror = (event) => {
        const errCode = event.error;

        if (errCode === 'aborted') {
          logDiagnostic('RECOGNITION_ABORTED');
          return;
        }

        logDiagnostic('RECOGNITION_ERROR_OCCURRED', {
          errorType: errCode,
          language: this.currentLanguage,
          isBrave: this.isBrave,
          desiredListening: this.desiredListening,
          consecutiveRestarts: this.consecutiveRestarts
        });

        // Fatal errors: Stop immediately and do NOT restart
        const fatalErrors = [
          'not-allowed',
          'service-not-allowed',
          'PERMISSION_DENIED',
          'audio-capture',
          'NO_MICROPHONE_DEVICE',
          'language-not-supported'
        ];

        if (fatalErrors.includes(errCode)) {
          this.desiredListening = false;
          this.isExplicitlyStopped = true;
          this.clearRestartTimer();
          const msg = translateSpeechError(errCode, this.currentLanguage === 'kn-IN', {
            isBrave: this.isBrave,
            isOffline: typeof navigator !== 'undefined' ? navigator.onLine === false : false,
            isNonSecure: !isSecureOrigin()
          });
          if (this.onErrorCallback) {
            this.onErrorCallback({ code: errCode, message: msg, fatal: true });
          }
          return;
        }

        // Network error handling (Brave Shields or offline)
        if (errCode === 'network') {
          const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
          // In Brave or offline, abort immediately to prevent infinite restart loop
          if (this.isBrave || isOffline || this.consecutiveRestarts >= 1) {
            this.desiredListening = false;
            this.isExplicitlyStopped = true;
            this.clearRestartTimer();
            const msg = translateSpeechError(errCode, this.currentLanguage === 'kn-IN', {
              isBrave: this.isBrave,
              isOffline,
              isNonSecure: !isSecureOrigin()
            });
            if (this.onErrorCallback) {
              this.onErrorCallback({ code: errCode, message: msg, fatal: true });
            }
            return;
          }
        }

        // no-speech error: In continuous mode, Chrome fires 'no-speech' on silence.
        // If desiredListening is active, onend will cleanly restart the session.
        if (errCode === 'no-speech') {
          if (!this.desiredListening || this.isExplicitlyStopped) {
            const msg = translateSpeechError('no-speech', this.currentLanguage === 'kn-IN');
            if (this.onErrorCallback) {
              this.onErrorCallback({ code: 'no-speech', message: msg, fatal: false });
            }
          }
          return;
        }

        // Generic error
        const msg = translateSpeechError(errCode, this.currentLanguage === 'kn-IN', {
          isBrave: this.isBrave,
          isOffline: typeof navigator !== 'undefined' ? navigator.onLine === false : false,
          isNonSecure: !isSecureOrigin()
        });
        if (this.onErrorCallback) {
          this.onErrorCallback({ code: errCode, message: msg, fatal: false });
        }
      };

      this.recognition.onend = () => {
        logDiagnostic('RECOGNITION_SESSION_ENDED', {
          language: this.currentLanguage,
          desiredListening: this.desiredListening,
          isExplicitlyStopped: this.isExplicitlyStopped,
          consecutiveRestarts: this.consecutiveRestarts
        });

        // Commit current session's final and any interim text into accumulatedFinal
        this.commitSessionTranscripts();

        // Check if continuous listening should automatically restart the session
        if (this.desiredListening && !this.isExplicitlyStopped) {
          if (this.consecutiveRestarts >= this.maxRestartsWithoutSpeech) {
            logDiagnostic('MAX_RESTARTS_EXCEEDED', { attempts: this.consecutiveRestarts });
            this.desiredListening = false;
            this.isExplicitlyStopped = true;
            this.isListening = false;
            const errCode = 'RESTART_LIMIT_REACHED';
            const msg = this.currentLanguage === 'kn-IN'
              ? 'ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಅವಧಿ ಮುಕ್ತಾಯಗೊಂಡಿದೆ. ಮುಂದುವರಿಸಲು ಮೈಕ್ರೊಫೋನ್ ಅನ್ನು ಪುನಃ ಒತ್ತಿ ಅಥವಾ ಕೆಳಗೆ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ.'
              : 'Voice recognition session timed out. Tap the microphone again to resume or type your question below.';
            if (this.onErrorCallback) {
              this.onErrorCallback({ code: errCode, message: msg, fatal: false });
            }
            if (this.onEndCallback) this.onEndCallback();
            return;
          }

          // Schedule a controlled restart
          this.consecutiveRestarts++;
          this.isRestarting = true;
          this.clearRestartTimer();

          const delay = Math.min(80 * this.consecutiveRestarts, 400);
          this.restartTimeoutId = setTimeout(() => {
            if (this.desiredListening && !this.isExplicitlyStopped) {
              logDiagnostic('AUTO_RESTARTING_SESSION', {
                attempt: this.consecutiveRestarts,
                language: this.currentLanguage
              });
              if (this.onRestartCallback) {
                this.onRestartCallback({
                  attempt: this.consecutiveRestarts,
                  language: this.currentLanguage
                });
              }
              this.initiateRecognitionSession();
            }
          }, delay);
        } else {
          // User explicitly stopped or fatal error stopped it
          this.isListening = false;
          this.isRestarting = false;
          if (this.onEndCallback) this.onEndCallback();
        }
      };

      this.recognition.start();
      return true;
    } catch (err) {
      logDiagnostic('INITIATE_SESSION_EXCEPTION', { message: err.message });
      if (this.desiredListening && !this.isExplicitlyStopped && this.consecutiveRestarts < this.maxRestartsWithoutSpeech) {
        this.consecutiveRestarts++;
        this.restartTimeoutId = setTimeout(() => {
          this.initiateRecognitionSession();
        }, 250);
        return true;
      }

      this.desiredListening = false;
      this.isListening = false;
      if (this.onErrorCallback) {
        this.onErrorCallback({
          code: 'INITIALIZATION_FAILED',
          message: err.message || 'Could not start microphone session.',
          fatal: true
        });
      }
      return false;
    }
  }

  /**
   * Commit current session finals and interim into accumulatedFinal.
   */
  commitSessionTranscripts() {
    if (this.currentSessionFinal) {
      this.accumulatedFinal = mergeTranscripts(this.accumulatedFinal, this.currentSessionFinal);
      this.currentSessionFinal = '';
    }
    if (this.interimTranscript) {
      this.accumulatedFinal = mergeTranscripts(this.accumulatedFinal, this.interimTranscript);
      this.interimTranscript = '';
    }
  }

  /**
   * Get the full transcript (accumulated final + current interim).
   * 
   * @returns {string}
   */
  getFullTranscript() {
    const currentFinal = mergeTranscripts(this.accumulatedFinal, this.currentSessionFinal);
    return this.interimTranscript
      ? `${currentFinal} ${this.interimTranscript}`.trim()
      : currentFinal;
  }

  /**
   * Get all finalized text accumulated so far.
   * 
   * @returns {string}
   */
  getAccumulatedTranscript() {
    return mergeTranscripts(this.accumulatedFinal, this.currentSessionFinal);
  }

  /**
   * Update the accumulated transcript when the citizen edits the text input manually.
   * Prevents subsequent voice results from wiping out manual user changes.
   * 
   * @param {string} text
   */
  setAccumulatedTranscript(text) {
    this.accumulatedFinal = (text || '').trim();
    this.currentSessionFinal = '';
    this.interimTranscript = '';
  }

  /**
   * Switch recognition language mid-session ('kn-IN' <-> 'en-IN')
   * preserving the accumulated transcript across sessions.
   * 
   * @param {'kn-IN'|'en-IN'} newLang
   */
  switchLanguage(newLang) {
    if (this.currentLanguage === newLang) return;
    this.currentLanguage = newLang;
    logDiagnostic('SWITCH_LANGUAGE', { newLanguage: newLang });

    if (this.isListening || this.desiredListening) {
      this.commitSessionTranscripts();
      this.clearRestartTimer();
      if (this.recognition) {
        try {
          this.recognition.onend = null;
          this.recognition.stop();
        } catch {}
        this.recognition = null;
      }
      this.initiateRecognitionSession();
    }
  }

  /**
   * Stop the active speech recognition session cleanly and prevent auto-restarts.
   */
  stop() {
    this.desiredListening = false;
    this.isExplicitlyStopped = true;
    this.clearRestartTimer();
    this.commitSessionTranscripts();
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
    this.isListening = false;
    this.isRestarting = false;
    logDiagnostic('RECOGNITION_STOPPED_BY_USER');
  }

  /**
   * Abort the active session immediately without dispatching remaining events.
   */
  abort() {
    this.desiredListening = false;
    this.isExplicitlyStopped = true;
    this.clearRestartTimer();
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }
    this.isListening = false;
    this.isRestarting = false;
    logDiagnostic('RECOGNITION_ABORTED_BY_USER');
  }

  /**
   * Safely clean up instance state on component unmount or chatbot closure.
   */
  destroy() {
    this.stop();
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
    this.onStartCallback = null;
    this.onRestartCallback = null;
    this.accumulatedFinal = '';
    this.currentSessionFinal = '';
    this.interimTranscript = '';
  }

  /**
   * Clear any scheduled auto-restart timer.
   */
  clearRestartTimer() {
    if (this.restartTimeoutId) {
      clearTimeout(this.restartTimeoutId);
      this.restartTimeoutId = null;
    }
  }

  /**
   * Check if recording is currently active.
   * 
   * @returns {boolean}
   */
  getIsListening() {
    return this.isListening;
  }

  /**
   * Check if user has requested listening to be active.
   * 
   * @returns {boolean}
   */
  getDesiredListening() {
    return this.desiredListening;
  }

  /**
   * Get the active recognition language.
   * 
   * @returns {'kn-IN'|'en-IN'}
   */
  getLanguage() {
    return this.currentLanguage;
  }
}

// Export singleton instance for app-wide use
export const speechRecognition = new SpeechRecognitionManager();
