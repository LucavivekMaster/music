export interface Note {
  name: string;
  nameEn: string;
  octave: number;
  midi: number;
  color: string;
}

export interface Chord {
  id: string;
  name: string;
  notes: Note[];
  type: ChordType;
  intervals: number[];
  description: string;
}

export interface Interval {
  name: string;
  semitones: number;
  description: string;
}

export type ChordType = 'major' | 'minor' | 'diminished' | 'augmented' | 'major7' | 'minor7' | 'dominant7' | 'diminished7' | 'halfDiminished7' | 'sus2' | 'sus4' | 'add9' | 'madd9' | 'nine' | 'maj9' | 'm9';

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTE_NAMES_CN = ['C/Do', 'C#', 'D/Re', 'D#', 'E/Mi', 'F/Fa', 'F#', 'G/Sol', 'G#', 'A/La', 'A#', 'B/Si'];

export const NOTE_COLORS: Record<string, string> = {
  'C': '#ef4444',
  'C#': '#f97316',
  'D': '#eab308',
  'D#': '#22c55e',
  'E': '#14b8a6',
  'F': '#06b6d4',
  'F#': '#0ea5e9',
  'G': '#3b82f6',
  'G#': '#6366f1',
  'A': '#8b5cf6',
  'A#': '#d946ef',
  'B': '#ec4899',
};

export const INTERVALS: Record<number, Interval> = {
  0: { name: '同度', semitones: 0, description: '两个相同音高的音符' },
  1: { name: '小二度', semitones: 1, description: '相邻的两个半音，如C到C#' },
  2: { name: '大二度', semitones: 2, description: '全音关系，如C到D' },
  3: { name: '小三度', semitones: 3, description: '三个半音，如C到D#' },
  4: { name: '大三度', semitones: 4, description: '四个半音，如C到E' },
  5: { name: '纯四度', semitones: 5, description: '五个半音，如C到F' },
  6: { name: '增四度/减五度', semitones: 6, description: '六个半音，三全音' },
  7: { name: '纯五度', semitones: 7, description: '七个半音，如C到G' },
  8: { name: '小六度', semitones: 8, description: '八个半音，如C到A' },
  9: { name: '大六度', semitones: 9, description: '九个半音，如C到A#' },
  10: { name: '小七度', semitones: 10, description: '十个半音，如C到B' },
  11: { name: '大七度', semitones: 11, description: '十一个半音，如C到B#' },
  12: { name: '纯八度', semitones: 12, description: '十二个半音，高八度' },
};

export const CHORD_TYPES: Record<ChordType, { intervals: number[]; description: string; name: string }> = {
  major: { intervals: [0, 4, 7], description: '大三和弦，由根音、大三度和纯五度组成，明亮稳定', name: '大三和弦 (major)' },
  minor: { intervals: [0, 3, 7], description: '小三和弦，由根音、小三度和纯五度组成，柔和忧郁', name: '小三和弦 (minor)' },
  diminished: { intervals: [0, 3, 6], description: '减三和弦，由根音、小三度和减五度组成，紧张不安', name: '减三和弦 (dim)' },
  augmented: { intervals: [0, 4, 8], description: '增三和弦，由根音、大三度和增五度组成，向外扩张', name: '增三和弦 (aug)' },
  major7: { intervals: [0, 4, 7, 11], description: '大七和弦，在大三和弦基础上加大七度，梦幻华丽', name: '大七和弦 (maj7)' },
  minor7: { intervals: [0, 3, 7, 10], description: '小七和弦，在小三和弦基础上加小七度，爵士感', name: '小七和弦 (m7)' },
  dominant7: { intervals: [0, 4, 7, 10], description: '属七和弦，在大三和弦基础上加小七度，强烈倾向主和弦', name: '属七和弦 (7)' },
  diminished7: { intervals: [0, 3, 6, 9], description: '减七和弦，在减三和弦基础上加减七度，极度紧张', name: '减七和弦 (dim7)' },
  halfDiminished7: { intervals: [0, 3, 6, 10], description: '半减七和弦，减三和弦加小七度，神秘色彩', name: '半减七和弦 (m7b5)' },
  sus2: { intervals: [0, 2, 7], description: '挂二和弦，用大二度代替三音，悬浮感', name: '挂二和弦 (sus2)' },
  sus4: { intervals: [0, 5, 7], description: '挂四和弦，用纯四度代替三音，紧张释放感', name: '挂四和弦 (sus4)' },
  add9: { intervals: [0, 2, 4, 7], description: '加九和弦，大三和弦加大九度，色彩丰富', name: '加九和弦 (add9)' },
  madd9: { intervals: [0, 2, 3, 7], description: '小加九和弦，小三和弦加大九度，温暖忧郁', name: '小加九和弦 (madd9)' },
  nine: { intervals: [0, 2, 4, 7, 10], description: '属九和弦，属七和弦加大九度，蓝调爵士感', name: '属九和弦 (9)' },
  maj9: { intervals: [0, 2, 4, 7, 11], description: '大九和弦，大七和弦加大九度，梦幻华丽', name: '大九和弦 (maj9)' },
  m9: { intervals: [0, 2, 3, 7, 10], description: '小九和弦，小七和弦加大九度，爵士色彩', name: '小九和弦 (m9)' },
};

export function createNote(name: string, octave: number = 4): Note {
  const index = NOTE_NAMES.indexOf(name);
  if (index === -1) throw new Error(`Invalid note name: ${name}`);
  return {
    name,
    nameEn: name,
    octave,
    midi: 60 + (octave - 4) * 12 + index,
    color: NOTE_COLORS[name],
  };
}

export function getNoteByMidi(midi: number): Note {
  const octave = Math.floor(midi / 12) - 1;
  const index = midi % 12;
  const name = NOTE_NAMES[index];
  return {
    name,
    nameEn: name,
    octave,
    midi,
    color: NOTE_COLORS[name],
  };
}

export function calculateInterval(note1: Note, note2: Note): Interval {
  const semitones = Math.abs(note2.midi - note1.midi) % 12;
  return INTERVALS[semitones] || { name: `${semitones}半音`, semitones, description: `${semitones}个半音的音程` };
}

export function calculateAllIntervals(notes: Note[]): { from: Note; to: Note; interval: Interval }[] {
  const intervals: { from: Note; to: Note; interval: Interval }[] = [];
  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      intervals.push({
        from: notes[i],
        to: notes[j],
        interval: calculateInterval(notes[i], notes[j]),
      });
    }
  }
  return intervals;
}

export function generateChord(rootNote: Note, type: ChordType, prevNotes?: Note[]): Note[] {
  const intervals = CHORD_TYPES[type].intervals;
  let notes = intervals.map(interval => {
    const newMidi = rootNote.midi + interval;
    return getNoteByMidi(newMidi);
  });
  
  // 声部进行：如果有前一个和弦，尽量让新和弦的音符接近前一个和弦
  if (prevNotes && prevNotes.length > 0) {
    notes = notes.map((note, _i) => {
      // 找到前一个和弦中最近的同音名音符（可跨八度）
      let bestNote = note;
      let bestDist = Infinity;
      
      for (let octaveShift = -2; octaveShift <= 2; octaveShift++) {
        const candidateMidi = note.midi + octaveShift * 12;
        const candidate = getNoteByMidi(candidateMidi);
        
        // 计算与前一和弦所有音符的最小距离
        const minDist = Math.min(...prevNotes.map(pn => Math.abs(candidate.midi - pn.midi)));
        if (minDist < bestDist) {
          bestDist = minDist;
          bestNote = candidate;
        }
      }
      return bestNote;
    });
  }
  
  return notes;
}

export interface ChordDetection {
  type: ChordType;
  root: string;
  inversion: number; // 0=原位, 1=第一转位, 2=第二转位...
  displayName: string;
}

export function detectChord(notes: Note[]): ChordDetection | null {
  if (notes.length < 3) return null;
  
  const sortedNotes = [...notes].sort((a, b) => a.midi - b.midi);
  
  // 尝试每个音作为根音（支持转位）
  for (const candidateRoot of sortedNotes) {
    const rootMidi = candidateRoot.midi;
    const intervals = sortedNotes
      .map(n => (n.midi - rootMidi + 12) % 12)
      .filter(i => i !== 0)
      .sort((a, b) => a - b);
    
    if (intervals.length === 0) continue;
    
    for (const [type, info] of Object.entries(CHORD_TYPES)) {
      const chordIntervals = [...info.intervals].filter(i => i !== 0).sort((a, b) => a - b);
      if (chordIntervals.length === intervals.length) {
        const matches = intervals.every((interval, index) => interval === chordIntervals[index]);
        if (matches) {
          // 计算转位
          const inversion = sortedNotes.indexOf(candidateRoot);
          const inversionNames = ['原位', '第一转位', '第二转位', '第三转位'];
          const invLabel = inversion > 0 ? ` (${inversionNames[inversion] || `${inversion}转位`})` : '';
          return {
            type: type as ChordType,
            root: candidateRoot.name,
            inversion,
            displayName: `${candidateRoot.name}${info.name}${invLabel}`,
          };
        }
      }
    }
  }
  
  return null;
}

export function generateCircleOfFifths(): { note: string; color: string; position: number }[] {
  const fifthsOrder = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
  return fifthsOrder.map((note, index) => ({
    note,
    color: NOTE_COLORS[note],
    position: index,
  }));
}

// 常用和弦进行模式（罗马数字表示）
export const COMMON_PROGRESSIONS = [
  { name: '流行经典 I-V-vi-IV', pattern: ['I', 'V', 'vi', 'IV'], genre: '流行' },
  { name: '经典终止式 I-IV-V-I', pattern: ['I', 'IV', 'V', 'I'], genre: '古典/流行' },
  { name: '爵士 ii-V-I', pattern: ['ii', 'V', 'I'], genre: '爵士' },
  { name: '蓝调十二小节', pattern: ['I', 'I', 'I', 'I', 'IV', 'IV', 'I', 'I', 'V', 'IV', 'I', 'I'], genre: '蓝调' },
  { name: '伤感民谣 vi-IV-I-V', pattern: ['vi', 'IV', 'I', 'V'], genre: '流行/民谣' },
  { name: '卡农进行 I-V-vi-iii-IV-I-IV-V', pattern: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'], genre: '古典/流行' },
  { name: '五十年代 doo-wop', pattern: ['I', 'vi', 'IV', 'V'], genre: '摇滚/流行' },
  { name: '爵士回转 ii-V-I-vi', pattern: ['ii', 'V', 'I', 'vi'], genre: '爵士' },
  { name: '放克经典 I-vi-ii-V', pattern: ['I', 'vi', 'ii', 'V'], genre: '放克' },
  { name: '灵魂乐 I-IV-I-V', pattern: ['I', 'IV', 'I', 'V'], genre: '灵魂/R&B' },
];

// 获取音级的根音
function getNoteForDegree(rootIndex: number, degree: number): string {
  const interval = degree - 1;
  return NOTE_NAMES[(rootIndex + interval) % 12];
}

// 解析罗马数字为音级
function parseRomanToDegree(roman: string): number {
  const romanMap: Record<string, number> = {
    'I': 1, 'i': 1, 'II': 2, 'ii': 2, 'III': 3, 'iii': 3,
    'IV': 4, 'iv': 4, 'V': 5, 'v': 5, 'VI': 6, 'vi': 6,
    'VII': 7, 'vii': 7,
  };
  const cleanRoman = roman.replace(/°/g, '');
  return romanMap[cleanRoman] || 1;
}

// 解析和弦类型
// 默认使用三和弦，仅在明确指定七和弦（如 I7, iim7 等）时使用七和弦
function getChordTypeFromRoman(roman: string, isMajorKey: boolean): ChordType {
  if (roman.includes('°')) return 'diminished';
  
  const isSeventh = roman.includes('7') || roman.includes('maj7');
  
  if (isSeventh) {
    const baseRoman = roman.replace(/7|maj/g, '');
    if (baseRoman === 'ii' || baseRoman === 'vi') return 'minor7';
    if (baseRoman === 'vii°') return 'diminished7';
    if (roman.includes('maj7')) return 'major7';
    return 'dominant7';
  }
  
  // 三和弦默认（大部分流行/古典音乐使用三和弦）
  if (isMajorKey) {
    if (roman === 'vi' || roman === 'ii' || roman === 'iii') return 'minor';
  }
  return roman === roman.toLowerCase() ? 'minor' : 'major';
}

export interface ChordProgressionItem {
  root: string;
  type: ChordType;
  roman: string;
}

export interface ChordProgression {
  name: string;
  chords: ChordProgressionItem[];
}

// 生成和弦走向推荐
export function generateChordProgressions(
  startRoot: string,
  startType: ChordType = 'major',
  count: number = 3
): ChordProgression[] {
  const rootIndex = NOTE_NAMES.indexOf(startRoot);
  const isMajorKey = startType === 'major';
  const progressions: ChordProgression[] = [];
  
  // 根据起始和弦筛选合适的模式（若无匹配则使用全部）
  const filteredPatterns = COMMON_PROGRESSIONS.filter(pattern => {
    const firstRoman = pattern.pattern[0];
    const firstDegree = parseRomanToDegree(firstRoman);
    const expectedRoot = getNoteForDegree(rootIndex, firstDegree);
    return expectedRoot === startRoot;
  });
  
  // 回退：如果按根音筛选无结果，尝试匹配和弦类型
  const patterns = filteredPatterns.length > 0 
    ? filteredPatterns 
    : COMMON_PROGRESSIONS.filter(pattern => {
        const firstRoman = pattern.pattern[0];
        const chordType = getChordTypeFromRoman(firstRoman, isMajorKey);
        return chordType === startType;
      });
  
  // 最终回退：使用所有模板
  const finalPatterns = patterns.length > 0 ? patterns : COMMON_PROGRESSIONS;
  
  // 优先使用筛选后的模式
  for (const template of finalPatterns.slice(0, count)) {
    const chords: ChordProgressionItem[] = [];
    
    for (let j = 0; j < 4; j++) {
      const roman = template.pattern[j % template.pattern.length];
      const degree = parseRomanToDegree(roman);
      const chordRoot = getNoteForDegree(rootIndex, degree);
      const chordType = getChordTypeFromRoman(roman, isMajorKey);
      
      chords.push({
        root: chordRoot,
        type: chordType,
        roman: roman,
      });
    }
    
    progressions.push({
      name: template.name,
      chords,
    });
    
    if (progressions.length >= count) break;
  }
  
  // 如果还不够，生成高质量的推荐
  if (progressions.length < count) {
    const generatedPatterns = generateQualityProgressions(startRoot, isMajorKey, count - progressions.length);
    progressions.push(...generatedPatterns);
  }
  
  return progressions;
}

// 生成高质量的和弦进行
function generateQualityProgressions(
  root: string,
  isMajor: boolean,
  count: number
): ChordProgression[] {
  const rootIndex = NOTE_NAMES.indexOf(root);
  const progressions: ChordProgression[] = [];
  
  // 高质量和弦进行模板（备选池）
  const qualityTemplates = [
    { pattern: ['I', 'vi', 'IV', 'V'], name: '流行标准 50s' },
    { pattern: ['I', 'V', 'vi', 'IV'], name: '经典循环' },
    { pattern: ['vi', 'IV', 'I', 'V'], name: '民谣感伤' },
    { pattern: ['I', 'IV', 'vi', 'V'], name: '流行民谣' },
    { pattern: ['ii', 'V', 'I', 'IV'], name: '爵士回转' },
    { pattern: ['I', 'vi', 'ii', 'V'], name: '圆润终止' },
    { pattern: ['IV', 'V', 'iii', 'vi'], name: '动画配乐' },
    { pattern: ['I', 'iii', 'IV', 'V'], name: '经典上行' },
    { pattern: ['vi', 'V', 'IV', 'III'], name: '下行低音' },
    { pattern: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'ii', 'V'], name: '卡农变体' },
  ];
  
  // 筛选第一个和弦根音与 startRoot 匹配的模板
  const matchingTemplates = qualityTemplates.filter(template => {
    const firstRoman = template.pattern[0];
    const degree = parseRomanToDegree(firstRoman);
    const expectedRoot = getNoteForDegree(rootIndex, degree);
    return expectedRoot === root;
  });
  
  // 如果匹配不足，则包含不匹配的模板（回退）
  const templates = matchingTemplates.length >= count 
    ? matchingTemplates 
    : [...matchingTemplates, ...qualityTemplates.filter(t => !matchingTemplates.includes(t))];
  
  for (let i = 0; i < count && i < templates.length; i++) {
    const template = templates[i];
    const chords: ChordProgressionItem[] = [];
    
    for (const roman of template.pattern) {
      const degree = parseRomanToDegree(roman);
      const chordRoot = getNoteForDegree(rootIndex, degree);
      const chordType = getChordTypeFromRoman(roman, isMajor);
      
      chords.push({
        root: chordRoot,
        type: chordType,
        roman: roman,
      });
    }
    
    progressions.push({
      name: template.name,
      chords,
    });
  }
  
  return progressions;
}

// 获取和弦的显示名称
export function getChordDisplayName(root: string, type: ChordType): string {
  const suffixes: Record<ChordType, string> = {
    major: '',
    minor: 'm',
    diminished: 'dim',
    augmented: 'aug',
    major7: 'M7',
    minor7: 'm7',
    dominant7: '7',
    diminished7: 'dim7',
    halfDiminished7: 'ø7',
    sus2: 'sus2',
    sus4: 'sus4',
    add9: 'add9',
    madd9: 'm(add9)',
    nine: '9',
    maj9: 'M9',
    m9: 'm9',
  };
  return `${root}${suffixes[type]}`;
}

