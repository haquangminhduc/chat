import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // 1. Language state: 'en' (English) or 'zh' (Chinese)
  const [targetLang, setTargetLang] = useState(() => {
    return localStorage.getItem('lingua_target_lang') || 'en';
  });

  // 2. OpenAI Settings
  const [openAiKey, setOpenAiKeyState] = useState(() => {
    return localStorage.getItem('lingua_openai_key') || '';
  });

  const [selectedModel, setSelectedModel] = useState(() => {
    return localStorage.getItem('lingua_openai_model') || 'gpt-4o-mini';
  });

  // 3. User Progress & Gamification
  const [xp, setXp] = useState(() => {
    return parseInt(localStorage.getItem('lingua_xp') || '120', 10);
  });

  const [streak, setStreak] = useState(() => {
    return parseInt(localStorage.getItem('lingua_streak') || '3', 10);
  });

  const [completedLessons, setCompletedLessons] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lingua_completed_lessons')) || ['en-1-1', 'zh-1-1'];
    } catch {
      return ['en-1-1', 'zh-1-1'];
    }
  });

  // 4. Navigation & Modals
  const [activeTab, setActiveTab] = useState('roadmap'); // 'roadmap' | 'aichat' | 'flashcards' | 'dashboard'
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('lingua_target_lang', targetLang);
  }, [targetLang]);

  useEffect(() => {
    localStorage.setItem('lingua_openai_key', openAiKey);
  }, [openAiKey]);

  useEffect(() => {
    localStorage.setItem('lingua_openai_model', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem('lingua_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('lingua_streak', streak.toString());
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('lingua_completed_lessons', JSON.stringify(completedLessons));
  }, [completedLessons]);

  // Actions
  const setOpenAiKey = (key) => {
    setOpenAiKeyState(key);
  };

  const completeLesson = (lessonId, gainedXp = 50) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons(prev => [...prev, lessonId]);
      setXp(prev => prev + gainedXp);
    }
  };

  const startRoleplayScenario = (scenario) => {
    setSelectedScenario(scenario);
    if (scenario.lang) {
      setTargetLang(scenario.lang);
    }
    setActiveTab('aichat');
  };

  return (
    <AppContext.Provider value={{
      targetLang,
      setTargetLang,
      openAiKey,
      setOpenAiKey,
      selectedModel,
      setSelectedModel,
      xp,
      setXp,
      streak,
      setStreak,
      completedLessons,
      completeLesson,
      activeTab,
      setActiveTab,
      isSettingsOpen,
      setIsSettingsOpen,
      activeLesson,
      setActiveLesson,
      selectedScenario,
      setSelectedScenario,
      startRoleplayScenario
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
