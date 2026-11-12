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
 * Speech Recognition Controller
 * Manages recognition sessions, interim streaming, permission pre-flighting, and diagnostics.
 */
class SpeechRecognitionManager {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.currentLanguage = 'kn-IN';
    this.onResultCallback = null;
    this.onErrorCallback = null;
    this.onEndCallback = null;
    this.onStartCallback = null;
    this.isBrave = false;
  }

  /**
   * Initialize and start a speech recognition session with pre-flight diagnostics.
   * 
   * @param {object} options
   * @param {'kn-IN'|'en-IN'} [options.language='kn-IN'] - BCP-47 language tag
   * @param {function} options.onResult - Receives { transcript, isFinal }
   * @param {function} [options.onError] - Receives { code, message, isBrave }
   * @param {function} [options.onEnd] - Invoked when recognition stops
   * @param {function} [options.onStart] - Invoked when microphone starts capturing
   * @returns {Promise<boolean>} true if session successfully initiated
   */
  async start({ language = 'kn-IN', onResult, onError, onEnd, onStart } = {}) {
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
      if (onError) {
        onError({
          code: 'UNSUPPORTED_BROWSER',
          message: translateSpeechError('UNSUPPORTED_BROWSER', language === 'kn-IN')
        });
      }
      return false;
    }

    if (!isSecure) {
      if (onError) {
        onError({
          code: 'INSECURE_CONTEXT',
          message: translateSpeechError('INSECURE_CONTEXT', language === 'kn-IN', { isNonSecure: true })
        });
      }
      return false;
    }

    // 2. Pre-flight microphone permission and device inspection
    const { permissionState, hasAudioDevice } = await inspectMicrophoneEnvironment();
    logDiagnostic('HARDWARE_AND_PERMISSION_STATUS', { permissionState, hasAudioDevice });

    if (!hasAudioDevice) {
      if (onError) {
        onError({
          code: 'NO_MICROPHONE_DEVICE',
          message: translateSpeechError('NO_MICROPHONE_DEVICE', language === 'kn-IN')
        });
      }
      return false;
    }

    if (permissionState === 'denied') {
      if (onError) {
        onError({
          code: 'not-allowed',
          message: translateSpeechError('not-allowed', language === 'kn-IN')
        });
      }
      return false;
    }

    // 3. Prompt user media permission if state is 'prompt'
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia && permissionState === 'prompt') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release stream tracks immediately after permission granted
        stream.getTracks().forEach((track) => track.stop());
        logDiagnostic('MEDIA_STREAM_PERMISSION_GRANTED');
      } catch (mediaErr) {
        logDiagnostic('MEDIA_STREAM_PERMISSION_REJECTED', { name: mediaErr.name });
        if (mediaErr.name === 'NotAllowedError' || mediaErr.name === 'PermissionDeniedError') {
          if (onError) {
            onError({
              code: 'not-allowed',
              message: translateSpeechError('not-allowed', language === 'kn-IN')
            });
          }
          return false;
        }
      }
    }

    // 4. Stop any existing session
    if (this.isListening) {
      this.stop();
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    try {
      this.recognition = new SpeechRecognition();
      this.currentLanguage = language;
      this.onResultCallback = onResult;
      this.onErrorCallback = onError;
      this.onEndCallback = onEnd;
      this.onStartCallback = onStart;

      // Configure recognition session
      this.recognition.lang = language;
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      this.recognition.onstart = () => {
        this.isListening = true;
        logDiagnostic('RECOGNITION_SESSION_STARTED', {
          language: this.currentLanguage,
          isBrave: this.isBrave
        });
        if (this.onStartCallback) this.onStartCallback();
      };

      this.recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0]?.transcript || '';

          if (result.isFinal) {
            finalTranscript += text;
          } else {
            interimTranscript += text;
          }
        }

        const combined = (finalTranscript + ' ' + interimTranscript).trim();

        if (this.onResultCallback && combined) {
          this.onResultCallback({
            transcript: combined,
            final: finalTranscript.trim(),
            interim: interimTranscript.trim(),
            isFinal: Boolean(finalTranscript) && !interimTranscript
          });
        }
      };

      this.recognition.onerror = (event) => {
        const errCode = event.error;
        if (errCode === 'aborted') {
          logDiagnostic('RECOGNITION_ABORTED_BY_USER');
          return;
        }

        logDiagnostic('RECOGNITION_ERROR_OCCURRED', {
          errorType: errCode,
          language: this.currentLanguage,
          isBrave: this.isBrave,
          isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
        });

        const isKn = this.currentLanguage === 'kn-IN';
        const humanMessage = translateSpeechError(errCode, isKn, {
          isBrave: this.isBrave,
          isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
          isNonSecure: !isSecureOrigin()
        });

        if (this.onErrorCallback) {
          this.onErrorCallback({
            code: errCode,
            message: humanMessage,
            isBrave: this.isBrave
          });
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        logDiagnostic('RECOGNITION_SESSION_ENDED', { language: this.currentLanguage });
        if (this.onEndCallback) this.onEndCallback();
      };

      this.recognition.start();
      return true;
    } catch (err) {
      this.isListening = false;
      logDiagnostic('INITIALIZATION_EXCEPTION', { message: err.message });
      if (this.onErrorCallback) {
        this.onErrorCallback({
          code: 'INITIALIZATION_FAILED',
          message: err.message || 'Could not start microphone session.'
        });
      }
      return false;
    }
  }

  /**
   * Stop the active speech recognition session cleanly.
   */
  stop() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore if already stopped
      }
      this.recognition = null;
    }
    this.isListening = false;
  }

  /**
   * Abort the active session immediately without dispatching remaining events.
   */
  abort() {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // Ignore if already aborted
      }
      this.recognition = null;
    }
    this.isListening = false;
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
