import { Gem, Leaf, Shield, Sparkles, Star } from "lucide-react";

const VALUES = [
  { Icon: Sparkles, label: "KÉZZEL ALKOTVA" },
  { Icon: Gem, label: "FÉLDRÁGAKÖVEK" },
  { Icon: Leaf, label: "ETIKUS BESZERZÉS" },
  { Icon: Star, label: "LIMITÁLT DARABOK" },
  { Icon: Shield, label: "MINŐSÉG GARANTÁLT" },
];

export function ValueStrip() {
  return (
    <div className="w-full bg-[#1a0f15] py-5 px-6">
      <div className="flex overflow-x-auto lg:justify-center gap-8 lg:gap-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {VALUES.map(({ Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 flex-shrink-0">
            <Icon className="w-5 h-5 text-rose-300" />
            <span className="text-[10px] font-semibold tracking-[0.28em] text-white/80 whitespace-nowrap">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
