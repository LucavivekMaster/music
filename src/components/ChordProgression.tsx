import { useState, useCallback } from 'react';
import { Music, Play, ArrowRight } from 'lucide-react';
import { 
  generateChordProgressions, 
  getChordDisplayName, 
  ChordProgression as IChordProgression,
  NOTE_NAMES,
  CHORD_TYPES,
  generateChord,
  createNote,
  ChordType
} from '../utils/musicTheory';
import { useMusicStore } from '../store/musicStore';
import { audioPlayer } from '../utils/audioPlayer';

export function ChordProgression() {
  const { setChordProgression, clearNotes, addNote, currentOctave, transposeSteps } = useMusicStore();
  const [selectedRoot, setSelectedRoot] = useState('C');
  const [selectedType, setSelectedType] = useState<ChordType>('major');
  const [progressions, setProgressions] = useState<IChordProgression[]>([]);
  
  const effectiveOctave = Math.max(0, Math.min(7, currentOctave + Math.floor(transposeSteps / 12)));
  
  const generateRecommendations = useCallback(() => {
    const recommendations = generateChordProgressions(selectedRoot, selectedType, 5);
    setProgressions(recommendations);
  }, [selectedRoot, selectedType]);
  
  const playProgression = useCallback((progression: IChordProgression) => {
    clearNotes();
    
    let prevNotes: ReturnType<typeof generateChord> | undefined;
    
    progression.chords.forEach((chord, index) => {
      setTimeout(() => {
        const rootNote = createNote(chord.root, effectiveOctave);
        const chordNotes = generateChord(rootNote, chord.type, prevNotes);
        prevNotes = chordNotes;
        chordNotes.forEach(note => addNote(note));
        audioPlayer.playChord(chordNotes.map(n => n.midi), 1.2);
      }, index * 1000);
    });
  }, [clearNotes, addNote, effectiveOctave]);
  
  const selectProgression = useCallback((progression: IChordProgression) => {
    setChordProgression(progression.chords.map(c => ({ root: c.root, type: c.type })));
  }, [setChordProgression]);
  
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Music className="w-5 h-5 text-sky-400" />
        和弦走向推荐
      </h3>
      
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5 uppercase tracking-wider">起始根音</label>
            <select
              value={selectedRoot}
              onChange={(e) => setSelectedRoot(e.target.value)}
              className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/20 transition-all appearance-none cursor-pointer"
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
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as ChordType)}
              className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-sky-400/50 focus:ring-1 focus:ring-sky-400/20 transition-all appearance-none cursor-pointer"
            >
              {Object.entries(CHORD_TYPES).map(([type, info]) => (
                <option key={type} value={type} className="bg-slate-900">
                  {info.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            generateRecommendations();
          }}
          className="w-full btn-primary flex items-center justify-center gap-2 relative z-10"
        >
          <ArrowRight className="w-4 h-4" />
          生成推荐
        </button>
      </div>
      
      {progressions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs text-gray-500 font-medium uppercase tracking-wider">推荐和弦走向</h4>
          
          {progressions.map((progression, index) => (
            <div
              key={index}
              className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] hover:border-sky-400/30 hover:bg-white/[0.05] transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white/80">{progression.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => playProgression(progression)}
                    className="p-2 bg-sky-500/15 hover:bg-sky-500/25 rounded-lg transition-colors"
                    title="播放"
                  >
                    <Play className="w-4 h-4 text-sky-400" />
                  </button>
                  <button
                    onClick={() => selectProgression(progression)}
                    className="px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.12] rounded-lg text-xs font-medium transition-colors"
                  >
                    选择
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 flex-wrap">
                {progression.chords.map((chord, cIndex) => (
                  <div key={cIndex} className="flex items-center gap-1">
                    <div 
                      className="px-3 py-2 rounded-lg font-mono text-xs font-semibold shadow-sm"
                      style={{ 
                        backgroundColor: chord.type.includes('major') || chord.type === 'major'
                          ? 'rgba(59, 130, 246, 0.15)'
                          : chord.type.includes('minor') || chord.type === 'minor'
                            ? 'rgba(236, 72, 153, 0.15)'
                            : chord.type.includes('dominant')
                              ? 'rgba(234, 179, 8, 0.18)'
                              : 'rgba(168, 85, 247, 0.15)',
                        border: `1px solid ${
                          chord.type.includes('major') || chord.type === 'major'
                            ? 'rgba(59, 130, 246, 0.25)'
                            : chord.type.includes('minor') || chord.type === 'minor'
                              ? 'rgba(236, 72, 153, 0.25)'
                              : chord.type.includes('dominant')
                                ? 'rgba(234, 179, 8, 0.3)'
                                : 'rgba(168, 85, 247, 0.25)'
                        }`,
                        color: chord.type.includes('major') || chord.type === 'major'
                          ? '#93c5fd'
                          : chord.type.includes('minor') || chord.type === 'minor'
                            ? '#f9a8d4'
                            : chord.type.includes('dominant')
                              ? '#fde047'
                              : '#c4b5fd'
                      }}
                    >
                      {getChordDisplayName(chord.root, chord.type)}
                      <span className="text-[10px] text-gray-500 ml-1 opacity-70">({chord.roman})</span>
                    </div>
                    {cIndex < progression.chords.length - 1 && (
                      <span className="text-gray-600 text-sm mx-0.5">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {progressions.length === 0 && (
        <div className="text-center py-10">
          <Music className="w-10 h-10 text-gray-600 mx-auto mb-3 opacity-25" />
          <p className="text-sm text-gray-500">选择根音与和弦类型，点击生成推荐</p>
        </div>
      )}
    </div>
  );
}
