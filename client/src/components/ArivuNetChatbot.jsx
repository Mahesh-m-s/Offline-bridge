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
  RefreshCw
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { apiClient } from '../api/apiClient';
import { isOnline, setupNetworkListeners } from '../registerServiceWorker';

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

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

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
            ? 'ನಮಸ್ಕಾರ! ನಾನು ಅರಿವುನೆಟ್ AI (ArivuNet AI), ಕರ್ನಾಟಕ ಸರಕಾರದ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು, ವಿದ್ಯಾರ್ಥಿವೇತನ, ರೈತ ಸಹಾಯಧನ, ಸಾಮಾಜಿಕ ಪಿಂಚಣಿ ಮತ್ತು ನಾಗರಿಕ ಸೇವೆಗಳ ಬಗ್ಗೆ ನಿಮಗೆ ಅಧಿಕೃತ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತೇನೆ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?'
            : 'Namaskara! I am ArivuNet AI, your guide for Karnataka Government welfare schemes, scholarships, farmer subsidies, pensions, and citizen services. How can I help you today?',
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
    const textToSend = (queryText || inputText).trim();
    if (!textToSend || isLoading) return;

    setActiveError(null);
    setInputText('');

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
        language: isKannada ? 'kn' : 'en',
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
          : 'Unable to get an answer from ArivuNet AI. Please try again.');

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
          aria-label={isOpen ? 'Close ArivuNet AI Chatbot' : 'Open ArivuNet AI Chatbot'}
          title={isKannada ? 'ಅರಿವುನೆಟ್ AI ಸಹಾಯ' : 'Ask ArivuNet AI'}
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
          <span>{isKannada ? 'ಅರಿವುನೆಟ್ AI ಸಹಾಯ' : 'Ask ArivuNet AI'}</span>
          {isOpen ? <X size={16} style={{ marginLeft: '4px' }} /> : null}
        </button>
      </div>

      {/* 2. RESPONSIVE CHATBOT DRAWER / MODAL */}
      {isOpen && (
        <div
          className="arivunet-chatbot-panel"
          role="dialog"
          aria-label="ArivuNet AI Assistant"
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
                  {isKannada ? 'ಅರಿವುನೆಟ್ AI ಸಹಾಯಕ' : 'ArivuNet AI Assistant'}
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
                onClick={() => setIsOpen(false)}
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
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isKannada
                  ? 'ಸರಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಕೇಳಿ (ಉದಾ: SSP, ರೈತ ಸಿರಿ)...'
                  : 'Ask about Karnataka schemes (e.g. SSP, Raitha Siri)...'
              }
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.85rem',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
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
                transition: 'background-color 0.2s ease'
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

