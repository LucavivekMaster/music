// 钢琴采样映射
interface PianoSample {
  midi: number;
  buffer: AudioBuffer;
}

class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: Map<number, AudioBufferSourceNode[]> = new Map();
  private samples: PianoSample[] = [];
  private samplesLoaded = false;
  private samplesLoading: Promise<void> | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.40;
    }
    return this.audioContext;
  }

  // 加载所有钢琴采样（异步，可安全重复调用）
  async ensureSamplesLoaded(): Promise<void> {
    if (this.samplesLoaded) return;
    if (this.samplesLoading) {
      await this.samplesLoading;
      if (this.samplesLoaded) return;
      // 上次加载失败了，重试
    }

    this.samplesLoading = this.loadAllSamples();
    await this.samplesLoading;
  }

  private async loadAllSamples(): Promise<void> {
    const ctx = this.getContext();
    
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}samples/piano/piano-map.json`);
      const map: Array<{ midi: number; file: string }> = await response.json();
      
      // 并行下载所有 WAV 文件
      const fetches = await Promise.all(
        map.map(async (entry) => {
          try {
            const wavResponse = await fetch(`${import.meta.env.BASE_URL}samples/piano/${entry.file}`);
            if (!wavResponse.ok) return null;
            const arrayBuffer = await wavResponse.arrayBuffer();
            return { midi: entry.midi, arrayBuffer };
          } catch {
            return null;
          }
        })
      );
      
      const valid = fetches.filter((f): f is { midi: number; arrayBuffer: ArrayBuffer } => f !== null);
      console.log(`音频下载完成：${valid.length}/${map.length} 个文件`);
      
      // 分批解码（每批 3 个，避免阻塞 UI）
      const loaded: PianoSample[] = [];
      const BATCH = 3;
      for (let i = 0; i < valid.length; i += BATCH) {
        const batch = valid.slice(i, i + BATCH);
        const decoded = await Promise.all(
          batch.map(async ({ midi, arrayBuffer }) => {
            try {
              const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
              return { midi, buffer: audioBuffer };
            } catch {
              return null;
            }
          })
        );
        for (const d of decoded) {
          if (d) loaded.push(d);
        }
      }
      
      if (loaded.length > 0) {
        this.samples = loaded.sort((a, b) => a.midi - b.midi);
        this.samplesLoaded = true;
        console.log(`钢琴采样加载完成：${this.samples.length} 个 (MIDI ${this.samples[0].midi} ~ ${this.samples[this.samples.length - 1].midi})`);
      }
    } catch (e) {
      console.error('钢琴采样加载失败:', e);
    }
  }

  // 找最近的采样（始终可用，因为 samples 已按 midi 排序）
  private findNearestSample(midi: number): PianoSample | null {
    if (this.samples.length === 0) return null;
    
    let nearest = this.samples[0];
    let minDist = Math.abs(midi - nearest.midi);
    
    for (const sample of this.samples) {
      const dist = Math.abs(midi - sample.midi);
      if (dist < minDist) {
        minDist = dist;
        nearest = sample;
      }
    }
    
    return nearest;
  }

  playNote(midi: number, duration: number = 0.8): void {
    const ctx = this.getContext();
    // 恢复因浏览器策略挂起的 AudioContext
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    // 确保采样已加载
    if (!this.samplesLoaded) {
      this.ensureSamplesLoaded().then(() => {
        if (this.samplesLoaded) {
          this.playSampledNote(ctx, midi, duration);
        }
      });
      return;
    }
    
    this.playSampledNote(ctx, midi, duration);
  }

  private playSampledNote(ctx: AudioContext, midi: number, duration: number): void {
    const nearest = this.findNearestSample(midi);
    if (!nearest) return;
    
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    
    source.buffer = nearest.buffer;
    
    const playbackRate = Math.pow(2, (midi - nearest.midi) / 12);
    source.playbackRate.value = playbackRate;
    
    const now = ctx.currentTime;
    const sampleDuration = nearest.buffer.duration / playbackRate;
    
    // 让采样自然衰减，不强制切断
    if (duration > 0 && duration < sampleDuration) {
      gainNode.gain.setValueAtTime(0.55, now);
      gainNode.gain.setValueAtTime(0.55, now + duration - 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    } else {
      gainNode.gain.setValueAtTime(0.55, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + sampleDuration - 0.05);
    }
    
    source.connect(gainNode);
    gainNode.connect(this.masterGain!);
    
    source.start(now);
    
    const stopTime = duration > 0 ? now + duration + 0.3 : now + sampleDuration + 0.1;
    
    this.activeNodes.set(midi, [source]);
    
    setTimeout(() => {
      this.activeNodes.delete(midi);
    }, (stopTime - now + 0.5) * 1000);
  }

  playChord(midiNotes: number[], duration: number = 1.2): void {
    const sortedNotes = [...midiNotes].sort((a, b) => a - b);
    sortedNotes.forEach((midi) => {
      this.playNote(midi, duration);
    });
  }

  playArpeggio(midiNotes: number[], pattern: 'up' | 'down' | 'upDown' | 'random' = 'up', intervalMs: number = 150): void {
    const ary = [...midiNotes].sort((a, b) => a - b);
    let sequence: number[];
    switch (pattern) {
      case 'down': sequence = [...ary].reverse(); break;
      case 'upDown': sequence = [...ary, ...ary.slice(0, -1).reverse()]; break;
      case 'random': sequence = [...ary].sort(() => Math.random() - 0.5); break;
      default: sequence = ary;
    }
    sequence.forEach((midi, i) => {
      setTimeout(() => this.playNote(midi, 0), i * intervalMs);
    });
  }

  stopAll(): void {
    this.activeNodes.forEach((nodes) => {
      nodes.forEach((node) => {
        try { node.stop(); } catch { /* already stopped */ }
      });
    });
    this.activeNodes.clear();
  }

  setVolume(value: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, value));
    }
  }
}

export const audioPlayer = new AudioPlayer();
