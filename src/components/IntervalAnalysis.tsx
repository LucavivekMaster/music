import { useState } from 'react';
import { useMusicStore } from '../store/musicStore';
import { calculateAllIntervals } from '../utils/musicTheory';
import { Activity, Save, Trash2 } from 'lucide-react';

export function IntervalAnalysis() {
  const { selectedNotes, clearNotes, saveAnalysis } = useMusicStore();
  const [saveName, setSaveName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  const intervals = calculateAllIntervals(selectedNotes);
  
  const handleSave = () => {
    if (!saveName.trim() || intervals.length === 0) return;
    saveAnalysis(saveName, selectedNotes, intervals);
    setShowSaveModal(false);
    setSaveName('');
  };
  
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-purple-400" />
        音程分析
      </h3>
      
      {selectedNotes.length < 2 ? (
        <div className="text-center py-10">
          <Activity className="w-10 h-10 text-gray-600 mx-auto mb-3 opacity-30" />
          <p className="text-sm text-gray-500">请从音圈中选择至少两个音符</p>
          <p className="text-xs text-gray-600 mt-1">以分析它们之间的音程关系</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {intervals.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: item.from.color + '20', color: item.from.color }}
                    >
                      {item.from.name}
                    </div>
                    <span className="text-gray-600 text-sm">→</span>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: item.to.color + '20', color: item.to.color }}
                    >
                      {item.to.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-sm text-purple-300">{item.interval.name}</div>
                    <div className="text-[10px] text-gray-500">{item.interval.semitones} 半音</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">{item.interval.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              保存分析
            </button>
            <button
              onClick={clearNotes}
              className="btn-danger flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              清空
            </button>
          </div>
        </>
      )}
      
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">保存音程分析</h3>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="输入分析名称"
              className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-purple-400/50 mb-4 placeholder:text-gray-600"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowSaveModal(false)} className="flex-1 btn-secondary">
                取消
              </button>
              <button onClick={handleSave} className="flex-1 btn-primary">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
