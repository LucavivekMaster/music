"""
从 SplendidGrandPiano 下载所有 MF/Mf 音强 FLAC 文件
并转换为 WAV 格式
"""
import os
import urllib.request
import sys

# GitHub raw content base URL
BASE_URL = "https://raw.githubusercontent.com/sfzinstruments/SplendidGrandPiano/master/Samples"

# 所有 MF (大写) 文件 - 24个
MF_FILES = [
    "MF A#2.flac", "MF A1.flac", "MF A2.flac", "MF A3.flac",
    "MF B1.flac", "MF B2.flac", "MF B3.flac",
    "MF C#1.flac", "MF C2.flac", "MF C3.flac", "MF C4.flac",
    "MF D1.flac", "MF D2.flac", "MF D3.flac",
    "MF E1.flac", "MF E2.flac", "MF E3.flac",
    "MF F1.flac", "MF F2.flac", "MF F3.flac",
    "MF G#2.flac", "MF G1.flac", "MF G2.flac", "MF G3.flac",
]

# 所有 Mf (混合大小写) 文件 - 31个
Mf_FILES = [
    "Mf A#4.flac", "Mf A#5.flac", "Mf A#6.flac",
    "Mf A0.flac", "Mf A4.flac", "Mf A5.flac", "Mf A6.flac",
    "Mf B-1.flac", "Mf B0.flac", "Mf B4.flac", "Mf B5.flac", "Mf B6.flac",
    "Mf C#5.flac", "Mf C#6.flac", "Mf C6.flac", "Mf C7.flac",
    "Mf D#0.flac", "Mf D#5.flac", "Mf D#6.flac",
    "Mf D4.flac", "Mf D5.flac", "Mf D6.flac",
    "Mf E4.flac", "Mf E5.flac", "Mf E6.flac",
    "Mf F#5.flac", "Mf F#6.flac",
    "Mf F0.flac", "Mf F4.flac", "Mf F5.flac", "Mf F6.flac",
]

ALL_FILES = MF_FILES + Mf_FILES

# 输出目录
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), 'public', 'samples', 'piano')
FLAC_DIR = os.path.join(OUTPUT_DIR, '_flac_cache')

# MIDI 映射（从音符名推算）
NOTE_TO_MIDI = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4,
    'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11,
}

def parse_note_to_midi(filename: str) -> int:
    """从文件名解析 MIDI 编号，如 'MF C3.flac' → 48"""
    # 去掉前缀和扩展名
    name = filename.replace('.flac', '')
    parts = name.split(' ')
    note_part = parts[1]  # e.g., 'C3', 'A#2', 'B-1'
    
    # 解析音符名和八度
    if note_part.startswith('B-'):
        note_name = 'B'
        octave = int(note_part[2:])
    elif '#' in note_part:
        note_name = note_part[:-1]  # e.g., 'C#' from 'C#1'
        octave = int(note_part[-1]) if note_part[-1].isdigit() else int(note_part[-2:])
    else:
        # 单字母音符名 + 数字八度
        note_name = note_part[0]  # e.g., 'C'
        octave_str = note_part[1:]  # e.g., '3', '-1'
        octave = int(octave_str)
    
    midi = (octave + 1) * 12 + NOTE_TO_MIDI[note_name]
    return midi


def download_file(url: str, dest: str) -> bool:
    """下载单个文件"""
    try:
        print(f"  下载 {os.path.basename(dest)}...", end=' ', flush=True)
        urllib.request.urlretrieve(url, dest)
        print(f"OK ({os.path.getsize(dest)/1024:.0f}KB)")
        return True
    except Exception as e:
        print(f"FAIL: {e}")
        return False


def main():
    os.makedirs(FLAC_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Step 1: 下载所有 FLAC
    print(f"=== 下载 {len(ALL_FILES)} 个 FLAC 文件 ===\n")
    downloaded = []
    for filename in ALL_FILES:
        flac_path = os.path.join(FLAC_DIR, filename)
        if os.path.exists(flac_path):
            print(f"  跳过 {filename} (已存在)")
            downloaded.append(filename)
            continue
        url = f"{BASE_URL}/{filename.replace(' ', '%20')}"
        if download_file(url, flac_path):
            downloaded.append(filename)
    
    print(f"\n下载完成: {len(downloaded)}/{len(ALL_FILES)}")
    
    # Step 2: 转换为 WAV
    print(f"\n=== 转换为 WAV ===\n")
    
    try:
        import soundfile as sf
    except ImportError:
        print("soundfile 不可用，跳过转换。需要手动安装 libsndfile。")
        return
    
    converted = []
    for filename in downloaded:
        flac_path = os.path.join(FLAC_DIR, filename)
        wav_name = filename.replace('.flac', '.wav')
        wav_path = os.path.join(OUTPUT_DIR, wav_name)
        
        if os.path.exists(wav_path):
            print(f"  跳过 {wav_name} (已存在)")
            converted.append((filename, wav_name))
            continue
        
        try:
            data, sr = sf.read(flac_path)
            sf.write(wav_path, data, sr)
            midi = parse_note_to_midi(filename)
            size_kb = os.path.getsize(wav_path) / 1024
            print(f"  {filename} → {wav_name} (MIDI {midi}, {size_kb:.0f}KB)")
            converted.append((filename, wav_name))
        except Exception as e:
            print(f"  {filename} 转换失败: {e}")
    
    print(f"\n转换完成: {len(converted)}/{len(downloaded)}")
    
    # Step 3: 生成映射 JSON
    import json
    piano_map = []
    for flac_name, wav_name in converted:
        midi = parse_note_to_midi(flac_name)
        piano_map.append({"midi": midi, "file": wav_name, "note": flac_name.replace('.flac', '')})
    
    piano_map.sort(key=lambda x: x['midi'])
    
    map_path = os.path.join(OUTPUT_DIR, 'piano-map.json')
    with open(map_path, 'w', encoding='utf-8') as f:
        json.dump(piano_map, f, indent=2, ensure_ascii=False)
    
    total_wav = sum(
        os.path.getsize(os.path.join(OUTPUT_DIR, m['file']))
        for m in piano_map if os.path.exists(os.path.join(OUTPUT_DIR, m['file']))
    )
    print(f"\n总 WAV 大小: {total_wav/1024:.0f}KB ({total_wav/1024/1024:.1f}MB)")
    print(f"采样文件数: {len(piano_map)}")


if __name__ == '__main__':
    main()
