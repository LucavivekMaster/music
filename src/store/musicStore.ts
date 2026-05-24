import { create } from 'zustand';
import { Note, Chord, ChordType, getNoteByMidi } from '../utils/musicTheory';
import { audioPlayer } from '../utils/audioPlayer';

interface SavedChord extends Chord {
  savedAt: number;
}

interface SavedAnalysis {
  id: string;
  name: string;
  notes: Note[];
  intervals: { from: Note; to: Note; interval: { name: string; semitones: number; description: string } }[];
  savedAt: number;
}

interface MusicStore {
  selectedNotes: Note[];
  savedChords: SavedChord[];
  savedAnalyses: SavedAnalysis[];
  activeChordType: ChordType;
  showTheoryPanel: boolean;
  chordProgression: Array<{ root: string; type: ChordType }>;
  transposeSteps: number;
  currentOctave: number;
  circleMode: 'chromatic' | 'circleOfFifths';
  
  addNote: (note: Note) => void;
  removeNote: (note: Note) => void;
  clearNotes: () => void;
  setActiveChordType: (type: ChordType) => void;
  toggleTheoryPanel: () => void;
  setChordProgression: (progression: Array<{ root: string; type: ChordType }>) => void;
  setTransposeSteps: (steps: number) => void;
  setCurrentOctave: (octave: number) => void;
  setCircleMode: (mode: 'chromatic' | 'circleOfFifths') => void;
  transposeSelection: (delta: number) => void;
  
  saveChord: (name: string, chord: Omit<Chord, 'id' | 'name'>) => void;
  deleteChord: (id: string) => void;
  updateChord: (id: string, name: string) => void;
  
  saveAnalysis: (name: string, notes: Note[], intervals: { from: Note; to: Note; interval: { name: string; semitones: number; description: string } }[]) => void;
  deleteAnalysis: (id: string) => void;
  updateAnalysis: (id: string, name: string) => void;
}

export const useMusicStore = create<MusicStore>((set) => ({
  selectedNotes: [],
  savedChords: [],
  savedAnalyses: [],
  activeChordType: 'major',
  showTheoryPanel: false,
  chordProgression: [],
  transposeSteps: 0,
  currentOctave: 3,
  circleMode: 'chromatic',
  
  addNote: (note) => {
    set((state) => {
      const exists = state.selectedNotes.some(n => n.midi === note.midi);
      if (exists) return state;
      const newNotes = [...state.selectedNotes, note];
      newNotes.sort((a, b) => a.midi - b.midi);
      // 播放全部已选音符（含新加的），实时听到和弦
      audioPlayer.playChord(newNotes.map(n => n.midi), 1.2);
      return { selectedNotes: newNotes };
    });
  },
  
  removeNote: (note) => set((state) => ({
    selectedNotes: state.selectedNotes.filter(n => n.midi !== note.midi),
  })),
  
  clearNotes: () => {
    audioPlayer.stopAll();
    set({ selectedNotes: [] });
  },
  
  setActiveChordType: (type) => set({ activeChordType: type }),
  
  toggleTheoryPanel: () => set((state) => ({ showTheoryPanel: !state.showTheoryPanel })),
  
  setChordProgression: (progression) => set({ chordProgression: progression }),
  
  setTransposeSteps: (steps) => set({ transposeSteps: steps }),
  
  setCurrentOctave: (octave) => set({ currentOctave: octave, transposeSteps: 0 }),
  
  transposeSelection: (delta) => set((state) => {
    if (delta === 0 || state.selectedNotes.length === 0) return state;
    const newNotes = state.selectedNotes.map(note => getNoteByMidi(note.midi + delta));
    return { selectedNotes: newNotes };
  }),
  
  setCircleMode: (mode) => set({ circleMode: mode }),
  
  saveChord: (name, chord) => set((state) => ({
    savedChords: [...state.savedChords, { ...chord, id: Date.now().toString(), name, savedAt: Date.now() }],
  })),
  
  deleteChord: (id) => set((state) => ({
    savedChords: state.savedChords.filter(c => c.id !== id),
  })),
  
  updateChord: (id, name) => set((state) => ({
    savedChords: state.savedChords.map(c => c.id === id ? { ...c, name } : c),
  })),
  
  saveAnalysis: (name, notes, intervals) => set((state) => ({
    savedAnalyses: [...state.savedAnalyses, { id: Date.now().toString(), name, notes, intervals, savedAt: Date.now() }],
  })),
  
  deleteAnalysis: (id) => set((state) => ({
    savedAnalyses: state.savedAnalyses.filter(a => a.id !== id),
  })),
  
  updateAnalysis: (id, name) => set((state) => ({
    savedAnalyses: state.savedAnalyses.map(a => a.id === id ? { ...a, name } : a),
  })),
}));
