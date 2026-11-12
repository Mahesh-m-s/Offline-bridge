import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  WifiOff,
  Bot,
  User,
  ShieldCheck,
  Building2,
  RefreshCw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api/apiClient';
import { isOnline, setupNetworkListeners } from '../registerServiceWorker';
import { speechRecognition, isSpeechRecognitionSupported } from '../utils/speechRecognition';
import { speechSynthesisManager, isSpeechSynthesisSupported } from '../utils/speechSynthesis';

export default function ArivuNetChatbot() {
  const { isKannada, toggleLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [online, setOnline] = useState(isOnline());
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState({});
  const [activeError, setActiveError] = useState(null);
  const [conversationId, setConversationId] = useState(null);

  // Bilingual Voice Assistant State
  const [isRecording, setIsRecording] = useState(false);
  const [speechLang, setSpeechLang] = useState(isKannada ? 'kn-IN' : 'en-IN');
  const [speechError, setSpeechError] = useState(null);
  const [interimText, setInterimText] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [activePlayingId, setActivePlayingId] = useState(null);
  const [voiceUnavailableNotice, setVoiceUnavailableNotice] = useState({});

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sync speech language when UI language changes (only if not actively recording)
  useEffect(() => {
    if (!isRecording) {
      setSpeechLang(isKannada ? 'kn-IN' : 'en-IN');
    }
  }, [isKannada, isRecording]);

  // Recording duration timer
  useEffect(() => {
    let timer = null;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecording]);

  // Clean up voice sessions when chatbot window closes
  useEffect(() => {
    if (!isOpen) {
      if (speechRecognition.getIsListening() || speechRecognition.getDesiredListening()) {
        speechRecognition.stop();
        setIsRecording(false);
        setInterimText('');
      }
      speechSynthesisManager.stop();
      setActivePlayingId(null);
    }
  }, [isOpen]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      speechRecognition.destroy();
      speechSynthesisManager.stop();
    };
  }, []);

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Voice Handlers
  const startRecording = async () => {
    setSpeechError(null);
    setInterimText('');
    setRecordingDuration(0);

    const started = await speechRecognition.start({
      language: speechLang,
      initialText: inputText,
      onStart: () => {
        setIsRecording(true);
      },
      onResult: ({ transcript, accumulatedFinal, interim }) => {
        setInputText(accumulatedFinal || transcript);
        setInterimText(interim || '');
      },
      onError: ({ message, fatal }) => {
        if (fatal) {
          setIsRecording(false);
          setInterimText('');
        }
        setSpeechError(message);
      },
      onEnd: () => {
        setIsRecording(false);
        setInterimText('');
      },
      onRestart: ({ attempt, language }) => {
        // Recognition reconnected automatically in background
      }
    });

    if (!started && !isSpeechRecognitionSupported()) {
      setSpeechError(
        isKannada
          ? 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು Chrome, Edge ಅಥವಾ Android ಬ್ರೌಸರ್ ಬಳಸಿ.'
          : 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or an Android browser.'
      );
    }
  };

  const stopRecording = () => {
    speechRecognition.stop();
    setIsRecording(false);
    setInterimText('');
  };

  const toggleVoiceRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const toggleSpeechLanguage = (targetLang = null) => {
    const nextLang = targetLang || (speechLang === 'kn-IN' ? 'en-IN' : 'kn-IN');
    setSpeechLang(nextLang);
    if (isRecording) {
      speechRecognition.switchLanguage(nextLang);
    }
  };

  const handleToggleSpeak = (msg) => {
    if (activePlayingId === msg.id) {
      speechSynthesisManager.stop();
      setActivePlayingId(null);
      return;
    }

    // Determine message language: check msg.language or Kannada Unicode code points
    const kannadaCharCount = (msg.text.match(/[\u0C80-\u0CFF]/g) || []).length;
    const lang = msg.language === 'kn' || kannadaCharCount >= 4 ? 'kn' : 'en';

    speechSynthesisManager.speak({
      messageId: msg.id,
      text: msg.text,
      language: lang,
      onStart: () => {
        setActivePlayingId(msg.id);
      },
      onEnd: () => {
        setActivePlayingId(null);
      },
      onError: () => {
        setActivePlayingId(null);
      },
      onVoiceUnavailable: () => {
        setActivePlayingId(null);
        setVoiceUnavailableNotice((prev) => ({
          ...prev,
          [msg.id]: isKannada
            ? 'ಈ ಸಾಧನದಲ್ಲಿ ಕನ್ನಡ ಧ್ವನಿ ಪ್ಯಾಕ್ ಸ್ಥಾಪಿಸಲಾಗಿಲ್ಲ. ಸಂಪೂರ್ಣ ವಿವರಗಳನ್ನು ಮೇಲಿನ ಪಠ್ಯದಲ್ಲಿ ಓದಬಹುದು.'
            : 'Kannada voice is not installed on this device. The verified answer is displayed as text above.'
        }));
      }
    });
  };

  // Network monitoring
  useEffect(() => {
    const cleanup = setupNetworkListeners((status) => {
      setOnline(status);
    });
    return cleanup;
  }, []);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: isKannada
            ? 'ನಮಸ್ಕಾರ! ನಾನು ಆಫ್‌ಲೈನ್‌ಬ್ರಿಡ್ಜ್ AI (OfflineBridge AI), ಕರ್ನಾಟಕ ಸರಕಾರದ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು, ವಿದ್ಯಾರ್ಥಿವೇತನ, ರೈತ ಸಹಾಯಧನ, ಸಾಮಾಜಿಕ ಪಿಂಚಣಿ ಮತ್ತು ನಾಗರಿಕ ಸೇವೆಗಳ ಬಗ್ಗೆ ನಿಮಗೆ ಅಧಿಕೃತ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತೇನೆ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?'
            : 'Namaskara! I am OfflineBridge AI, your guide for Karnataka Government welfare schemes, scholarships, farmer subsidies, pensions, and citizen services. How can I help you today?',
          sources: [],
          confidence: 'high',
          timestamp: new Date()
        }
      ]);
    }
  }, [isKannada]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Suggested questions in English and Kannada
  const suggestedQuestions = isKannada
    ? [
        'ಕರ್ನಾಟಕದ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಯಾವ ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು ಲಭ್ಯವಿದೆ?',
        'ಯುವ ನಿಧಿ ಯೋಜನೆಗೆ ಅರ್ಹತಾ ಮಾನದಂಡಗಳು ಯಾವುವು?',
        'ಸಂಧ್ಯಾ ಸುರಕ್ಷಾ ಪಿಂಚಣಿಗೆ ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?',
        'ರೈತ ಸಿರಿ ಯೋಜನೆಯಡಿ ಬೀಜ ಸಹಾಯಧನ ಪಡೆಯುವುದು ಹೇಗೆ?',
        'ನನ್ನ ಸರಕಾರಿ ಅರ್ಜಿಯ ಸ್ಥಿತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡುವುದು ಹೇಗೆ?'
      ]
    : [
        'What scholarships are available for Karnataka students?',
        'What are the eligibility conditions for Yuva Nidhi?',
        'What documents are required for Sandhya Suraksha pension?',
        'How can I apply for farmer seed subsidy (Raitha Siri)?',
        'How can I track my government application?'
      ];

  const handleSendMessage = async (queryText = null) => {
    // Stop active recording and commit transcript when sending
    if (isRecording) {
      stopRecording();
    }
    speechSynthesisManager.stop();
    setActivePlayingId(null);

    const committedText = speechRecognition.getFullTranscript() || inputText;
    const textToSend = (queryText || committedText).trim();
    if (!textToSend || isLoading) return;

    setActiveError(null);
    setInputText('');
    setInterimText('');
    speechRecognition.setAccumulatedTranscript('');

    const userMessageId = `msg-${Date.now()}`;
    const newMessages = [
      ...messages,
      {
        id: userMessageId,
        sender: 'user',
        text: textToSend,
        timestamp: new Date()
      }
    ];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await apiClient.post('/api/rag/chat', {
        question: textToSend,
        language: 'auto', // Allow backend to detect explicit directives, Kanglish, and scripts
        conversationId
      });

      if (response.success && response.data) {
        const { answer, sources, confidence, conversationId: newConvId } = response.data;
        if (newConvId) setConversationId(newConvId);

        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            text: answer,
            sources: sources || [],
            confidence: confidence || 'medium',
            timestamp: new Date()
          }
        ]);
      } else {
        const errorMsg = response.error?.message || (isKannada
          ? 'ಪ್ರತಿಕ್ರಿಯೆ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಪುನಃ ಪ್ರಯತ್ನಿಸಿ.'
          : 'Unable to get an answer from OfflineBridge AI. Please try again.');

        setActiveError({
          text: errorMsg,
          lastQuestion: textToSend
        });

        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'assistant',
            isError: true,
            text: errorMsg,
            sources: [],
            timestamp: new Date()
          }
        ]);
      }
    } catch (err) {
      const fallbackError = isKannada
        ? 'ಸರ್ವರ್ ಸಂಪರ್ಕ ವಿಫಲವಾಗಿದೆ. ನೆಟ್‌ವರ್ಕ್ ಪರಿಶೀಲಿಸಿ.'
        : 'Network or server error. Please check your connectivity.';
      setActiveError({
        text: fallbackError,
        lastQuestion: textToSend
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          isError: true,
          text: fallbackError,
          sources: [],
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    speechSynthesisManager.stop();
    setActivePlayingId(null);
    if (isRecording) {
      stopRecording();
    }
    setVoiceUnavailableNotice({});
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: isKannada
          ? 'ಚಾಟ್ ಇತಿಹಾಸವನ್ನು ತೆರವುಗೊಳಿಸಲಾಗಿದೆ. ನೀವು ಹೊಸ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಬಹುದು.'
          : 'Conversation cleared. How can I assist you with Karnataka government schemes?',
        sources: [],
        confidence: 'high',
        timestamp: new Date()
      }
    ]);
    setActiveError(null);
    setConversationId(null);
  };

  const toggleSourceExpand = (msgId) => {
    setExpandedSources((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  return (
    <>
      {/* 1. FLOATING CHATBOT BUTTON */}
      <div
        className="arivunet-floating-chatbot-trigger"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Close OfflineBridge AI Chatbot' : 'Open OfflineBridge AI Chatbot'}
          title={isKannada ? 'ಆಫ್‌ಲೈನ್‌ಬ್ರಿಡ್ಜ್ AI ಸಹಾಯ' : 'Ask OfflineBridge AI'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            borderRadius: '9999px',
            backgroundColor: '#092c57',
            backgroundImage: 'linear-gradient(135deg, #092c57 0%, #1e3a8a 60%, #4c1d95 100%)',
            color: '#ffffff',
            border: '2px solid #f59e0b',
            boxShadow: '0 8px 24px rgba(9, 44, 87, 0.35)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.92rem',
            letterSpacing: '0.02em',
            transition: 'all 0.25s ease'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
              color: '#092c57'
            }}
          >
            <Sparkles size={16} />
          </div>
          <span>{isKannada ? 'ಆಫ್‌ಲೈನ್‌ಬ್ರಿಡ್ಜ್ AI ಸಹಾಯ' : 'Ask OfflineBridge AI'}</span>
          {isOpen ? <X size={16} style={{ marginLeft: '4px' }} /> : null}
        </button>
      </div>

      {/* 2. RESPONSIVE CHATBOT DRAWER / MODAL */}
      {isOpen && (
        <div
          className="arivunet-chatbot-panel"
          role="dialog"
          aria-label="OfflineBridge AI Assistant"
          style={{
            position: 'fixed',
            bottom: '82px',
            right: '24px',
            width: '420px',
            maxWidth: 'calc(100vw - 32px)',
            height: '620px',
            maxHeight: 'calc(100vh - 120px)',
            backgroundColor: 'var(--surface-white, #ffffff)',
            borderRadius: '16px',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.22)',
            border: '1px solid #cbd5e1',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1000
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: '#092c57',
              color: '#ffffff',
              borderBottom: '3px solid #f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: '#f59e0b',
                  color: '#092c57',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#ffffff' }}>
                  {isKannada ? 'ಆಫ್‌ಲೈನ್‌ಬ್ರಿಡ್ಜ್ AI ಸಹಾಯಕ' : 'OfflineBridge AI Assistant'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#cbd5e1' }}>
                  {isKannada ? 'ಕರ್ನಾಟಕ ಸರಕಾರಿ ಯೋಜನೆಗಳ ಅಧಿಕೃತ ಮಾಹಿತಿ' : 'Grounded Karnataka Scheme Guidance'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Language Switch */}
              <button
                type="button"
                onClick={toggleLanguage}
                title="Switch Language / ಭಾಷೆ ಬದಲಿಸಿ"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isKannada ? 'English' : 'ಕನ್ನಡ'}
              </button>

              {/* Reset History */}
              <button
                type="button"
                onClick={handleClearChat}
                title={isKannada ? 'ಚಾಟ್ ತೆರವುಗೊಳಿಸಿ' : 'Clear chat'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <RotateCcw size={16} />
              </button>

              {/* Close Window */}
              <button
                type="button"
                onClick={() => {
                  if (isRecording) stopRecording();
                  speechSynthesisManager.stop();
                  setActivePlayingId(null);
                  setIsOpen(false);
                }}
                aria-label="Close chat"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Network Alert (Offline) */}
          {!online && (
            <div
              style={{
                backgroundColor: '#fffbeb',
                color: '#92400e',
                padding: '8px 12px',
                fontSize: '0.76rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: '1px solid #fef3c7'
              }}
            >
              <WifiOff size={14} />
              <span>
                {isKannada
                  ? 'ಆಫ್‌ಲೈನ್: ನೇರ AI ಪ್ರಶ್ನೋತ್ತರಕ್ಕೆ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಬೇಕು.'
                  : 'Offline: Live AI responses require network connectivity.'}
              </span>
            </div>
          )}

          {/* Chat Messages Body */}
          <div
            style={{
              flex: 1,
              padding: '16px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: 'var(--bg-body, #f8fafc)'
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isExpanded = Boolean(expandedSources[msg.id]);

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: '100%'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      maxWidth: '88%',
                      flexDirection: isUser ? 'row-reverse' : 'row'
                    }}
                  >
                    {/* Avatar Icon */}
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: isUser ? '#1e3a8a' : '#f59e0b',
                        color: isUser ? '#ffffff' : '#092c57',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      {isUser ? <User size={14} /> : <Bot size={14} />}
                    </div>

                    {/* Bubble Content */}
                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        backgroundColor: isUser ? '#092c57' : '#ffffff',
                        color: isUser ? '#ffffff' : '#0f172a',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                        border: isUser ? 'none' : '1px solid #e2e8f0',
                        fontSize: '0.86rem',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}
                    >
                      {msg.text}

                      {/* Speaker / Voice Playback Button for Assistant */}
                      {!isUser && !msg.isError && (
                        <div
                          style={{
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            flexWrap: 'wrap'
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleSpeak(msg)}
                            aria-label={activePlayingId === msg.id ? 'Stop listening' : 'Listen to answer'}
                            title={activePlayingId === msg.id ? 'Stop audio' : (isKannada ? 'ಉತ್ತರವನ್ನು ಆಲಿಸಿ' : 'Listen to answer')}
                            className={`ob-speaker-btn ${activePlayingId === msg.id ? 'ob-speaker-playing' : ''}`}
                          >
                            {activePlayingId === msg.id ? (
                              <>
                                <VolumeX size={13} color="#dc2626" />
                                <span style={{ color: '#dc2626' }}>{isKannada ? 'ನಿಲ್ಲಿಸಿ' : 'Stop'}</span>
                                <span className="ob-audio-wave">
                                  <span className="bar bar1"></span>
                                  <span className="bar bar2"></span>
                                  <span className="bar bar3"></span>
                                </span>
                              </>
                            ) : (
                              <>
                                <Volume2 size={13} color="#0284c7" />
                                <span>{isKannada ? 'ಉತ್ತರವನ್ನು ಆಲಿಸಿ' : 'Listen to Answer'}</span>
                              </>
                            )}
                          </button>

                          {voiceUnavailableNotice[msg.id] && (
                            <div className="ob-voice-notice">
                              {voiceUnavailableNotice[msg.id]}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Source references block for Assistant */}
                      {!isUser && msg.sources && msg.sources.length > 0 && (
                        <div
                          style={{
                            marginTop: '10px',
                            paddingTop: '8px',
                            borderTop: '1px solid #e2e8f0'
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => toggleSourceExpand(msg.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              color: '#0284c7'
                            }}
                          >
                            <FileText size={13} />
                            <span>
                              {isKannada
                                ? `ಅಧಿಕೃತ ಉಲ್ಲೇಖಗಳು (${msg.sources.length})`
                                : `Verified Sources (${msg.sources.length})`}
                            </span>
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>

                          {isExpanded && (
                            <div
                              style={{
                                marginTop: '6px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px'
                              }}
                            >
                              {msg.sources.map((src, sIdx) => (
                                <div
                                  key={sIdx}
                                  style={{
                                    backgroundColor: '#f1f5f9',
                                    padding: '6px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.72rem',
                                    borderLeft: '3px solid #0284c7'
                                  }}
                                >
                                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                                    {src.documentTitle}
                                  </div>
                                  <div style={{ color: '#475569', fontSize: '0.68rem' }}>
                                    {src.department} • {src.section}
                                  </div>
                                  {src.sourceUrl && (
                                    <a
                                      href={src.sourceUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        color: '#0284c7',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '3px',
                                        marginTop: '3px',
                                        textDecoration: 'none',
                                        fontSize: '0.68rem',
                                        fontWeight: 600
                                      }}
                                    >
                                      <span>{isKannada ? 'ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ' : 'Open Official Portal'}</span>
                                      <ExternalLink size={10} />
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: '#f59e0b',
                    color: '#092c57',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Bot size={14} />
                </div>
                <div
                  style={{
                    padding: '8px 14px',
                    borderRadius: '14px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    color: '#64748b'
                  }}
                >
                  <RefreshCw size={13} className="animate-spin" />
                  <span>
                    {isKannada
                      ? 'ಪರಿಶೀಲಿಸಿದ ಸರಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ...'
                      : 'Searching verified Karnataka schemes...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Questions Bar */}
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#f1f5f9',
              borderTop: '1px solid #e2e8f0',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              display: 'flex',
              gap: '6px'
            }}
          >
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '9999px',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  color: '#1e3a8a',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Active Voice Listening Banner */}
          {isRecording && (
            <div className="ob-listening-banner">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="ob-recording-indicator"></span>
                <span>
                  {isKannada
                    ? `ಆಲಿಸಲಾಗುತ್ತಿದೆ (${speechLang === 'kn-IN' ? 'ಕನ್ನಡ' : 'English'})... ಮಾತನಾಡಿ`
                    : `Listening (${speechLang === 'kn-IN' ? 'Kannada' : 'English'})... Speak now`}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={toggleSpeechLanguage}
                  style={{
                    background: 'none',
                    border: '1px solid #f87171',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '0.68rem',
                    color: '#991b1b',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                  title={speechLang === 'kn-IN' ? 'Switch to English voice input' : 'Switch to Kannada voice input'}
                >
                  {speechLang === 'kn-IN' ? 'Switch to English' : 'ಕನ್ನಡಕ್ಕೆ ಬದಲಿಸಿ'}
                </button>
                <button
                  type="button"
                  onClick={stopRecording}
                  style={{
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '2px 8px',
                    fontSize: '0.68rem',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 700
                  }}
                >
                  {isKannada ? 'ಮುಕ್ತಾಯ' : 'Done'}
                </button>
              </div>
            </div>
          )}

          {/* Voice Error Notice */}
          {speechError && (
            <div
              style={{
                padding: '6px 12px',
                backgroundColor: '#fffbeb',
                borderTop: '1px solid #fef3c7',
                fontSize: '0.74rem',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '6px'
              }}
            >
              <span>{speechError}</span>
              <button
                type="button"
                onClick={() => setSpeechError(null)}
                style={{ background: 'none', border: 'none', color: '#92400e', cursor: 'pointer', padding: 0 }}
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Active Continuous Recording Status Bar */}
          {isRecording && (
            <div
              role="status"
              aria-live="polite"
              className="ob-listening-banner"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 12px',
                backgroundColor: '#fef2f2',
                borderTop: '1px solid #fecaca',
                fontSize: '0.78rem',
                color: '#991b1b'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="ob-recording-indicator" />
                <span style={{ fontWeight: 600 }}>
                  {isKannada ? 'ಆಲಿಸಲಾಗುತ್ತಿದೆ...' : 'Listening...'}
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#dc2626' }}>
                  {formatDuration(recordingDuration)}
                </span>
                {/* Language Switcher Badge */}
                <button
                  type="button"
                  onClick={() => toggleSpeechLanguage()}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    border: '1px solid #f87171',
                    backgroundColor: '#ffffff',
                    color: '#b91c1c',
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: 600
                  }}
                  title={isKannada ? 'ಧ್ವನಿ ಭಾಷೆ ಬದಲಾಯಿಸಿ' : 'Switch speech language'}
                >
                  {speechLang === 'kn-IN' ? 'ಕನ್ನಡ (kn-IN)' : 'English (en-IN)'} ⇄
                </button>
              </div>

              {/* Stop Recording Button */}
              <button
                type="button"
                onClick={stopRecording}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 9px',
                  borderRadius: '6px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                aria-label="Stop recording"
              >
                <Square size={12} fill="#ffffff" />
                <span>{isKannada ? 'ಮುಕ್ತಾಯ' : 'Done'}</span>
              </button>
            </div>
          )}

          {/* Live Interim Transcript Preview */}
          {interimText && (
            <div
              aria-live="polite"
              style={{
                padding: '4px 14px',
                backgroundColor: '#f0f9ff',
                borderTop: '1px dashed #bae6fd',
                fontSize: '0.78rem',
                color: '#0284c7',
                fontStyle: 'italic',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              🎤 {interimText}
            </div>
          )}

          {/* Input Box Footer */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                speechRecognition.setAccumulatedTranscript(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && isRecording) {
                  e.preventDefault();
                  stopRecording();
                  return;
                }
                handleKeyDown(e);
              }}
              placeholder={
                isRecording
                  ? (isKannada ? 'ಧ್ವನಿ ರೆಕಾರ್ಡ್ ಆಗುತ್ತಿದೆ... ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ' : 'Recording speech... speak or type')
                  : (isKannada ? 'ಸರಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ (ಉದಾ: SSP, ರೈತ ಸಿರಿ)...' : 'Ask about Karnataka schemes (e.g. SSP, Raitha Siri)...')
              }
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                border: isRecording ? '1px solid #ef4444' : '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
                fontFamily: 'inherit',
                backgroundColor: isRecording ? '#fffafb' : '#ffffff'
              }}
            />

            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleVoiceRecording}
              disabled={isLoading}
              aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
              title={
                !isSpeechRecognitionSupported()
                  ? (isKannada ? 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಲಭ್ಯವಿಲ್ಲ' : 'Speech recognition not supported in this browser')
                  : isRecording
                  ? (isKannada ? 'ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ' : 'Stop recording')
                  : (isKannada ? `ಧ್ವನಿ ಇನ್‌ಪುಟ್ (${speechLang === 'kn-IN' ? 'ಕನ್ನಡ' : 'English'})` : `Voice Input (${speechLang === 'kn-IN' ? 'Kannada' : 'English'})`)
              }
              className={`ob-mic-btn ${isRecording ? 'ob-mic-recording' : ''}`}
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              aria-label="Send query"
              style={{
                backgroundColor: inputText.trim() && !isLoading ? '#092c57' : '#94a3b8',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputText.trim() && !isLoading ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s ease',
                flexShrink: 0
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

