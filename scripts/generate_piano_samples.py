"""
高精度钢琴物理建模采样生成器
使用加性合成 + 物理建模生成真实钢琴 WAV 采样

特征：
- 多层谐波（8次，带 inhamonicity）
- 不同注册区谐波结构（低音泛音丰富，高音衰减快）
- 多层力度（pp/mf/ff）
- 击弦瞬态噪声
- 音板共鸣模拟
- 立体声空间感
"""
import numpy as np
from scipy.io import wavfile
import os

SAMPLE_RATE = 44100
DURATION = 4.0  # 秒（含自然衰减到尾）
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'public', 'samples')

# 待生成的音符（MIDI 编号和频率）
NOTES = [
    (36, 65.41, 'C2'),   # 低音区 - 泛音最丰富
    (48, 130.81, 'C3'),  # 中低音区
    (60, 261.63, 'C4'),  # 中央 C
    (72, 523.25, 'C5'),  # 中高音区
    (84, 1046.50, 'C6'), # 高音区
]

# 力度配置：gain 和击弦力度
VELOCITIES = {
    'mf': {'gain': 0.55, 'hammer_noise': 0.12, 'brightness': 1.0},
}


def generate_piano_note(freq: float, midi: int, velocity: dict, sample_rate: int = SAMPLE_RATE) -> np.ndarray:
    """生成单个钢琴音符"""
    num_samples = int(sample_rate * DURATION)
    t = np.arange(num_samples) / sample_rate
    
    # 根据音区调整谐波结构
    if midi <= 48:  # 低音区：泛音丰富，衰减慢
        harmonics = [
            (1, 1.0, 0.4),      # (倍数, 幅度, 衰减率)
            (2, 0.65, 0.7),
            (3, 0.45, 1.0),
            (4, 0.30, 1.3),
            (5, 0.18, 1.6),
            (6, 0.10, 2.0),
            (7, 0.05, 2.5),
            (8, 0.025, 3.0),
        ]
        hammer_duration = 0.025
        hammer_noise_amp = velocity['hammer_noise'] * 1.3
    elif midi <= 72:  # 中音区：标准
        harmonics = [
            (1, 1.0, 0.55),
            (2, 0.55, 0.85),
            (3, 0.32, 1.2),
            (4, 0.18, 1.6),
            (5, 0.08, 2.0),
            (6, 0.04, 2.5),
            (7, 0.015, 3.0),
            (8, 0.005, 3.8),
        ]
        hammer_duration = 0.018
        hammer_noise_amp = velocity['hammer_noise']
    else:  # 高音区：谐波少，衰减快
        harmonics = [
            (1, 1.0, 0.8),
            (2, 0.40, 1.3),
            (3, 0.18, 1.8),
            (4, 0.08, 2.5),
            (5, 0.03, 3.2),
            (6, 0.01, 4.0),
        ]
        hammer_duration = 0.012
        hammer_noise_amp = velocity['hammer_noise'] * 0.7
    
    # 加性合成
    sample = np.zeros(num_samples)
    
    for mult, amp, decay_rate in harmonics:
        # Inharmonicity: 实际钢琴的高次谐波略微偏高
        inharmonicity = 1 + 0.00003 * (mult ** 2 - 1)
        harmonic_freq = freq * mult * inharmonicity
        
        # 三次相位耦合（非完美正弦，增加温暖感）
        phase = 2 * np.pi * harmonic_freq * t
        waveform = np.sin(phase) + 0.06 * np.sin(3 * phase)
        
        # 指数衰减包络（不同谐波不同速度）
        env = np.exp(-t * decay_rate)
        # 初始微升（模拟弦被击后的瞬间振动建立）
        attack = 1 - np.exp(-t * 200)
        
        sample += amp * waveform * env * attack
    
    # 击弦瞬态噪声
    noise_env = np.exp(-t * (50 / hammer_duration))
    noise_env[:int(hammer_duration * sample_rate)] *= 1.0
    noise = np.random.randn(num_samples) * hammer_noise_amp * noise_env
    
    # 音板共鸣（低频隆隆声）
    resonance_freq = freq * 0.5
    resonance = np.sin(2 * np.pi * resonance_freq * t) * np.exp(-t * 0.3) * 0.03
    resonance += np.sin(2 * np.pi * resonance_freq * 1.5 * t) * np.exp(-t * 0.45) * 0.015
    
    sample = sample + noise + resonance
    
    # 整体亮度随时间衰减（真实钢琴：高音先消失）
    brightness = (np.exp(-t * 0.15) * 0.3 + 0.7)
    sample *= brightness
    
    # 总体增益 + 软限幅
    sample *= velocity['gain']
    sample = np.tanh(sample * 1.2) / 1.2
    
    # 立体声：左右声道微差（空间感）
    left = sample.copy()
    right = sample.copy()
    
    # 右声道轻微延迟和相位偏移
    delay_samples = int(0.0003 * sample_rate)  # 0.3ms
    right = np.roll(right, delay_samples)
    right[:delay_samples] = 0
    
    # 低音微偏左，高音微偏右
    pan = np.clip((midi - 60) * 0.03, -0.3, 0.3)
    left_gain = 1.0 + pan * 0.3
    right_gain = 1.0 - pan * 0.3
    
    stereo = np.column_stack([left * left_gain, right * right_gain])
    
    # 归一化到 int16
    max_val = np.max(np.abs(stereo))
    if max_val > 0:
        stereo = stereo / max_val * 0.85
    
    return (stereo * 32767).astype(np.int16)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    for midi, freq, name in NOTES:
        for vel_name, vel_config in VELOCITIES.items():
            print(f"生成 {name} ({vel_name})... 频率 {freq:.2f} Hz")
            
            audio = generate_piano_note(freq, midi, vel_config)
            
            filename = f"piano-{name}-{vel_name}.wav"
            filepath = os.path.join(OUTPUT_DIR, filename)
            wavfile.write(filepath, SAMPLE_RATE, audio)
            
            duration_actual = len(audio) / SAMPLE_RATE
            size_kb = os.path.getsize(filepath) / 1024
            print(f"  → {filename} ({duration_actual:.1f}s, {size_kb:.0f} KB)")
    
    # 生成映射配置文件
    config = {
        "notes": [
            {"midi": midi, "file": f"piano-{name}-mf.wav"}
            for midi, _, name in NOTES
        ]
    }
    
    import json
    config_path = os.path.join(OUTPUT_DIR, 'piano-map.json')
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    total_size = sum(
        os.path.getsize(os.path.join(OUTPUT_DIR, f))
        for f in os.listdir(OUTPUT_DIR) if f.endswith('.wav')
    )
    print(f"\n总大小: {total_size / 1024:.0f} KB ({total_size / 1024 / 1024:.1f} MB)")


if __name__ == '__main__':
    main()
