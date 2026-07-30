import { Sparkles } from "lucide-react";

export function VisionBadge() {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 bg-black/85 border border-[#C2A063]/30 px-2 py-1 sm:px-3 sm:py-1.5 rounded-sm">
      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#C2A063]" />
      <span className="text-[8px] sm:text-[10px] text-[#C2A063] uppercase tracking-widest font-medium">
        Verificado pela Aurixa Vision™
      </span>
    </div>
  );
}
