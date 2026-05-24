import { useState, useCallback, useMemo, useRef } from 'react';
import { NOTE_NAMES, NOTE_COLORS, NOTE_NAMES_CN, createNote } from '../utils/musicTheory';
import { useMusicStore } from '../store/musicStore';
import { audioPlayer } from '../utils/audioPlayer';

const CENTER_X = 200;
const CENTER_Y = 200;
const RADIUS = 150;
const STEP_DEGREES = 30;
const FIFTHS_ORDER = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];

export function NoteCircle() {
  const { selectedNotes, addNote, removeNote, transposeSteps, setTransposeSteps, transposeSelection, circleMode, setCircleMode, currentOctave } = useMusicStore();
  const [animatingNote, setAnimatingNote] = useState<string | null>(null);
  
  const effectiveOctave = useMemo(() => {
    return Math.max(0, Math.min(7, currentOctave + Math.floor(transposeSteps / 12)));
  }, [currentOctave, transposeSteps]);
  
  // 拖拽状态（全部 ref，避免 state 异步导致 pointerMove 丢失）
  const isDragging = useRef(false);
  const dragPrevAngle = useRef(0);
  const dragAccumAngle = useRef(0);
  const dragStartSteps = useRef(0);
  const dragLastStep = useRef(0);
  
  const selectedNoteNames = useMemo(() => {
    return new Set(selectedNotes.map(n => n.name));
  }, [selectedNotes]);
  
  const isSelected = useCallback((noteName: string) => {
    return selectedNoteNames.has(noteName);
  }, [selectedNoteNames]);
  
  const toggleNote = useCallback((noteName: string) => {
    const note = createNote(noteName, effectiveOctave);
    const actualExisting = selectedNotes.find(n => n.midi === note.midi);
    if (actualExisting) {
      removeNote(actualExisting);
    } else {
      addNote(note);
      setAnimatingNote(noteName);
      setTimeout(() => setAnimatingNote(null), 300);
    }
  }, [addNote, removeNote, selectedNotes, effectiveOctave]);
  
  // 从鼠标位置计算角度
  const getAngle = useCallback((clientX: number, clientY: number): number => {
    const svg = document.querySelector('.note-circle-svg');
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    return Math.atan2(clientY - rect.top - rect.height / 2, clientX - rect.left - rect.width / 2);
  }, []);
  
  // 拖拽旋转
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
    
    const rawAngle = getAngle(e.clientX, e.clientY);
    let diff = rawAngle - dragPrevAngle.current;
    
    // 检测绕圈（穿越±π边界）
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;
    
    dragPrevAngle.current = rawAngle;
    dragAccumAngle.current += diff;
    
    // 转换为半音步数（30°一档，360°=12步=1八度）
    const stepRad = (STEP_DEGREES * Math.PI) / 180;
    const totalSteps = Math.round(dragAccumAngle.current / stepRad);
    
    if (totalSteps === dragLastStep.current) return;
    
    const stepDiff = totalSteps - dragLastStep.current;
    if (stepDiff !== 0) {
      transposeSelection(stepDiff);
      dragLastStep.current = totalSteps;
      setTransposeSteps(dragStartSteps.current + dragLastStep.current);
      
      const state = useMusicStore.getState();
      if (state.selectedNotes.length > 0) {
        audioPlayer.playChord(state.selectedNotes.map(n => n.midi), 1.2);
      }
    }
  }, [getAngle, transposeSelection, setTransposeSteps]);
  
  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);
  
  // 当前模式的音符顺序和位置
  const { activeNoteOrder, notePositions } = useMemo(() => {
    const order = circleMode === 'chromatic' ? NOTE_NAMES : FIFTHS_ORDER;
    const positions = order.map((_, index) => {
      const angle = (index / 12) * 2 * Math.PI - Math.PI / 2;
      return {
        x: CENTER_X + RADIUS * Math.cos(angle),
        y: CENTER_Y + RADIUS * Math.sin(angle),
        angle,
      };
    });
    return { activeNoteOrder: order, notePositions: positions };
  }, [circleMode]);
  
  // 多边形
  const polygonPoints = useMemo(() => {
    if (selectedNotes.length < 3) return null;
    const pts = activeNoteOrder
      .map((name, i) => ({ name, ...notePositions[i] }))
      .filter(p => isSelected(p.name))
      .sort((a, b) => a.angle - b.angle);
    return pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  }, [selectedNotes, notePositions, isSelected, activeNoteOrder]);
  
  // 五度圈 P5 弧线
  const fifthArcs = useMemo(() => {
    if (circleMode !== 'circleOfFifths') return null;
    return activeNoteOrder.map((_, i) => {
      const from = notePositions[i];
      const to = notePositions[(i + 1) % 12];
      const r = RADIUS - 20;
      return { from, to, r };
    });
  }, [circleMode, notePositions, activeNoteOrder]);
  
  return (
    <div className="relative w-full h-[400px] flex items-center justify-center select-none">
      {/* 模式切换 */}
      <button
        onClick={() => setCircleMode(circleMode === 'chromatic' ? 'circleOfFifths' : 'chromatic')}
        className="absolute top-0 left-0 z-10 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] rounded-lg px-2.5 py-1 text-xs text-gray-300 transition-colors"
      >
        {circleMode === 'chromatic' ? '半音圈' : '五度圈'}
      </button>
      
      <svg 
        width="400" height="400" 
        className={`note-circle-svg drop-shadow-2xl ${isDragging.current ? 'cursor-grabbing' : 'cursor-grab'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <defs>
          <radialGradient id="circleGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(14, 165, 233, 0.3)" />
            <stop offset="100%" stopColor="rgba(14, 165, 233, 0)" />
          </radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="strongGlow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="pulseGlow"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        
        <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS} fill="url(#circleGlow)" />
        <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
        <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS * 0.7} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <circle cx={CENTER_X} cy={CENTER_Y} r={RADIUS * 0.4} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        
        {polygonPoints && (
          <polygon points={polygonPoints} fill="rgba(14,165,233,0.08)" stroke="rgba(56,189,248,0.4)" strokeWidth="1.5" strokeDasharray="6,3" className="pointer-events-none" />
        )}
        
        {/* 五度圈 P5 连接弧线 */}
        {fifthArcs && fifthArcs.map(({ from, to, r }, i) => (
          <path key={i}
            d={`M ${from.x},${from.y} A ${r},${r} 0 0,1 ${to.x},${to.y}`}
            fill="none" stroke="rgba(234,179,8,0.15)" strokeWidth="1" strokeDasharray="3,5" className="pointer-events-none" />
        ))}
        
        {activeNoteOrder.map((noteName, index) => {
          const pos = notePositions[index];
          const selected = isSelected(noteName);
          const isSharp = noteName.includes('#');
          const noteRadius = isSharp ? 18 : 22;
          
          return (
            <g key={noteName} className="cursor-pointer note-group" onClick={e => { e.stopPropagation(); toggleNote(noteName); }}>
              <circle cx={pos.x} cy={pos.y} r={noteRadius + 12} fill="transparent" />
              {!selected && <circle cx={pos.x} cy={pos.y} r={noteRadius + 6} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" className="note-hover-ring" />}
              {selected && <circle cx={pos.x} cy={pos.y} r={noteRadius + 8} fill="none" stroke={NOTE_COLORS[noteName]} strokeWidth="2" opacity="0.6" filter="url(#strongGlow)" />}
              {animatingNote === noteName && <circle cx={pos.x} cy={pos.y} r={noteRadius + 15} fill="none" stroke={NOTE_COLORS[noteName]} strokeWidth="3" opacity="0.8" filter="url(#pulseGlow)" className="note-pulse-ring" />}
              <circle cx={pos.x} cy={pos.y} r={selected ? noteRadius + 2 : noteRadius} fill={selected ? NOTE_COLORS[noteName] : 'rgba(30,41,59,0.9)'} stroke={selected ? NOTE_COLORS[noteName] : 'rgba(255,255,255,0.4)'} strokeWidth={selected ? 4 : 2} filter={selected ? 'url(#strongGlow)' : 'url(#glow)'} className="pointer-events-none" style={{ transition: 'all 0.2s ease-out' }} />
              <circle cx={pos.x - noteRadius * 0.3} cy={pos.y - noteRadius * 0.3} r={noteRadius * 0.35} fill="rgba(255,255,255,0.3)" className="pointer-events-none" />
              <text x={pos.x} y={pos.y + 5} textAnchor="middle" fill={selected ? '#fff' : 'rgba(255,255,255,0.9)'} fontSize={isSharp ? '10' : '12'} fontWeight={selected ? '800' : '700'} className="pointer-events-none" style={{ textShadow: selected ? `0 0 10px ${NOTE_COLORS[noteName]}` : 'none' }}>{NOTE_NAMES_CN[NOTE_NAMES.indexOf(noteName)]}</text>
            </g>
          );
        })}
        
        <circle cx={CENTER_X} cy={CENTER_Y} r={22} fill="rgba(14,165,233,0.12)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
        <text x={CENTER_X} y={CENTER_Y + 4} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="11" fontWeight="500">
          {circleMode === 'chromatic' ? `C${effectiveOctave}~B${effectiveOctave}` : '五度'}
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
