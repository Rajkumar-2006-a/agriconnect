import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './AgriChatbot.css';

// Pre-defined quick suggestion prompt chips
const QUICK_CHIPS_EN = [
  { label: '🌾 How to sell crops?', query: 'How do I list and sell my crops on the marketplace?' },
  { label: '🚜 Rent a tractor?', query: 'How does equipment and machinery rental work on AgriConnect?' },
  { label: '🏛️ Govt Subsidies?', query: 'What agricultural government schemes and subsidies are available?' },
  { label: '💧 100% Drip Subsidy?', query: 'How to apply for 100% micro irrigation subsidy under PMKSY?' },
  { label: '🌱 Fertilizer Prices?', query: 'What are the current fertilizer prices for Urea and DAP?' },
  { label: '🐛 Crop Disease help?', query: 'How can I consult an agricultural doctor for crop disease advice?' }
];

const QUICK_CHIPS_TA = [
  { label: '🌾 பயிர் விற்பனை செய்வது எப்படி?', query: 'விளைபொருட்களை சந்தையில் விற்பனை செய்வது எப்படி?' },
  { label: '🚜 டிராக்டர் வாடகைக்கு எடுக்க?', query: 'டிராக்டர் மற்றும் வேளாண் கருவிகளை எவ்வாறு வாடகைக்கு எடுப்பது?' },
  { label: '🏛️ அரசு மானிய திட்டங்கள்?', query: 'விவசாயிகளுக்கு என்னென்ன அரசு மானியங்கள் மற்றும் நலத்திட்டங்கள் உள்ளன?' },
  { label: '💧 100% சொட்டு நீர் மானியம்?', query: '100% சொட்டு நீர் பாசன மானியம் பெறுவது எப்படி?' },
  { label: '🌱 உர விலை நிலவரம்?', query: 'யூரியா மற்றும் டி.ஏ.பி உரங்களின் நேரடி விலை விவரங்கள் என்ன?' },
  { label: '👨‍⚕️ வேளாண் மருத்துவர் உதவி?', query: 'பயிர் நோய்களுக்கு வேளாண் மருத்துவரை எவ்வாறு தொடர்பு கொள்வது?' }
];

export default function AgriChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem('agribot_lang') || 'en');
  const isTa = language === 'ta';

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('agribot_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        role: 'bot',
        text:
          language === 'ta'
            ? 'வணக்கம்! நான் உங்கள் **AgriBot** — வேளாண் AI உதவியாளர்.🌾\n\nஅரசு மானியங்கள், இயந்திர வாடகை, விளைபொருள் விற்பனை அல்லது உர விலைகள் குறித்து எதையும் கேளுங்கள்!'
            : 'Hello! I am **AgriBot**, your AgriConnect AI farming assistant. 🌾\n\nAsk me about **Govt Subsidies**, **Equipment Rental**, **Marketplace Sales**, or **Fertilizer Prices**!',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  // Persist history to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('agribot_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Initialize Speech Recognition if browser supports it
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = isTa ? 'ta-IN' : 'en-IN';

      recog.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recog.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recog;
    }
  }, [isTa]);

  const toggleLanguage = (lang) => {
    const switchingToTamil = lang === 'ta';
    setLanguage(lang);
    localStorage.setItem('agribot_lang', lang);

    const switchNotice = switchingToTamil
      ? '🌐 **மொழி தமிழாக மாற்றப்பட்டுள்ளது.**\n\nவணக்கம்! நான் உங்கள் **AgriBot** — வேளாண் AI உதவியாளர்.🌾\n\nஅரசு மானியங்கள், டிராக்டர் வாடகை, விளைபொருள் விற்பனை, உரம் அல்லது பயிர் நோய் மேலாண்மை குறித்து எதையும் தமிழில் கேளுங்கள்!'
      : '🌐 **Language switched to English.**\n\nHello! I am **AgriBot** — your AgriConnect AI farming assistant. 🌾\n\nAsk me anything about Government Subsidies, Equipment Rental, Selling Crops, Fertilizer Prices, or Plant Diseases!';

    setMessages((prev) => [
      ...prev,
      {
        role: 'bot',
        text: switchNotice,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert(isTa ? 'உங்கள் உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை.' : 'Voice recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = isTa ? 'ta-IN' : 'en-IN';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Cannot start recognition:', err);
        setIsListening(false);
      }
    }
  };

  const clearChat = () => {
    const welcome = [
      {
        role: 'bot',
        text:
          isTa
            ? 'வணக்கம்! நான் உங்கள் **AgriBot** — வேளாண் AI உதவியாளர்.🌾 எதைப்பற்றி அறிய விரும்புகிறீர்கள்?'
            : 'Hello! I am **AgriBot**, your AgriConnect AI farming assistant. 🌾 How can I help you today?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(welcome);
    sessionStorage.removeItem('agribot_history');
  };

  const sendMessage = async (customQuery) => {
    const query = (customQuery || inputMessage).trim();
    if (!query || isTyping) return;

    setInputMessage('');

    const userMsg = {
      role: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setIsTyping(true);

    try {
      // Build conversation turns for context
      const historyPayload = nextMessages
        .slice(-6)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: m.text
        }));

      const res = await api.post('/chat', {
        message: query,
        history: historyPayload,
        language: isTa ? 'ta' : 'en'
      });

      const botReply = res.data?.reply || (isTa ? 'மன்னிக்கவும், தகவலை பெற முடியவில்லை.' : 'Sorry, could not process request.');

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: isTa
            ? 'மன்னிக்கவும், சேவையகத்துடன் தொடர்பு கொள்ள முடியவில்லை. தயவுசெய்து சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.'
            : 'Sorry, I am unable to connect to the server at the moment. Please try again shortly.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard?.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Helper to format basic markdown (bold, bullet lines)
  const renderFormattedText = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      // Check if bullet point
      const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      let content = isBullet ? line.trim().substring(2) : line;

      // Simple regex for **bold**
      const parts = content.split(/(\*\*.*?\*\*)/g);

      const parsedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <React.Fragment key={lIdx}>
          {isBullet ? (
            <div style={{ display: 'flex', gap: '6px', margin: '2px 0' }}>
              <span>•</span>
              <div>{parsedLine}</div>
            </div>
          ) : (
            <div style={{ margin: '2px 0' }}>{parsedLine}</div>
          )}
        </React.Fragment>
      );
    });
  };

  const chips = isTa ? QUICK_CHIPS_TA : QUICK_CHIPS_EN;

  return (
    <>
      {/* 1. Floating Launcher Button */}
      <button
        type="button"
        className={`agribot-launcher-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title={isTa ? 'வேளாண் AI உதவியாளர் (AgriBot)' : 'AgriBot AI Assistant'}
        aria-label="Toggle AgriBot Chat"
      >
        {!isOpen && <div className="agribot-launcher-pulse" />}
        {!isOpen && <span className="agribot-launcher-badge">AI</span>}
        <span style={{ fontSize: '1.6rem', lineHeight: 1 }}>{isOpen ? '✕' : '🌾'}</span>
      </button>

      {/* 2. Floating Chat Window */}
      {isOpen && (
        <aside className="agribot-window" role="dialog" aria-label="AgriBot Assistant">
          {/* Header */}
          <div className="agribot-header">
            <div className="agribot-header-profile">
              <div className="agribot-avatar">🤖</div>
              <div className="agribot-name-box">
                <h3>AgriBot</h3>
                <div className="agribot-status-row">
                  <span className="agribot-status-dot" />
                  <span>Gemini AI • {isTa ? 'இயங்குகிறது' : 'Online'}</span>
                </div>
              </div>
            </div>

            <div className="agribot-header-actions">
              <button
                type="button"
                className="agribot-header-btn"
                onClick={() => toggleLanguage(isTa ? 'en' : 'ta')}
                title="Toggle English / தமிழ்"
              >
                {isTa ? 'English' : 'தமிழ்'}
              </button>
              <button
                type="button"
                className="agribot-header-btn"
                onClick={clearChat}
                title={isTa ? 'அரட்டையை அழிக்க' : 'Clear chat'}
              >
                🗑️
              </button>
              <button
                type="button"
                className="agribot-close-btn"
                onClick={() => setIsOpen(false)}
                title="Minimize"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="agribot-messages-container">
            {/* Introductory Card */}
            <div className="agribot-welcome-card">
              <span className="agribot-welcome-badge">
                {isTa ? 'அக்ரிகனெக்ட் உதவி' : 'Smart Agriculture Assistant'}
              </span>
              <h4 className="agribot-welcome-title">
                {isTa ? 'வணக்கம் விவசாய நண்பரே! 🌾' : 'Welcome to AgriConnect! 🌾'}
              </h4>
              <p className="agribot-welcome-text">
                {isTa
                  ? 'நான் அரசு மானியங்கள், டிராக்டர் வாடகை, உரம் மற்றும் விளைபொருள் விற்பனை குறித்த கேள்விகளுக்கு உதவ தயார்.'
                  : 'I can assist you with government schemes, machinery rentals, selling crops, and fertilizer prices.'}
              </p>

              <div className="agribot-chips-title">
                {isTa ? 'விரைவு வினாக்கள்:' : 'Suggested Questions:'}
              </div>
              <div className="agribot-chips-wrap">
                {chips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="agribot-chip-btn"
                    onClick={() => sendMessage(chip.query)}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Messages */}
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div key={idx} className={`agribot-msg-row ${isUser ? 'user' : 'bot'}`}>
                  {!isUser && <div className="agribot-msg-avatar">🌱</div>}
                  <div className="agribot-msg-bubble">
                    <div>{renderFormattedText(msg.text)}</div>
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      <span className="agribot-msg-time">{msg.time}</span>
                      {!isUser && (
                        <button
                          type="button"
                          className="agribot-copy-btn"
                          onClick={() => handleCopy(msg.text, idx)}
                          title="Copy response"
                        >
                          {copiedIdx === idx ? '✓ Copied' : '📋 Copy'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="agribot-msg-row bot">
                <div className="agribot-msg-avatar">🌱</div>
                <div className="agribot-typing-bubble">
                  <div className="agribot-typing-dot" />
                  <div className="agribot-typing-dot" />
                  <div className="agribot-typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="agribot-input-container">
            <form
              className="agribot-input-form"
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <input
                type="text"
                className="agribot-input-field"
                placeholder={
                  isListening
                    ? isTa
                      ? 'கேட்கிறது... பேசுங்கள்...'
                      : 'Listening... speak now...'
                    : isTa
                    ? 'கேள்விகளை தட்டச்சு செய்யவும்...'
                    : 'Ask AgriBot anything...'
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
              />

              {/* Voice Input button */}
              <button
                type="button"
                className={`agribot-voice-btn ${isListening ? 'listening' : ''}`}
                onClick={handleVoiceInput}
                title={isListening ? 'Stop listening' : isTa ? 'குரல் உள்ளீடு (Mic)' : 'Voice input (Mic)'}
              >
                🎤
              </button>

              {/* Send button */}
              <button
                type="submit"
                className="agribot-send-btn"
                disabled={!inputMessage.trim() || isTyping}
                title={isTa ? 'அனுப்ப' : 'Send'}
              >
                ➤
              </button>
            </form>
            <div className="agribot-footer-note">
              {isTa ? 'அக்ரிகனெக்ட் ஜெமினி AI ஆல் இயக்கப்படுகிறது' : 'Powered by AgriConnect Gemini AI'}
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
