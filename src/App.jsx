import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { RoadmapView } from './components/RoadmapView';
import { LessonModal } from './components/LessonModal';
import { AIChatView } from './components/AIChatView';
import { FlashcardView } from './components/FlashcardView';
import { DashboardView } from './components/DashboardView';
import { SettingsModal } from './components/SettingsModal';

function MainContent() {
  const { activeTab } = useApp();

  return (
    <main className="pb-16">
      {activeTab === 'roadmap' && <RoadmapView />}
      {activeTab === 'aichat' && <AIChatView />}
      {activeTab === 'flashcards' && <FlashcardView />}
      {activeTab === 'dashboard' && <DashboardView />}
      <LessonModal />
      <SettingsModal />
    </main>
  );
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
        <Header />
        <MainContent />
      </div>
    </AppProvider>
  );
}
