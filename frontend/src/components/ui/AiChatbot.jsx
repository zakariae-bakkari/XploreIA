import React, { useState, useRef, useEffect } from 'react';
import { apiRequest } from '../../api';

const AiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Bonjour ! Je suis votre assistant XploreIA. Posez-moi des questions pour trouver l'outil d'IA idéal pour vos besoins."
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messageIdCounter = useRef(0);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');

    // Add user message
    const userMsg = {
      id: `msg-user-${messageIdCounter.current++}`,
      sender: 'user',
      text: text
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await apiRequest('ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text })
      });

      if (response.status === 'success' && response.reply) {
        setMessages(prev => [...prev, {
          id: `msg-bot-${messageIdCounter.current++}`,
          sender: 'bot',
          text: response.reply
        }]);
      } else {
        throw new Error(response.message || 'Response error');
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `msg-bot-${messageIdCounter.current++}`,
        sender: 'bot',
        text: "Le service IA n'est pas disponible pour le moment.",
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Convert markdown links [Text](URL) or **[Text](URL)** to JSX 
  const renderMessageText = (text) => {
    // Regex for markdown links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    
    // Quick parse for bold text
    let formattedText = text.replace(/\*\*([^*]+)\*\*/g, '$1');

    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(formattedText)) !== null) {
      const matchIndex = match.index;
      // Add text before match
      if (matchIndex > lastIndex) {
        parts.push(formattedText.substring(lastIndex, matchIndex));
      }
      
      const linkText = match[1];
      const linkUrl = match[2];

      // Determine if it's a relative URL to our app (e.g., discover/slug)
      const isRelative = !linkUrl.startsWith('http');
      const href = isRelative ? `/${linkUrl}` : linkUrl;

      parts.push(
        <a 
          key={matchIndex} 
          href={href} 
          style={{ 
            color: 'var(--primary)', 
            textDecoration: 'underline', 
            fontWeight: '600' 
          }}
          target={isRelative ? "_self" : "_blank"}
          rel="noopener noreferrer"
        >
          {linkText}
        </a>
      );
      
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < formattedText.length) {
      parts.push(formattedText.substring(lastIndex));
    }

    return parts.length > 0 ? parts : formattedText;
  };

  const presetQuestions = [
    "Outil de génération d'image gratuit",
    "Aide à la programmation",
    "Synthèse de voix réaliste"
  ];

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, fontFamily: 'Outfit, sans-serif' }}>
      <style>{`
        .chat-bubble {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          box-shadow: 0 8px 32px rgba(0, 219, 233, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0b0b0f;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .chat-bubble:hover {
          transform: scale(1.1) rotate(10deg);
          box-shadow: 0 12px 40px rgba(0, 219, 233, 0.6);
        }
        .chat-window {
          position: absolute;
          bottom: 75px;
          right: 0;
          width: 380px;
          height: 520px;
          border-radius: 24px;
          background: rgba(30, 30, 36, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: bottom right;
        }
        .chat-header {
          padding: 20px;
          background: linear-gradient(135deg, rgba(0, 219, 233, 0.1) 0%, rgba(235, 178, 255, 0.1) 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .chat-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .message-row {
          display: flex;
          width: 100%;
        }
        .message-row.user {
          justify-content: flex-end;
        }
        .message-bubble {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 14px;
          line-height: 1.5;
          word-break: break-word;
        }
        .message-bubble.bot {
          background: rgba(255, 255, 255, 0.05);
          color: var(--on-background);
          border-top-left-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.04);
        }
        .message-bubble.bot.error {
          background: rgba(255, 74, 118, 0.1);
          color: #ff4a76;
          border: 1px solid rgba(255, 74, 118, 0.2);
        }
        .message-bubble.user {
          background: linear-gradient(135deg, var(--primary) 0%, rgba(0, 219, 233, 0.8) 100%);
          color: #0b0b0f;
          font-weight: 500;
          border-top-right-radius: 4px;
        }
        .typing-indicator {
          display: flex;
          gap: 4px;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 18px;
          width: fit-content;
        }
        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--outline);
          animation: typingPulse 1.2s infinite ease-in-out;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingPulse {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .chat-footer {
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .chat-input {
          flex: 1;
          padding: 12px 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--on-background);
          outline: none;
          font-family: inherit;
          font-size: 14px;
          transition: all 0.2s;
        }
        .chat-input:focus {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.06);
        }
        .chat-send-btn {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: var(--primary);
          border: none;
          color: #0b0b0f;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .chat-send-btn:hover {
          background: #00bcd4;
          transform: translateY(-1px);
        }

        /* Light mode override styling */
        body.light-mode .chat-window {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
        }
        body.light-mode .chat-window * {
          color: var(--on-surface);
        }
        body.light-mode .chat-header {
          background: linear-gradient(135deg, rgba(14, 124, 134, 0.08) 0%, rgba(138, 33, 176, 0.08) 100%);
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        body.light-mode .chat-header h4 {
          color: var(--on-surface);
        }
        body.light-mode .chat-header p {
          color: var(--primary) !important;
        }
        body.light-mode .chat-header p span {
          background: var(--primary) !important;
        }
        body.light-mode .chat-header button {
          color: var(--outline) !important;
        }
        body.light-mode .message-bubble.bot {
          background: rgba(0, 0, 0, 0.04);
          color: var(--on-surface);
          border: 1px solid rgba(0, 0, 0, 0.04);
        }
        body.light-mode .message-bubble.user {
          background: linear-gradient(135deg, var(--primary) 0%, rgba(14, 124, 134, 0.85) 100%);
          color: #ffffff !important;
        }
        body.light-mode .message-bubble.user * {
          color: #ffffff !important;
        }
        body.light-mode .typing-indicator {
          background: rgba(0, 0, 0, 0.04);
        }
        body.light-mode .chat-footer {
          background: rgba(0, 0, 0, 0.01);
          border-top: 1px solid rgba(0, 0, 0, 0.06);
        }
        body.light-mode .chat-input {
          background: rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.08);
          color: var(--on-surface);
        }
        body.light-mode .chat-input:focus {
          background: #ffffff;
          border-color: var(--primary);
        }
        body.light-mode .chat-send-btn {
          color: #ffffff !important;
        }
        body.light-mode .chat-send-btn span {
          color: #ffffff !important;
        }
        body.light-mode .chat-send-btn:hover {
          background: #1293a0;
        }
        body.light-mode .chat-messages::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
        }
        body.light-mode .chat-messages::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.15);
          border-radius: 99px;
        }
        .chat-preset-btn {
          padding: 8px 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: var(--primary);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .chat-preset-btn:hover {
          background: rgba(0, 219, 233, 0.08);
        }
        body.light-mode .chat-preset-btn {
          background: rgba(0, 0, 0, 0.03);
          border: 1px solid rgba(0, 0, 0, 0.06);
        }
        body.light-mode .chat-preset-btn:hover {
          background: rgba(14, 124, 134, 0.08);
        }
      `}</style>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Header */}
          <div className="chat-header">
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0, 219, 233, 0.1)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <span className="material-symbols-outlined">smart_toy</span>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontWeight: 'bold', fontSize: '15px' }}>XploreIA Assistant</h4>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />
                Actif
              </p>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              style={{ background: 'none', border: 'none', color: 'var(--outline)', cursor: 'pointer' }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message-row ${msg.sender}`}>
                <div className={`message-bubble ${msg.sender} ${msg.isError ? 'error' : ''}`}>
                  {msg.sender === 'bot' ? renderMessageText(msg.text) : msg.text}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message-row">
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Presets suggestions */}
          {messages.length === 1 && (
            <div style={{ padding: '0 20px 12px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--outline)' }}>Suggestions :</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {presetQuestions.map((q, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="chat-preset-btn"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Input */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }} 
            className="chat-footer"
          >
            <input 
              type="text" 
              className="chat-input"
              placeholder="Rechercher un outil..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="chat-send-btn">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>send</span>
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <div 
        className="chat-bubble" 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          transform: isOpen ? 'scale(0.9) rotate(90deg)' : 'none'
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
          {isOpen ? 'close' : 'forum'}
        </span>
      </div>
    </div>
  );
};

export default AiChatbot;
