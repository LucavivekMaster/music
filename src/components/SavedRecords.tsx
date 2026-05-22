import { useState } from 'react';
import { useMusicStore } from '../store/musicStore';
import { Note } from '../utils/musicTheory';
import { BookOpen, Trash2, Edit2, Check, X, Activity } from 'lucide-react';

type TabType = 'chords' | 'analyses';

export function SavedRecords() {
  const { savedChords, savedAnalyses, deleteChord, updateChord, deleteAnalysis, updateAnalysis } = useMusicStore();
  const [activeTab, setActiveTab] = useState<TabType>('chords');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  
  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };
  
  const handleSaveEdit = (type: TabType) => {
    if (!editingId || !editName.trim()) return;
    if (type === 'chords') {
      updateChord(editingId, editName);
    } else {
      updateAnalysis(editingId, editName);
    }
    setEditingId(null);
    setEditName('');
  };
  
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };
  
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-amber-400" />
        我的记录
      </h3>
      
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setActiveTab('chords')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'chords'
              ? 'bg-sky-500/15 text-sky-300 border border-sky-500/25'
              : 'bg-white/[0.04] text-gray-400 border border-transparent hover:bg-white/[0.08]'
          }`}
        >
          和弦 ({savedChords.length})
        </button>
        <button
          onClick={() => setActiveTab('analyses')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'analyses'
              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/25'
              : 'bg-white/[0.04] text-gray-400 border border-transparent hover:bg-white/[0.08]'
          }`}
        >
          音程分析 ({savedAnalyses.length})
        </button>
      </div>
      
      {activeTab === 'chords' ? (
        savedChords.length === 0 ? (
          <div className="text-center py-10">
            <BookOpen className="w-10 h-10 text-gray-600 mx-auto mb-3 opacity-25" />
            <p className="text-sm text-gray-500">暂无保存的和弦</p>
            <p className="text-xs text-gray-600 mt-1">在和弦构建器中创建和弦并保存</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {savedChords.map(chord => (
              <div key={chord.id} className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  {editingId === chord.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-primary-400"
                      />
                      <button onClick={() => handleSaveEdit('chords')} className="p-1 text-green-400 hover:bg-white/10 rounded">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={handleCancelEdit} className="p-1 text-gray-400 hover:bg-white/10 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium">{chord.name}</span>
                      <div className="flex gap-1">
                        <button onClick={() => handleStartEdit(chord.id, chord.name)} className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteChord(chord.id)} className="p-1 text-red-400 hover:bg-white/10 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {chord.notes.map((note: Note) => (
                    <div
                      key={note.midi}
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: note.color + '30', color: note.color }}
                    >
                      {note.name}{note.octave}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">{chord.description}</p>
              </div>
            ))}
          </div>
        )
      ) : (
        savedAnalyses.length === 0 ? (
          <div className="text-center py-10">
            <Activity className="w-10 h-10 text-gray-600 mx-auto mb-3 opacity-25" />
            <p className="text-sm text-gray-500">暂无保存的音程分析</p>
            <p className="text-xs text-gray-600 mt-1">在音程分析中分析音符并保存</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {savedAnalyses.map(analysis => (
              <div key={analysis.id} className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  {editingId === analysis.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-primary-400"
                      />
                      <button onClick={() => handleSaveEdit('analyses')} className="p-1 text-green-400 hover:bg-white/10 rounded">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={handleCancelEdit} className="p-1 text-gray-400 hover:bg-white/10 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium">{analysis.name}</span>
                      <div className="flex gap-1">
                        <button onClick={() => handleStartEdit(analysis.id, analysis.name)} className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteAnalysis(analysis.id)} className="p-1 text-red-400 hover:bg-white/10 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {analysis.notes.map((note: Note) => (
                    <div
                      key={note.midi}
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: note.color + '30', color: note.color }}
                    >
                      {note.name}{note.octave}
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  {analysis.intervals.map((item, index) => (
                    <div key={index} className="text-xs text-gray-400">
                      {item.from.name} → {item.to.name}: {item.interval.name} ({item.interval.semitones}半音)
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
