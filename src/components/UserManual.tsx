import { useState } from 'react';
import { HelpCircle, X, MousePointer, RotateCw, Ear, Music, ChevronUp, ArrowUpDown, ListMusic, Hash, Table2 } from 'lucide-react';

export function UserManual() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/30 text-sky-300 flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-sky-500/10"
        title="操作手册"
      >
        <HelpCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/[0.08] rounded-2xl w-[540px] max-h-[85vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-white/[0.06] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-400" />
            操作手册
          </h2>
          <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          <Section
            icon={<MousePointer className="w-4 h-4" />}
            title="选中 / 取消音符"
            desc="点击音圈或钢琴键盘上的音符即可选中，再次点击取消选中。选中的音符会高亮并播放声音。"
          />
          <Section
            icon={<RotateCw className="w-4 h-4" />}
            title="旋转转调"
            desc="在音圈空白处拖拽旋转，每 30° 升高一个半音。顺时针旋转一圈（360°）升高一个八度，可无限叠加。"
          />
          <Section
            icon={<Hash className="w-4 h-4" />}
            title="五度圈 / 半音圈切换"
            desc="点击音圈左上角按钮可在「半音圈」和「五度圈」之间切换。五度圈以纯五度关系排列，适合分析和弦走向和调性关系。"
          />
          <Section
            icon={<ListMusic className="w-4 h-4" />}
            title="和弦识别"
            desc="选中 3 个及以上的音符后，底部自动显示和弦名称（如 C大三和弦）和转位信息。支持三和弦、七和弦、九和弦。"
          />
          <Section
            icon={<Table2 className="w-4 h-4" />}
            title="钢琴键盘"
            desc="音圈下方有 C3-B3 的紧凑钢琴键盘，可点击白键或黑键选中音符，选中后在键盘上高亮显示。"
          />
          <Section
            icon={<ArrowUpDown className="w-4 h-4" />}
            title="音阶 / 琶音播放"
            desc="「音阶」按钮：从低到高再到低依次播放选中的音符。\n「琶音」按钮：点击循环切换模式（上行→下行→交替→随机），按对应模式播放。"
          />
          <Section
            icon={<Music className="w-4 h-4" />}
            title="和弦走向推荐"
            desc="在「和弦走向推荐」面板选择根音和类型后，点击「生成推荐」获取经典和弦进行（如 I-V-vi-IV、ii-V-I 等）。可试听或选择应用到音圈。"
          />
          <Section
            icon={<Ear className="w-4 h-4" />}
            title="听音训练"
            desc="系统随机播放一个和弦，在音圈上找出所有组成音符后点击「检查」。答对加分，连续答对分数翻倍。支持重播和换题。"
          />
          <Section
            icon={<ChevronUp className="w-4 h-4" />}
            title="八度选择"
            desc="音圈右上角下拉框可选择基础八度（C0-C7）。切换八度时旋转偏移清零。之后旋转可在当前八度基础上继续叠加。"
          />
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-sky-400 shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white/85 mb-1">{title}</h3>
        <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">{desc}</p>
      </div>
    </div>
  );
}
