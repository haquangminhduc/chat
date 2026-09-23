import React from 'react';
import { useApp } from '../context/AppContext';
import { englishRoadmap } from '../data/roadmapsEnglish';
import { chineseRoadmap } from '../data/roadmapsChinese';
import { Flame, Star, Trophy, CheckCircle2, Target, Calendar, ArrowRight, Zap } from 'lucide-react';

export const DashboardView = () => {
  const {
    targetLang,
    xp,
    streak,
    completedLessons,
    setActiveTab,
    openAiKey,
    setIsSettingsOpen
  } = useApp();

  const totalEnLessons = englishRoadmap.stages.reduce((acc, stage) => acc + stage.lessons.length, 0);
  const totalZhLessons = chineseRoadmap.stages.reduce((acc, stage) => acc + stage.lessons.length, 0);

  const totalLessons = targetLang === 'zh' ? totalZhLessons : totalEnLessons;
  const completedCount = completedLessons.filter(id => id.startsWith(targetLang)).length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalLessons) * 100));

  // Determine Level badge based on XP
  let userLevel = 'Đồng (Bronze)';
  if (xp >= 500) userLevel = 'Kim Cương (Diamond)';
  else if (xp >= 300) userLevel = 'Vàng (Gold)';
  else if (xp >= 150) userLevel = 'Bạc (Silver)';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            📊 Tổng Quan Học Tập
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100">
            Chào mừng trở lại! Hạng: <span className="text-yellow-400">{userLevel}</span>
          </h1>
          <p className="text-xs text-slate-400">
            Bạn đã duy trì chuỗi học tập <span className="text-orange-400 font-bold">{streak} ngày liên tiếp</span>. Cố gắng giữ vững phong độ nhé!
          </p>
        </div>

        <button
          onClick={() => setActiveTab('aichat')}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-cyan-500/20 transition shrink-0"
        >
          <Zap className="w-4 h-4" />
          <span>Luyện Nói AI Ngay</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center font-bold text-xl">
            <Flame className="w-6 h-6 text-orange-500 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Streak Học Tập</span>
            <span className="text-2xl font-black text-slate-100">{streak} Ngày</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center justify-center font-bold text-xl">
            <Star className="w-6 h-6 fill-yellow-400" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Điểm XP Tích Lũy</span>
            <span className="text-2xl font-black text-slate-100">{xp} XP</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Bài Học Hoàn Thành</span>
            <span className="text-2xl font-black text-slate-100">{completedCount} / {totalLessons}</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-xl">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">Ngôn Ngữ Hiện Tại</span>
            <span className="text-2xl font-black text-slate-100">
              {targetLang === 'zh' ? '🇨🇳 Tiếng Trung' : '🇬🇧 Tiếng Anh'}
            </span>
          </div>
        </div>

      </div>

      {/* Progress Bar & Status */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-300">
            Tiến độ Lộ trình {targetLang === 'zh' ? 'Tiếng Trung' : 'Tiếng Anh'}
          </span>
          <span className="text-cyan-400 font-extrabold">{progressPercent}% Hoàn Thành</span>
        </div>

        {/* Bar */}
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            {completedCount === totalLessons
              ? '🎉 Xuất sắc! Bạn đã hoàn thành toàn bộ lộ trình này.'
              : `Còn ${totalLessons - completedCount} bài học nữa để chinh phục chặng tiếp theo.`}
          </p>

          <button
            onClick={() => setActiveTab('roadmap')}
            className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
          >
            <span>Đến cây lộ trình</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
