import { useMusicStore } from '../store/musicStore';
import { Music2, BookOpen } from 'lucide-react';

export function Header() {
  const { showTheoryPanel, toggleTheoryPanel } = useMusicStore();
  
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0b1120]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Music2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                乐理知识学习工具
              </h1>
              <p className="text-xs text-gray-500">和弦 · 音程 · 走向</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheoryPanel}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition-all duration-200 ${
                showTheoryPanel
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'bg-white/[0.05] text-gray-400 hover:text-white hover:bg-white/[0.1] border border-transparent'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              乐理知识
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
