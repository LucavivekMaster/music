import { useState, useCallback, useMemo, useRef } from 'react';
import { NOTE_NAMES, NOTE_COLORS, NOTE_NAMES_CN, createNote } from '../utils/musicTheory';
import { useMusicStore } from '../store/musicStore';
import { audioPlayer } from '../utils/audioPlayer';

const STEP_DEGREES = 30;
const FIFTHS_ORDER = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];

// 单圈模式常量
const CENTER = 200;
const RADIUS = 150;

// 多八度同心圆常量
const M_CENTER = 260;
const M_RADII = [60, 105, 150, 195, 240];
const M_OCTAVES = [1, 2, 3, 4, 5];

const MODE_LABELS: Record<string, string> = {
  chromatic: '半音圈',
  circleOfFifths: '五度圈',
  multiOctave: '多八度',
};
const MODE_NEXT: Record<string, 'chromatic' | 'circleOfFifths' | 'multiOctave'> = {
  chromatic: 'circleOfFifths',
  circleOfFifths: 'multiOctave',
  multiOctave: 'chromatic',
};

interface NotePos { x: number; y: number; angle: number; noteName: string; octave: number; midi: number; color: string; isSharp: boolean; }

export function NoteCircle() {
  const { selectedNotes, addNote, removeNote, transposeSteps, setTransposeSteps, transposeSelection, circleMode, setCircleMode, currentOctave } = useMusicStore();
  const [animatingNote, setAnimatingNote] = useState<string | null>(null);

  const effectiveOctave = useMemo(() =>
    Math.max(0, Math.min(7, currentOctave + Math.floor(transposeSteps / 12))),
  [currentOctave, transposeSteps]);

  const isMulti = circleMode === 'multiOctave';

  // ── 拖拽旋转 ──
  const isDragging = useRef(false);
  const dragPrevAngle = useRef(0);
  const dragAccumAngle = useRef(0);
  const dragStartSteps = useRef(0);
  const dragLastStep = useRef(0);

  const getAngle = useCallback((cx: number, cy: number): number => {
    const svg = document.querySelector('.note-circle-svg');
    if (!svg) return 0;
    const r = svg.getBoundingClientRect();
    return Math.atan2(cy - r.top - r.height / 2, cx - r.left - r.width / 2);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if ((e.target as SVGElement).closest('.note-group')) return;
    e.preventDefault();
    isDragging.current = true;
    dragPrevAngle.current = getAngle(e.clientX, e.clientY);
    dragAccumAngle.current = 0;
    dragStartSteps.current = transposeSteps;
    dragLastStep.current = 0;
    (e.target as SVGElement).setPointerCapture?.(e.pointerId);
  }, [transposeSteps, getAngle]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const raw = getAngle(e.clientX, e.clientY);
    let diff = raw - dragPrevAngle.current;
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;
    dragPrevAngle.current = raw;
    dragAccumAngle.current += diff;
    const stepRad = (STEP_DEGREES * Math.PI) / 180;
    const totalSteps = Math.round(dragAccumAngle.current / stepRad);
    if (totalSteps === dragLastStep.current) return;
    const stepDiff = totalSteps - dragLastStep.current;
    if (stepDiff !== 0) {
      transposeSelection(stepDiff);
      dragLastStep.current = totalSteps;
      setTransposeSteps(dragStartSteps.current + dragLastStep.current);
      const st = useMusicStore.getState();
      if (st.selectedNotes.length > 0) audioPlayer.playChord(st.selectedNotes.map(n => n.midi), 1.2);
    }
  }, [getAngle, transposeSelection, setTransposeSteps]);

  const handlePointerUp = useCallback(() => { isDragging.current = false; }, []);

  // ── 选中逻辑 ──
  const toggleNoteByMidi = useCallback((noteName: string, octave: number, midi: number) => {
    const existing = selectedNotes.find(n => n.midi === midi);
    if (existing) {
      removeNote(existing);
    } else {
      addNote(createNote(noteName, octave));
      setAnimatingNote(noteName);
      setTimeout(() => setAnimatingNote(null), 300);
    }
  }, [addNote, removeNote, selectedNotes]);

  // ── 单圈模式 位置计算 ──
  const singlePositions = useMemo(() => {
    if (isMulti) return [];
    const order = circleMode === 'chromatic' ? NOTE_NAMES : FIFTHS_ORDER;
    return order.map((name, i) => {
      const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
      const note = createNote(name, effectiveOctave);
      return {
        x: CENTER + RADIUS * Math.cos(angle),
        y: CENTER + RADIUS * Math.sin(angle),
        angle, noteName: name, octave: effectiveOctave, midi: note.midi,
        color: NOTE_COLORS[name], isSharp: name.includes('#'),
      } as NotePos;
    });
  }, [circleMode, effectiveOctave, isMulti]);

  // ── 多八度同心圆位置 ──
  const multiPositions = useMemo(() => {
    if (!isMulti) return [];
    const pts: NotePos[] = [];
    for (let ri = 0; ri < M_RADII.length; ri++) {
      const r = M_RADII[ri];
      const oct = M_OCTAVES[ri];
      NOTE_NAMES.forEach((name, ni) => {
        const angle = (ni / 12) * 2 * Math.PI - Math.PI / 2;
        const note = createNote(name, oct);
        pts.push({
          x: M_CENTER + r * Math.cos(angle),
          y: M_CENTER + r * Math.sin(angle),
          angle, noteName: name, octave: oct, midi: note.midi,
          color: NOTE_COLORS[name], isSharp: name.includes('#'),
        });
      });
    }
    return pts;
  }, [isMulti]);

  const allPositions = isMulti ? multiPositions : singlePositions;

  // ── 多边形（仅单圈模式） ──
  const polygonPoints = useMemo(() => {
    if (isMulti || selectedNotes.length < 3) return null;
    const pts = singlePositions
      .filter(p => selectedNotes.some(n => n.name === p.noteName))
      .sort((a, b) => a.angle - b.angle);
    return pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  }, [selectedNotes, singlePositions, isMulti]);

  // ── 五度圈弧线 ──
  const fifthArcs = useMemo(() => {
    if (circleMode !== 'circleOfFifths') return null;
    return singlePositions.map((from, i) => {
      const to = singlePositions[(i + 1) % 12];
      return { from, to, r: RADIUS - 20 };
    });
  }, [circleMode, singlePositions]);

  // ── 渲染尺寸 ──
  const svgSize = isMulti ? 520 : 400;
  const svgCX = isMulti ? M_CENTER : CENTER;
  const svgCY = isMulti ? M_CENTER : CENTER;

  return (
    <div className={`relative w-full flex items-center justify-center select-none ${isMulti ? 'h-[540px]' : 'h-[400px]'}`}>
      <button onClick={() => setCircleMode(MODE_NEXT[circleMode])}
        className="absolute top-0 left-0 z-10 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg px-2.5 py-1 text-xs text-gray-300 transition-colors">
        {MODE_LABELS[circleMode]}
      </button>

      <svg width={svgSize} height={svgSize}
        className={`note-circle-svg drop-shadow-2xl ${isDragging.current ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
        <defs>
          <radialGradient id="circleGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(14,165,233,0.3)" /><stop offset="100%" stopColor="rgba(14,165,233,0)" />
          </radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="strongGlow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="pulseGlow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        {/* 背景圈 */}
        {isMulti ? (
          M_RADII.map((r, i) => (
            <circle key={i} cx={M_CENTER} cy={M_CENTER} r={r} fill="none"
              stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray={i === 2 ? '0' : '4,6'} />
          ))
        ) : (
          <>
            <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="url(#circleGlow)" />
            <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
            <circle cx={CENTER} cy={CENTER} r={RADIUS * 0.7} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <circle cx={CENTER} cy={CENTER} r={RADIUS * 0.4} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          </>
        )}

        {/* 多边形 */}
        {polygonPoints && (
          <polygon points={polygonPoints} fill="rgba(14,165,233,0.08)" stroke="rgba(56,189,248,0.4)" strokeWidth="1.5" strokeDasharray="6,3" className="pointer-events-none" />
        )}

        {/* 五度圈弧线 */}
        {fifthArcs && fifthArcs.map(({ from, to, r }, i) => (
          <path key={i} d={`M ${from.x},${from.y} A ${r},${r} 0 0,1 ${to.x},${to.y}`}
            fill="none" stroke="rgba(234,179,8,0.15)" strokeWidth="1" strokeDasharray="3,5" className="pointer-events-none" />
        ))}

        {/* 音符 */}
        {allPositions.map(p => {
          const selected = selectedNotes.some(n => n.midi === p.midi);
          const nr = isMulti ? (p.isSharp ? 7 : 9) : (p.isSharp ? 18 : 22);
          return (
            <g key={`${p.noteName}-${p.octave}`} className="cursor-pointer note-group"
              onClick={e => { e.stopPropagation(); toggleNoteByMidi(p.noteName, p.octave, p.midi); }}>
              <circle cx={p.x} cy={p.y} r={nr + 10} fill="transparent" />
              {!selected && <circle cx={p.x} cy={p.y} r={nr + 4} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" className="note-hover-ring" />}
              {selected && <circle cx={p.x} cy={p.y} r={nr + 6} fill="none" stroke={p.color} strokeWidth="2" opacity="0.6" filter="url(#strongGlow)" />}
              {animatingNote === p.noteName && <circle cx={p.x} cy={p.y} r={nr + 10} fill="none" stroke={p.color} strokeWidth="3" opacity="0.8" filter="url(#pulseGlow)" className="note-pulse-ring" />}
              <circle cx={p.x} cy={p.y} r={selected ? nr + 2 : nr} fill={selected ? p.color : 'rgba(30,41,59,0.9)'}
                stroke={selected ? p.color : 'rgba(255,255,255,0.3)'} strokeWidth={selected ? 3 : 1.5}
                filter={selected ? 'url(#strongGlow)' : 'url(#glow)'} className="pointer-events-none"
                style={{ transition: 'all 0.2s ease-out' }} />
              {!isMulti && (
                <>
                  <circle cx={p.x - nr * 0.3} cy={p.y - nr * 0.3} r={nr * 0.35} fill="rgba(255,255,255,0.3)" className="pointer-events-none" />
                  <text x={p.x} y={p.y + 5} textAnchor="middle" fill={selected ? '#fff' : 'rgba(255,255,255,0.9)'}
                    fontSize={p.isSharp ? '10' : '12'} fontWeight={selected ? '800' : '700'}
                    className="pointer-events-none" style={{ textShadow: selected ? `0 0 10px ${p.color}` : 'none' }}>
                    {NOTE_NAMES_CN[NOTE_NAMES.indexOf(p.noteName)]}
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* 中心标签 */}
        <circle cx={svgCX} cy={svgCY} r={isMulti ? 18 : 22} fill="rgba(14,165,233,0.12)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
        <text x={svgCX} y={svgCY + 4} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="11" fontWeight="500">
          {circleMode === 'chromatic' ? `C${effectiveOctave}~B${effectiveOctave}` : circleMode === 'circleOfFifths' ? '五度' : `C1~C5`}
        </text>
      </svg>

      <style>{`
        @keyframes pulse-ring { 0%{r:20px;opacity:0.8} 100%{r:45px;opacity:0} }
        .note-pulse-ring{animation:pulse-ring 0.3s ease-out forwards}
        .note-group:hover .note-hover-ring{opacity:1!important;stroke:rgba(255,255,255,.25)!important;transition:all .15s ease-out}
        .note-hover-ring{opacity:0;transition:all .15s ease-out}
      `}</style>
    </div>
  );
}
