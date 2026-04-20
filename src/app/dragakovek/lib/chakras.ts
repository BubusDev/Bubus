export const CHAKRA_LABELS: Record<string, { label: string; color: string }> = {
  crown: { label: "Korona", color: "#9b5de5" },
  "third-eye": { label: "Harmadik szem", color: "#4361ee" },
  throat: { label: "Torok", color: "#48bfe3" },
  heart: { label: "Szív", color: "#80ed99" },
  "solar-plexus": { label: "Napfonat", color: "#ffd166" },
  sacral: { label: "Szakrális", color: "#f8961e" },
  root: { label: "Gyökér", color: "#e63946" },
};

const CHAKRA_ALIASES: Record<string, string> = {
  korona: "crown",
  "korona csakra": "crown",
  "harmadik szem": "third-eye",
  "harmadik szem csakra": "third-eye",
  homlok: "third-eye",
  "homlok csakra": "third-eye",
  torok: "throat",
  "torok csakra": "throat",
  sziv: "heart",
  "sziv chakra": "heart",
  "sziv csakra": "heart",
  napfonat: "solar-plexus",
  "napfonat csakra": "solar-plexus",
  "gyomor chakra": "solar-plexus",
  "solar plexus": "solar-plexus",
  szakralis: "sacral",
  "szakralis csakra": "sacral",
  gyoker: "root",
  "gyoker csakra": "root",
};

export function getChakraDisplay(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const slug = CHAKRA_LABELS[normalized] ? normalized : CHAKRA_ALIASES[normalized];

  if (!slug) return null;
  return CHAKRA_LABELS[slug];
}
