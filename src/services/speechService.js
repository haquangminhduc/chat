// Web Speech Synthesis (TTS) & Speech Recognition (STT) Service

export const speakText = (text, lang = 'en-US') => {
  if (!('speechSynthesis' in window)) {
    console.warn('Trình duyệt của bạn không hỗ trợ đọc âm thanh (Web Speech Synthesis).');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Clean text from Markdown tags or IPA formatting if needed
  const cleanText = text.replace(/[*_~#`]/g, '').trim();
  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  
  // Set target language
  if (lang === 'zh' || lang === 'zh-CN') {
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85; // Slightly slower for Chinese clarity
  } else {
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
  }

  // Try to find natural voices
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.includes(lang.startsWith('zh') ? 'zh' : 'en'));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
};

export const createSpeechRecognizer = (lang = 'en-US', onResult, onError, onEnd) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    console.warn('Trình duyệt không hỗ trợ Nhận diện giọng nói (Web Speech Recognition).');
    if (onError) onError('Trình duyệt không hỗ trợ Micro thu âm.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = lang === 'zh' || lang === 'zh-CN' ? 'zh-CN' : 'en-US';

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
};
