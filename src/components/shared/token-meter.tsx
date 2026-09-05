import { Zap } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface TokenMeterProps {
  usedTokens: number;
  totalTokens: number;
}

export function TokenMeter({ usedTokens = 0, totalTokens = 5000 }: TokenMeterProps) {
  const percentage = Math.min(100, Math.round((usedTokens / totalTokens) * 100));

  return (
    <div 
      title="Tokens auto-refill every 3 days"
      className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#090c24] px-3 py-1.5 text-xs text-slate-300 shadow-sm"
    >
      <Zap className="h-3.5 w-3.5 text-amber-400" />
      <div className="flex flex-col gap-0.5">
        <div className="flex justify-between gap-2 font-medium">
          <span>Tokens:</span>
          <span>
            {formatNumber(usedTokens)} / {formatNumber(totalTokens)}
          </span>
        </div>
        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
