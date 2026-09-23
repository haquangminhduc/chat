import React from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Star, Key, Settings, Map, MessageSquareText, Layers, LayoutDashboard, Languages } from 'lucide-react';

export const Header = () => {
  const {
    targetLang,
    setTargetLang,
    xp,
    streak,
    openAiKey,
    activeTab,
    setActiveTab,
    setIsSettingsOpen
  } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-cyan-500/20">
            L
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              LinguaPath <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">AI</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">Học Anh - Trung theo Lộ Trình & ChatGPT</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'roadmap'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Lộ Trình</span>
          </button>

          <button
            onClick={() => setActiveTab('aichat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'aichat'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MessageSquareText className="w-4 h-4" />
            <span>Phòng Nói AI</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'flashcards'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Flashcards</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Tiến Độ</span>
          </button>
        </nav>

        {/* Right Section: Language Switcher, Gamification & Settings */}
        <div className="flex items-center gap-3">
          
          {/* Target Language Selector */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTargetLang('en')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                targetLang === 'en'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🇬🇧</span>
              <span>English</span>
            </button>
            <button
              onClick={() => setTargetLang('zh')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                targetLang === 'zh'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🇨🇳</span>
              <span>中文</span>
            </button>
          </div>

          {/* Gamification Counters */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-bold">
            <div className="flex items-center gap-1 text-amber-400">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
              <span>{streak} Ngày</span>
            </div>
            <div className="w-px h-4 bg-slate-800" />
            <div className="flex items-center gap-1 text-yellow-400">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>{xp} XP</span>
            </div>
          </div>

          {/* API Key Status Indicator & Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              openAiKey
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 animate-pulse'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {openAiKey ? 'ChatGPT Key OK' : 'Thêm Key ChatGPT'}
            </span>
            <Settings className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
          </button>

        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="flex md:hidden items-center justify-around mt-3 pt-2 border-t border-slate-800 text-xs font-medium">
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'roadmap' ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          <Map className="w-4 h-4" />
          <span>Lộ Trình</span>
        </button>
        <button
          onClick={() => setActiveTab('aichat')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'aichat' ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          <MessageSquareText className="w-4 h-4" />
          <span>Phòng Nói</span>
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'flashcards' ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          <Layers className="w-4 h-4" />
          <span>Flashcard</span>
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Tiến Độ</span>
        </button>
      </div>
    </header>
  );
};
