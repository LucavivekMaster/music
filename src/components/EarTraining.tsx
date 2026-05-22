import { useState, useCallback, useEffect } from 'react';
import { Ear, Play, RotateCw, Check } from 'lucide-react';
import { useMusicStore } from '../store/musicStore';
import { audioPlayer } from '../utils/audioPlayer';
import { CHORD_TYPES, createNote, generateChord, NOTE_NAMES, ChordType } from '../utils/musicTheory';

const CHORD_OPTIONS: ChordType[] = ['major', 'minor', 'diminished', 'augmented', 'sus2', 'sus4'];

interface Question {
  root: string;
  type: ChordType;
  chordNotes: string[];
}

function randomPick<T>(ary: T[]): T {
  return ary[Math.floor(Math.random() * ary.length)];
}

export function EarTraining() {
  const { selectedNotes, clearNotes, currentOctave, transposeSteps } = useMusicStore();
  const [question, setQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  
  const effectiveOctave = Math.max(0, Math.min(7, currentOctave + Math.floor(transposeSteps / 12)));
  
  const newQuestion = useCallback(() => {
    clearNotes();
    setFeedback(null);
    const root = randomPick(NOTE_NAMES);
    const type = randomPick(CHORD_OPTIONS);
    const rootNote = createNote(root, effectiveOctave);
    const chord = generateChord(rootNote, type);
    setQuestion({ root, type, chordNotes: chord.map(n => n.name) });
    // 稍后播放
    setTimeout(() => {
      audioPlayer.playChord(chord.map(n => n.midi), 1.5);
    }, 300);
  }, [clearNotes, effectiveOctave]);
  
  // 首次加载出题
  useEffect(() => { newQuestion(); }, []);
  
  // 检查答案
  const checkAnswer = useCallback(() => {
    if (!question || selectedNotes.length === 0) return;
    const selectedNames = new Set(selectedNotes.map(n => n.name));
    const expectedNames = new Set(question.chordNotes);
    const correct = selectedNames.size === expectedNames.size && 
      [...selectedNames].every(n => expectedNames.has(n));
    
    if (correct) {
      setFeedback('correct');
      setScore(s => s + 10 + streak * 5);
      setStreak(s => s + 1);
    } else {
      setFeedback('wrong');
      setStreak(0);
    }
  }, [question, selectedNotes]);
  
  const replayChord = useCallback(() => {
    if (!question) return;
    const rootNote = createNote(question.root, effectiveOctave);
    const chord = generateChord(rootNote, question.type);
    audioPlayer.playChord(chord.map(n => n.midi), 1.5);
  }, [question]);
  
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Ear className="w-5 h-5 text-amber-400" />
        听音训练
      </h3>
      
      <div className="space-y-4">
        {/* 分数 */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">得分</span>
          <span className="text-amber-400 font-mono font-bold">{score}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">连对</span>
          <span className="text-emerald-400 font-mono">{streak}</span>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button onClick={replayChord} className="flex-1 btn-secondary flex items-center justify-center gap-1.5 text-sm py-2">
            <Play className="w-4 h-4" /> 重播
          </button>
          <button onClick={checkAnswer} className="flex-1 btn-primary flex items-center justify-center gap-1.5 text-sm py-2">
            <Check className="w-4 h-4" /> 检查
          </button>
        </div>
        
        {/* 反馈 */}
        {feedback && (
          <div className={`p-3 rounded-xl text-sm font-semibold text-center ${
            feedback === 'correct' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' :
            'bg-red-500/15 text-red-300 border border-red-500/20'
          }`}>
            {feedback === 'correct' ? (
              <span>正确！{question && `${question.root}${CHORD_TYPES[question.type].name}`}</span>
            ) : (
              <span>不对，再试试</span>
            )}
          </div>
        )}
        
        {/* 下一题 */}
        {feedback && (
          <button onClick={newQuestion} className="w-full btn-secondary flex items-center justify-center gap-2 py-2 text-sm">
            <RotateCw className="w-4 h-4" /> 下一题
          </button>
        )}
        
        {/* 选中音符匹配 */}
        {question && selectedNotes.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {selectedNotes.map(note => (
              <span key={note.midi} className={`px-2 py-1 rounded-lg text-xs font-mono ${
                question.chordNotes.includes(note.name) 
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' 
                  : 'bg-red-500/10 text-red-300 border border-red-500/10'
              }`}>
                {note.name}{question.chordNotes.includes(note.name) ? ' ✓' : ' ✗'}
              </span>
            ))}
          </div>
        )}
        
        {!question && (
          <div className="text-center py-6 text-gray-500 text-sm">点击下一题开始</div>
        )}
      </div>
    </div>
  );
}
