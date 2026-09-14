import { toast } from '../ui/toast.js';

let autoSpeak = false;
let voices = [];
let speechQueue = [];
let isSpeaking = false;

function loadVoices() {
  if (!('speechSynthesis' in window)) return [];
  voices = window.speechSynthesis.getVoices();
  return voices;
}

if ('speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

export function isAutoSpeak() {
  return autoSpeak;
}

export function toggleAutoSpeak() {
  autoSpeak = !autoSpeak;
  if (!autoSpeak) {
    stopSpeech();
  }
  return autoSpeak;
}

export function stopSpeech() {
  speechQueue = [];
  isSpeaking = false;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function getVoiceConfig(speakerKey = '') {
  const isMale = speakerKey === 'male_ai' || speakerKey.includes('male') || speakerKey.includes('hai');
  const isFemale = speakerKey === 'female_ai' || speakerKey.includes('female') || speakerKey.includes('trang') || speakerKey.includes('my');

  if (isMale) {
    return { pitch: 0.82, rate: 1.05 };
  }
  if (isFemale) {
    return { pitch: 1.18, rate: 1.0 };
  }
  return { pitch: 1.0, rate: 1.0 };
}

function findBestVoice() {
  if (!voices.length) loadVoices();
  const viVoice = voices.find(v => v.lang.startsWith('vi') || v.lang.includes('VI'));
  return viVoice || null;
}

function cleanTextForSpeech(text) {
  if (!text) return '';
  // Remove markdown, code blocks, emojis and symbols for clear speech
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`.*?`/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/[#*_~>]/g, '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .trim();
}

function processNextSpeech() {
  if (!speechQueue.length) {
    isSpeaking = false;
    return;
  }

  isSpeaking = true;
  const { text, speakerKey, onEnd } = speechQueue.shift();
  const clean = cleanTextForSpeech(text);

  if (!clean || !('speechSynthesis' in window)) {
    onEnd?.();
    processNextSpeech();
    return;
  }

  const utterance = new SpeechSynthesisUtterance(clean);
  const voice = findBestVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = 'vi-VN';

  const { pitch, rate } = getVoiceConfig(speakerKey);
  utterance.pitch = pitch;
  utterance.rate = rate;

  utterance.onend = () => {
    onEnd?.();
    processNextSpeech();
  };

  utterance.onerror = () => {
    onEnd?.();
    processNextSpeech();
  };

  window.speechSynthesis.speak(utterance);
}

export function queueSpeech(text, speakerKey = '', onEnd) {
  if (!('speechSynthesis' in window)) return;
  speechQueue.push({ text, speakerKey, onEnd });
  if (!isSpeaking) {
    processNextSpeech();
  }
}

export function speakImmediately(text, speakerKey = '') {
  if (!('speechSynthesis' in window)) {
    return toast('Trình duyệt không hỗ trợ đọc văn bản', 'error');
  }
  stopSpeech();
  queueSpeech(text, speakerKey);
}
