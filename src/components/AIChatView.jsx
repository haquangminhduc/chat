import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { sendChatMessageToOpenAI } from '../services/openaiService';
import { speakText, createSpeechRecognizer } from '../services/speechService';
import { roleplayScenarios } from '../data/roleplayScenarios';
import { Send, Mic, MicOff, Volume2, Bot, User, Sparkles, Key, RefreshCw } from 'lucide-react';

export const AIChatView = () => {
  const {
    targetLang,
    openAiKey,
    selectedModel,
    selectedScenario,
    setSelectedScenario,
    setIsSettingsOpen
  } = useApp();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognizer, setRecognizer] = useState(null);

  const messagesEndRef = useRef(null);

  // Available scenarios filtered by current language
  const currentScenarios = roleplayScenarios.filter(s => s.lang === targetLang);

  // Initialize scenario conversation
  useEffect(() => {
    const activeScenario = selectedScenario || currentScenarios[0];
    if (activeScenario) {
      setMessages([
        {
          id: 'msg-init',
          sender: 'ai',
          text: activeScenario.initialMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [selectedScenario, targetLang]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleScenarioChange = (scenario) => {
    setSelectedScenario(scenario);
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'ai',
        text: scenario.initialMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleSendMessage = async (textToSend = inputText) => {
    const text = textToSend.trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const activeScenarioPrompt = selectedScenario?.prompt || '';
      const aiReplyText = await sendChatMessageToOpenAI({
        apiKey: openAiKey,
        model: selectedModel,
        messages: newMessages,
        targetLang,
        scenarioPrompt: activeScenarioPrompt
      });

      const aiMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'ai',
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      
      // Auto speak AI response
      speakText(aiReplyText, targetLang);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'system',
          text: `⚠️ Lỗi: ${err.message || 'Không thể kết nối với OpenAI API'}. Vui lòng kiểm tra lại Key trong Cài Đặt.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Microphone
  const toggleSpeechRecognition = () => {
    if (isListening && recognizer) {
      recognizer.stop();
      setIsListening(false);
      return;
    }

    const rec = createSpeechRecognizer(
      targetLang,
      (transcript) => {
        setInputText(transcript);
      },
      (err) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (rec) {
      rec.start();
      setRecognizer(rec);
      setIsListening(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-6rem)]">
      
      {/* Left Sidebar: Scenarios List */}
      <div className="glass-panel rounded-3xl p-4 border border-slate-800 flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-2 mb-4 px-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h2 className="font-bold text-sm text-slate-200">Kịch Bản Nhập Vai AI</h2>
        </div>

        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
          {currentScenarios.map((sc) => {
            const isSelected = (selectedScenario?.id || currentScenarios[0]?.id) === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => handleScenarioChange(sc)}
                className={`w-full text-left p-3 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200 shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{sc.icon}</span>
                  <span className="font-bold text-xs text-slate-200 line-clamp-1">{sc.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {sc.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* API Key Banner inside sidebar */}
        {!openAiKey && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Chưa nhập ChatGPT Key</span>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              Nhập API Key để mở khóa AI phản hồi mượt mà & phân tích ngữ pháp 100%.
            </p>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition shadow"
            >
              Nhập Key Ngay
            </button>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="lg:col-span-3 glass-panel rounded-3xl border border-slate-800 flex flex-col h-full overflow-hidden">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg">
              🤖
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                {selectedScenario?.title || currentScenarios[0]?.title || 'Gia Sư AI 1-1'}
              </h3>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Trực tuyến • Model: {selectedModel}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => handleScenarioChange(selectedScenario || currentScenarios[0])}
            title="Làm mới cuộc trò chuyện"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 font-bold ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white shadow'
                  : msg.sender === 'system'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-lg shadow-blue-500/10'
                  : msg.sender === 'system'
                  ? 'bg-amber-500/15 border border-amber-500/30 text-amber-200 rounded-tl-none'
                  : 'glass-card border-slate-700/80 text-slate-200 rounded-tl-none'
              }`}>
                {/* Audio TTS Button for AI messages */}
                {msg.sender === 'ai' && (
                  <button
                    onClick={() => speakText(msg.text, targetLang)}
                    title="Nghe phát âm chuẩn"
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-400 transition"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className="whitespace-pre-line font-sans pr-6">
                  {msg.text}
                </div>

                <div className="text-[10px] opacity-50 mt-2 text-right">
                  {msg.timestamp}
                </div>
              </div>

            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="glass-card px-4 py-3 rounded-2xl border border-slate-700 text-xs text-slate-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-100" />
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce delay-200" />
                <span>AI đang suy nghĩ & soạn phản hồi...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Microphone Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-3 rounded-2xl border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-lg shadow-rose-500/20'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
              }`}
              title={isListening ? 'Đang lắng nghe... Bấm để dừng' : 'Nói vào micro để nhập văn bản'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                targetLang === 'zh'
                  ? 'Nhập câu trả lời bằng Tiếng Trung hoặc Pinyin...'
                  : 'Type your response in English...'
              }
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold transition shadow-lg shadow-cyan-500/20 shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
