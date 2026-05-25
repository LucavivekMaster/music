import { useCallback, useMemo } from 'react';
import { createNote } from '../utils/musicTheory';
import { useMusicStore } from '../store/musicStore';
import { audioPlayer } from '../utils/audioPlayer';

const WHITE_KEYS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const BLACK_KEYS: Record<string, { left: string }> = {
  'C#': { left: 'C' },
  'D#': { left: 'D' },
  'F#': { left: 'F' },
  'G#': { left: 'G' },
  'A#': { left: 'A' },
};

export function PianoKeyboard() {
  const { selectedNotes, currentOctave, transposeSteps, setFlashMidi } = useMusicStore();

  const effectiveOctave = useMemo(
    () => Math.max(0, Math.min(7, currentOctave + Math.floor(transposeSteps / 12))),
    [currentOctave, transposeSteps],
  );

  // 白键 MIDI
  const whiteMidis = useMemo(
    () => WHITE_KEYS.map(k => createNote(k, effectiveOctave).midi),
    [effectiveOctave],
  );

  // 黑键 MIDI
  const blackMidis = useMemo(
    () => Object.fromEntries(
      Object.entries(BLACK_KEYS).map(([k]) => [k, createNote(k, effectiveOctave).midi]),
    ),
    [effectiveOctave],
  );

  const selectedMidis = useMemo(() => new Set(selectedNotes.map(n => n.midi)), [selectedNotes]);

  const playKey = useCallback((midi: number) => {
    audioPlayer.playNote(midi, 0);
    setFlashMidi(midi);
  }, [setFlashMidi]);

  const whiteKeyWidth = 28;
  const totalWidth = WHITE_KEYS.length * whiteKeyWidth;

  return (
    <div className="mt-4 pt-4 border-t border-white/[0.06]">
      <div className="flex items-center justify-center" style={{ height: 100 }}>
        <div className="relative" style={{ width: totalWidth, height: 100 }}>
          {/* 白键 */}
          {WHITE_KEYS.map((key, i) => {
            const midi = whiteMidis[i];
            const selected = selectedMidis.has(midi);
            return (
              <div key={key} onClick={() => playKey(midi)}
                className={`absolute top-0 rounded-b-md cursor-pointer transition-colors duration-100 hover:brightness-90 ${
                  selected ? 'bg-sky-500' : 'bg-white'
                }`}
                style={{ left: i * whiteKeyWidth, width: whiteKeyWidth - 1, height: 100 }}>
                <span className={`absolute bottom-2 w-full text-center text-[10px] font-semibold ${selected ? 'text-white' : 'text-slate-400'}`}>
                  {key}{effectiveOctave}
                </span>
              </div>
            );
          })}

          {/* 黑键 */}
          {Object.entries(BLACK_KEYS).map(([key, { left: whiteKey }]) => {
            const whiteIndex = WHITE_KEYS.indexOf(whiteKey);
            const midi = blackMidis[key];
            const selected = selectedMidis.has(midi);
            return (
              <div key={key} onClick={(e) => { e.stopPropagation(); playKey(midi); }}
                className={`absolute top-0 rounded-b-sm cursor-pointer transition-colors duration-100 z-10 hover:brightness-75 ${
                  selected ? 'bg-sky-400' : 'bg-slate-800'
                }`}
                style={{ left: (whiteIndex + 1) * whiteKeyWidth - 9, width: 18, height: 62 }} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
