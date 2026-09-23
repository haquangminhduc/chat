import React from 'react';
import { useApp } from '../context/AppContext';
import { englishRoadmap } from '../data/roadmapsEnglish';
import { chineseRoadmap } from '../data/roadmapsChinese';
import { roleplayScenarios } from '../data/roleplayScenarios';
import { CheckCircle, Lock, BookOpen, Bot, Star, Play, Sparkles } from 'lucide-react';

export const RoadmapView = () => {
  const {
    targetLang,
    completedLessons,
    setActiveLesson,
    startRoleplayScenario
  } = useApp();

  const currentRoadmap = targetLang === 'zh' ? chineseRoadmap : englishRoadmap;

  const isLessonUnlocked = (stageIndex, lessonIndex) => {
    if (stageIndex === 0 && lessonIndex === 0) return true;
    // Unlocked if previous lesson in same stage or previous stage is completed
    const currentStage = currentRoadmap.stages[stageIndex];
    if (lessonIndex > 0) {
      const prevLessonId = currentStage.lessons[lessonIndex - 1].id;
      return completedLessons.includes(prevLessonId);
    } else if (stageIndex > 0) {
      const prevStage = currentRoadmap.stages[stageIndex - 1];
      const lastLessonOfPrevStage = prevStage.lessons[prevStage.lessons.length - 1].id;
      return completedLessons.includes(lastLessonOfPrevStage);
    }
    return false;
  };

  const handleLessonClick = (lesson, unlocked) => {
    if (!unlocked) return;
    if (lesson.type === 'roleplay' && lesson.scenarioId) {
      const scenario = roleplayScenarios.find(s => s.id === lesson.scenarioId);
      if (scenario) {
        startRoleplayScenario(scenario);
        return;
      }
    }
    setActiveLesson(lesson);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12">
      
      {/* Banner Intro */}
      <div className="relative overflow-hidden glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Lộ Trình Chuẩn Quốc Tế • {targetLang === 'zh' ? 'Tiếng Trung HSK & Nhập Hàng' : 'Tiếng Anh Giao Tiếp & Công Sở'}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight mb-3">
            {currentRoadmap.title}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            {currentRoadmap.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs font-bold text-slate-300">
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-cyan-400">●</span>
              <span>{currentRoadmap.stages.length} Chặng Học</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-emerald-400">✓</span>
              <span>Lưu Tiến Độ Tự Động</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stages List */}
      <div className="space-y-10">
        {currentRoadmap.stages.map((stage, stageIdx) => (
          <div key={stage.id} className="relative">
            
            {/* Stage Header */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-r ${stage.color} flex items-center justify-center text-white font-black text-lg shadow-lg`}>
                  {stage.number}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">{stage.title}</h2>
                  <p className="text-xs text-slate-400">{stage.description}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-slate-300 border border-slate-800 hidden sm:inline">
                {stage.badge}
              </span>
            </div>

            {/* Stage Lessons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stage.lessons.map((lesson, lessonIdx) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const unlocked = isLessonUnlocked(stageIdx, lessonIdx);

                return (
                  <div
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson, unlocked)}
                    className={`group relative p-5 rounded-2xl border transition-all duration-300 ${
                      unlocked
                        ? isCompleted
                          ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-400 cursor-pointer shadow-lg shadow-emerald-950/20'
                          : 'glass-card border-slate-700/80 hover:border-cyan-500/60 hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer'
                        : 'bg-slate-900/40 border-slate-800/60 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {/* Top Lesson Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {lesson.type === 'roleplay' ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                            <Bot className="w-3 h-3" /> AI Roleplay
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" /> Lý Thuyết
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-medium">
                          {lesson.duration}
                        </span>
                      </div>

                      {/* Status Icon */}
                      <div>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                        ) : unlocked ? (
                          <div className="w-5 h-5 rounded-full border-2 border-cyan-400 group-hover:bg-cyan-400 group-hover:border-cyan-400 transition flex items-center justify-center">
                            <Play className="w-2.5 h-2.5 text-cyan-400 group-hover:text-slate-950 fill-current ml-0.5" />
                          </div>
                        ) : (
                          <Lock className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                    </div>

                    {/* Title & Summary */}
                    <h3 className="font-bold text-slate-200 text-sm group-hover:text-cyan-300 transition mb-1.5 line-clamp-2">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {lesson.summary}
                    </p>

                    {/* Bottom XP Badge */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] font-bold">
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Star className="w-3.5 h-3.5 fill-yellow-400" />
                        +{lesson.xp} XP
                      </span>
                      <span className="text-slate-400 group-hover:text-slate-200 transition">
                        {isCompleted ? 'Học lại' : unlocked ? 'Bắt đầu' : 'Khóa'}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
