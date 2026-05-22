import { useState } from 'react';
import { useMusicStore } from '../store/musicStore';
import { CHORD_TYPES, INTERVALS, ChordType } from '../utils/musicTheory';
import { Book, Music, Ruler, X } from 'lucide-react';

type SectionType = 'chords' | 'intervals';

export function TheoryPanel() {
  const { showTheoryPanel, toggleTheoryPanel } = useMusicStore();
  const [activeSection, setActiveSection] = useState<SectionType>('chords');
  
  if (!showTheoryPanel) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-40">
      <div className="w-full max-w-lg h-full glass-card border-l border-white/10 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Book className="w-6 h-6 text-primary-400" />
            乐理知识
          </h2>
          <button onClick={toggleTheoryPanel} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveSection('chords')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              activeSection === 'chords' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Music className="w-4 h-4" />
            和弦类型
          </button>
          <button
            onClick={() => setActiveSection('intervals')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
              activeSection === 'intervals' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Ruler className="w-4 h-4" />
            音程关系
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {activeSection === 'chords' ? (
            <div className="space-y-4">
              {(Object.entries(CHORD_TYPES) as [ChordType, typeof CHORD_TYPES[ChordType]][]).map(([type, info]) => (
                <div key={type} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-primary-400">{info.name}</span>
                    <span className="text-xs text-gray-400">
                      音程: {info.intervals.join(', ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{info.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.values(INTERVALS).map(interval => (
                <div key={interval.semitones} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-purple-400">{interval.name}</span>
                    <span className="text-xs text-gray-400">{interval.semitones} 半音</span>
                  </div>
                  <p className="text-sm text-gray-300">{interval.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-400 mb-2">操作提示</h4>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• 点击音圈上的音符可以选中/取消选中</li>
              <li>• 使用和弦构建器可以快速生成和弦</li>
              <li>• 选择多个音符可以分析音程关系</li>
              <li>• 保存功能可以记录您的创作</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
