import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { speakText } from '../services/speechService';
import confetti from 'canvas-confetti';
import { X, Volume2, CheckCircle2, XCircle, ArrowRight, Star, BookOpen, Trophy } from 'lucide-react';

export const LessonModal = () => {
  const {
    activeLesson,
    setActiveLesson,
    completeLesson,
    targetLang
  } = useApp();

  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);

  if (!activeLesson || !activeLesson.content) return null;

  const { theory, quiz } = activeLesson.content;

  const handleOptionSelect = (index) => {
    if (isSubmitted) return;
    setSelectedOption(index);
  };

  const handleAnswerSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
    if (selectedOption === quiz[currentQuizIdx].correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    if (currentQuizIdx < quiz.length - 1) {
      setCurrentQuizIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      // Finished all quiz questions
      setQuizFinished(true);
      completeLesson(activeLesson.id, activeLesson.xp);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleClose = () => {
    setActiveLesson(null);
    setCurrentQuizIdx(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setQuizFinished(false);
    setScore(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">{activeLesson.title}</h2>
              <span className="text-xs text-slate-400">Thưởng +{activeLesson.xp} XP</span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="overflow-y-auto pr-2 space-y-8 flex-1">
          
          {/* Theory Section */}
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-cyan-400 flex items-center gap-2">
                <span>📖 Lý Thuyết Bài Học</span>
              </h3>
              <button
                onClick={() => speakText(theory.replace(/[#*`]/g, ''), targetLang)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition border border-slate-700"
              >
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Nghe Đọc</span>
              </button>
            </div>

            <div className="prose prose-invert max-w-none bg-slate-900/60 p-5 rounded-2xl border border-slate-800 font-sans whitespace-pre-line">
              {theory}
            </div>
          </div>

          {/* Quiz Section */}
          {quiz && quiz.length > 0 && !quizFinished && (
            <div className="pt-6 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Trắc nghiệm kiểm tra ({currentQuizIdx + 1}/{quiz.length})</span>
                <span className="text-cyan-400">Điểm hiện tại: {score}</span>
              </div>

              <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
                <h4 className="font-bold text-slate-100 text-base">
                  {quiz[currentQuizIdx].question}
                </h4>

                <div className="space-y-2.5">
                  {quiz[currentQuizIdx].options.map((option, idx) => {
                    let btnStyle = 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300';
                    if (selectedOption === idx) {
                      btnStyle = 'bg-cyan-500/20 border-cyan-500 text-cyan-200 font-semibold';
                    }
                    if (isSubmitted) {
                      if (idx === quiz[currentQuizIdx].correct) {
                        btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-semibold';
                      } else if (selectedOption === idx) {
                        btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-200';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={isSubmitted}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{option}</span>
                        {isSubmitted && idx === quiz[currentQuizIdx].correct && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {isSubmitted && selectedOption === idx && idx !== quiz[currentQuizIdx].correct && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {isSubmitted && (
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed animate-fade-in">
                    <p className="font-bold text-cyan-400 mb-1">💡 Giải thích:</p>
                    {quiz[currentQuizIdx].explanation}
                  </div>
                )}

                {/* Submit / Next Quiz Button */}
                <div className="flex justify-end pt-2">
                  {!isSubmitted ? (
                    <button
                      onClick={handleAnswerSubmit}
                      disabled={selectedOption === null}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 transition shadow-lg shadow-cyan-500/20"
                    >
                      Xác Nhận Đáp Án
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuiz}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 transition shadow-lg shadow-emerald-500/20"
                    >
                      <span>{currentQuizIdx < quiz.length - 1 ? 'Câu Tiếp Theo' : 'Hoàn Thành Bài Học'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quiz Completion Screen */}
          {quizFinished && (
            <div className="p-8 text-center glass-card rounded-2xl border border-emerald-500/30 space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-100">Xuất Sắc! Bài Học Hoàn Thành</h3>
              <p className="text-xs text-slate-300">
                Bạn đã đạt {score}/{quiz.length} câu trả lời đúng và nhận thêm <span className="text-yellow-400 font-bold">+{activeLesson.xp} XP</span>!
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/30"
              >
                Trở Về Cây Lộ Trình
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
