import { useState } from 'react';
import { useMusicStore } from '../store/musicStore';
import { Note, CHORD_TYPES, ChordType, generateChord, createNote, NOTE_NAMES } from '../utils/musicTheory';
import { audioPlayer } from '../utils/audioPlayer';
import { Plus, Save, RotateCcw, Play } from 'lucide-react';

export function ChordBuilder() {
  const { selectedNotes, activeChordType, setActiveChordType, saveChord, clearNotes, addNote, currentOctave, transposeSteps } = useMusicStore();
  const [rootNote, setRootNote] = useState('C');
  const [saveName, setSaveName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  const effectiveOctave = Math.max(0, Math.min(7, currentOctave + Math.floor(transposeSteps / 12)));
  
  const handleChordGeneration = () => {
    const root = createNote(rootNote, effectiveOctave);
    const chordNotes = generateChord(root, activeChordType);
    clearNotes();
    chordNotes.forEach(note => addNote(note));
    audioPlayer.playChord(chordNotes.map(n => n.midi), 1.2);
  };
  
  const handlePlayCurrent = () => {
    if (selectedNotes.length > 0) {
      audioPlayer.playChord(selectedNotes.map(n => n.midi), 1.2);
    }
  };
  
  const handleSave = () => {
    if (!saveName.trim() || selectedNotes.length === 0) return;
    saveChord(saveName, {
      notes: selectedNotes,
      type: activeChordType,
      intervals: CHORD_TYPES[activeChordType].intervals,
      description: CHORD_TYPES[activeChordType].description,
    });
    setShowSaveModal(false);
    setSaveName('');
  };
  
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5 text-emerald-400" />
        和弦构建器
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">根音</label>
          <select
            value={rootNote}
            onChange={(e) => setRootNote(e.target.value)}
            className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/20 transition-all appearance-none cursor-pointer"
          >
            {NOTE_NAMES.map(note => (
              <option key={note} value={note} className="bg-slate-900">
                {note}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">和弦类型</label>
          <div className="grid grid-cols-2 gap-1.5">
            {(Object.entries(CHORD_TYPES) as [ChordType, typeof CHORD_TYPES[ChordType]][]).map(([type, info]) => (
              <button
                key={type}
                onClick={() => setActiveChordType(type)}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  activeChordType === type
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/[0.04] text-gray-400 border border-transparent hover:bg-white/[0.08] hover:text-gray-300'
                }`}
              >
                {info.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
          <p className="text-xs text-gray-500 leading-relaxed">{CHORD_TYPES[activeChordType].description}</p>
        </div>
        
        <button
          onClick={handleChordGeneration}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          生成和弦
        </button>
      </div>
      
      {selectedNotes.length > 0 && (
        <div className="mt-6 pt-5 border-t border-white/[0.06]">
          <h4 className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-wider">当前选中的音符</h4>
          <div className="flex flex-wrap gap-1.5">
            {selectedNotes.map((note: Note) => (
              <div
                key={note.midi}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{ backgroundColor: note.color + '20', color: note.color, border: `1px solid ${note.color}30` }}
              >
                {note.name}<span className="opacity-60">{note.octave}</span>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={handlePlayCurrent}
              disabled={selectedNotes.length === 0}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              试听和弦
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          </div>
        </div>
      )}
      
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4">保存和弦</h3>
            <input
              type="text"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="输入和弦名称"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-400 mb-4"
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
