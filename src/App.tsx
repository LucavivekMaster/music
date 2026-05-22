import { Header } from './components/Header';
import { NoteCircle } from './components/NoteCircle';
import { ChordBuilder } from './components/ChordBuilder';
import { IntervalAnalysis } from './components/IntervalAnalysis';
import { SavedRecords } from './components/SavedRecords';
import { TheoryPanel } from './components/TheoryPanel';
import { ChordProgression } from './components/ChordProgression';
import { PianoKeyboard } from './components/PianoKeyboard';
import { EarTraining } from './components/EarTraining';
import { useMusicStore } from './store/musicStore';
import { audioPlayer } from './utils/audioPlayer';
import { detectChord } from './utils/musicTheory';
import { Play, X, ArrowUpDown, ChevronUp, ChevronDown, ChevronsUpDown, Shuffle } from 'lucide-react';
import { useState, useMemo } from 'react';

function App() {
  const { selectedNotes, clearNotes, currentOctave, setCurrentOctave, transposeSteps } = useMusicStore();
  
  const effectiveOctave = Math.max(0, Math.min(7, currentOctave + Math.floor(transposeSteps / 12)));
  
  const chordDetection = useMemo(() => {
    if (selectedNotes.length < 3) return null;
    return detectChord(selectedNotes);
  }, [selectedNotes]);

  const [arpeggioMode, setArpeggioMode] = useState<'up' | 'down' | 'upDown' | 'random'>('upDown');
  
  const arpeggioIcons = { up: ChevronUp, down: ChevronDown, upDown: ChevronsUpDown, random: Shuffle };
  const arpeggioLabels = { up: '上行', down: '下行', upDown: '交替', random: '随机' };
  const ArpeggioIcon = arpeggioIcons[arpeggioMode];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：音圈 + 和弦走向 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white/90">十二平均律音圈 · C3 ~ B3</h2>
                <div className="flex items-center gap-3">
                  <select
                    value={effectiveOctave}
                    onChange={(e) => setCurrentOctave(Number(e.target.value))}
                    className="bg-white/[0.06] border border-white/[0.1] rounded-lg px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-sky-400/50 cursor-pointer"
                  >
                    {[0,1,2,3,4,5,6,7].map(o => (
                      <option key={o} value={o} className="bg-slate-900">C{o}~B{o}</option>
                    ))}
                  </select>
                  <span className="text-xs text-gray-500 bg-white/[0.04] px-3 py-1 rounded-full">
                    拖拽旋转升八度
                  </span>
                </div>
              </div>
              <NoteCircle />
              <PianoKeyboard />
              
              {/* 音圈底部操作栏 */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center gap-3 min-w-0">
                  {chordDetection ? (
                    <span className="text-sm font-semibold text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded-lg truncate">
                      {chordDetection.displayName}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">
                      {selectedNotes.length > 0 
                        ? `已选中 ${selectedNotes.length} 个音符` 
                        : '未选中任何音符'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {selectedNotes.length > 0 && (
                    <>
                      <button
                        onClick={() => audioPlayer.playArpeggio(selectedNotes.map(n => n.midi), 'upDown', 180)}
                        className="btn-secondary flex items-center gap-1.5 text-sm px-3 py-2"
                        title="播放音阶"
                      >
                        <ArrowUpDown className="w-3.5 h-3.5" />
                        音阶
                      </button>
                      <button
                        onClick={() => {
                          const next: Record<string, 'up'|'down'|'upDown'|'random'> = { up: 'down', down: 'upDown', upDown: 'random', random: 'up' };
                          const mode = arpeggioMode;
                          setArpeggioMode(next[mode]);
                          audioPlayer.playArpeggio(selectedNotes.map(n => n.midi), next[mode], 120);
                        }}
                        className="btn-secondary flex items-center gap-1.5 text-sm px-3 py-2"
                        title={`琶音：${arpeggioLabels[arpeggioMode]}`}
                      >
                        <ArpeggioIcon className="w-3.5 h-3.5" />
                        琶音
                      </button>
                      <button
                        onClick={() => audioPlayer.playChord(selectedNotes.map(n => n.midi), 1.2)}
                        className="btn-primary flex items-center gap-1.5 text-sm px-3 py-2"
                      >
                        <Play className="w-3.5 h-3.5" />
                        试听
                      </button>
                      <button
                        onClick={clearNotes}
                        className="btn-secondary flex items-center gap-1.5 text-sm px-3 py-2"
                      >
                        <X className="w-3.5 h-3.5" />
                        清空
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
            <ChordProgression />
          </div>
          
          {/* 右侧：和弦构建 + 音程分析 + 听音训练 */}
          <div className="space-y-6">
            <ChordBuilder />
            <IntervalAnalysis />
            <EarTraining />
          </div>
        </div>
        
        <div className="mt-6">
          <SavedRecords />
        </div>
      </main>
      
      <footer className="border-t border-white/[0.06] bg-[#0b1120]/60 backdrop-blur-sm mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <p className="text-center text-xs text-gray-600">
            SplendidGrandPiano · C3-B3 真实采样 · 乐理学习工具
          </p>
        </div>
      </footer>
      
      <TheoryPanel />
    </div>
  );
}

export default App;
