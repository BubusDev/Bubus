const VALUES = [
  "Kézzel alkotva",
  "Féldrágakövek",
  "Etikus beszerzés",
  "Limitált darabok",
  "Minőség garantált",
];

export function ValueStrip() {
  return (
    <div className="w-full border-y border-[#f0dde6] bg-[#fdf8fb] py-4 px-6">
      <div className="flex items-center overflow-x-auto lg:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden divide-x divide-[#eddde6]">
        {VALUES.map((label) => (
          <span
            key={label}
            className="flex-shrink-0 px-5 text-[10px] uppercase tracking-[0.28em] text-[#b08898] whitespace-nowrap lg:px-8"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
