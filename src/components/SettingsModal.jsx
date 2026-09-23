import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Key, ShieldCheck, Sparkles, CheckCircle2, AlertCircle, Bot } from 'lucide-react';

export const SettingsModal = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    openAiKey,
    setOpenAiKey,
    selectedModel,
    setSelectedModel
  } = useApp();

  const [inputKey, setInputKey] = useState(openAiKey);
  const [model, setModel] = useState(selectedModel);
  const [statusMsg, setStatusMsg] = useState(null);

  if (!isSettingsOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    setOpenAiKey(inputKey.trim());
    setSelectedModel(model);
    setStatusMsg({ type: 'success', text: 'Đã lưu cấu hình OpenAI API Key thành công!' });
    setTimeout(() => {
      setIsSettingsOpen(false);
      setStatusMsg(null);
    }, 1200);
  };

  const handleRemoveKey = () => {
    setInputKey('');
    setOpenAiKey('');
    setStatusMsg({ type: 'info', text: 'Đã xoá API Key. Ứng dụng chuyển về chế độ Demo.' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg glass-panel rounded-2xl border border-slate-700/60 p-6 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={() => setIsSettingsOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Cấu Hình API Key ChatGPT</h2>
            <p className="text-xs text-slate-400">Kích hoạt trợ lý gia sư AI phân tích & luyện hội thoại 1-1</p>
          </div>
        </div>

        {/* Status Toast */}
        {statusMsg && (
          <div className={`mb-4 p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* API Key Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              OpenAI API Key (`sk-...`)
            </label>
            <div className="relative">
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 font-mono outline-none transition"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              API Key được lưu bảo mật 100% trong trình duyệt local storage của bạn, không qua máy chủ trung gian.
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Chọn Model OpenAI
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setModel('gpt-4o-mini')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  model === 'gpt-4o-mini'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-semibold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1 text-xs font-bold mb-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  gpt-4o-mini
                </div>
                <div className="text-[10px] text-slate-400">Nhanh, rẻ (Đề xuất)</div>
              </button>

              <button
                type="button"
                onClick={() => setModel('gpt-4o')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  model === 'gpt-4o'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-semibold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1 text-xs font-bold mb-0.5">
                  <Bot className="w-3.5 h-3.5" />
                  gpt-4o
                </div>
                <div className="text-[10px] text-slate-400">Thông minh nhất</div>
              </button>

              <button
                type="button"
                onClick={() => setModel('gpt-3.5-turbo')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  model === 'gpt-3.5-turbo'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-semibold'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1 text-xs font-bold mb-0.5">
                  <Bot className="w-3.5 h-3.5" />
                  gpt-3.5-turbo
                </div>
                <div className="text-[10px] text-slate-400">Tiêu chuẩn</div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            {inputKey ? (
              <button
                type="button"
                onClick={handleRemoveKey}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
              >
                Xoá API Key
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition"
              >
                Lưu Thay Đổi
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
