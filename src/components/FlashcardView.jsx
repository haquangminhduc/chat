import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { flashcardsData } from '../data/flashcardsData';
import { speakText } from '../services/speechService';
import { Volume2, RotateCw, CheckCircle, HelpCircle, XCircle, Sparkles, Layers } from 'lucide-react';

export const FlashcardView = () => {
  const { targetLang, setXp } = useApp();
  const deck = flashcardsData[targetLang] || flashcardsData.en;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownWords, setKnownWords] = useState([]);

  const currentCard = deck[currentIndex];

  const handleNextCard = (rememberedStatus) => {
    if (rememberedStatus === 'easy') {
      setXp(prev => prev + 10);
      if (!knownWords.includes(currentCard.id)) {
        setKnownWords(prev => [...prev, currentCard.id]);
      }
    }
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % deck.length);
    }, 150);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex items-center justify-between glass-panel p-6 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-100">Kho Từ Vựng SRS (Flashcards)</h1>
            <p className="text-xs text-slate-400">Hệ thống lặp lại ngắt quãng giúp nhớ lâu từ vựng cốt lõi</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-slate-400 block">Tiến Độ Thẻ</span>
          <span className="text-lg font-extrabold text-cyan-400">{currentIndex + 1} / {deck.length}</span>
        </div>
      </div>

      {/* Main Flashcard Container */}
      <div className="relative min-h-[340px] perspective-1000">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`w-full min-h-[340px] glass-panel rounded-3xl border border-slate-700/80 p-8 flex flex-col justify-between cursor-pointer transition-transform duration-500 transform-gpu hover:border-cyan-500/50 shadow-2xl ${
            isFlipped ? 'bg-slate-900/90' : 'bg-slate-900/60'
          }`}
        >
          {/* Card Top Category */}
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              🏷️ {currentCard.category}
            </span>
            <span className="text-slate-500 flex items-center gap-1">
              <RotateCw className="w-3.5 h-3.5" /> Bấm thẻ để lật mặt sau
            </span>
          </div>

          {/* Front / Back Card Body */}
          <div className="text-center py-8 space-y-4">
            {!isFlipped ? (
              /* FRONT FACE */
              <div className="space-y-3 animate-fade-in">
                <h2 className="text-4xl sm:text-5xl font-black text-slate-100 tracking-wide">
                  {currentCard.word}
                </h2>
                
                {currentCard.pinyin && (
                  <p className="text-lg font-bold text-rose-400 font-mono">
                    [{currentCard.pinyin}]
                  </p>
                )}

                {currentCard.ipa && (
                  <p className="text-base font-semibold text-cyan-400 font-mono">
                    {currentCard.ipa}
                  </p>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(currentCard.word, targetLang);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition mt-2"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Nghe Phát Âm</span>
                </button>
              </div>
            ) : (
              /* BACK FACE */
              <div className="space-y-4 animate-fade-in">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
                  {currentCard.translation}
                </h3>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
                  <p className="font-bold text-slate-400 mb-1 text-[11px] uppercase tracking-wider">Ví dụ thực tế:</p>
                  <p className="italic mb-1 text-slate-200">"{currentCard.example}"</p>
                  {currentCard.examplePinyin && (
                    <p className="text-xs text-rose-300 font-mono mb-1">[{currentCard.examplePinyin}]</p>
                  )}
                  <p className="text-xs text-cyan-300">➜ {currentCard.exampleTranslation}</p>
                </div>
              </div>
            )}
          </div>

          {/* Card Bottom Hint */}
          <div className="text-center text-[11px] text-slate-500">
            {isFlipped ? 'Đã hiện nghĩa & ví dụ' : 'Mặt trước - Thử nhớ nghĩa trước khi lật!'}
          </div>

        </div>
      </div>

      {/* Rating Buttons */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => handleNextCard('hard')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-500/10 text-rose-400 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow"
        >
          <XCircle className="w-4 h-4" />
          <span>Chưa Thuộc</span>
        </button>

        <button
          onClick={() => handleNextCard('good')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-400 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Tạm Nhớ</span>
        </button>

        <button
          onClick={() => handleNextCard('easy')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Thuộc Lòng (+10 XP)</span>
        </button>
      </div>

    </div>
  );
};
