export const internalOrderStatuses = [
  { value: "received", label: "Beérkezett" },
  { value: "in_production", label: "Elkészítés alatt" },
  { value: "packed", label: "Becsomagolva" },
  { value: "label_ready", label: "Címke kész" },
  { value: "shipped", label: "Feladva" },
  { value: "closed", label: "Lezárva" },
  { value: "issue", label: "Problémás" },
] as const;

export const orderStatusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  received: { label: "Beérkezett", bg: "#f0f0f0", color: "#555", border: "#ddd" },
  in_production: { label: "Elkészítés", bg: "#fef9e7", color: "#7d6608", border: "#f0d080" },
  packed: { label: "Becsomagolva", bg: "#eaf4fb", color: "#1a5276", border: "#a9cce3" },
  label_ready: { label: "Címke kész", bg: "#e8f8f5", color: "#1e8449", border: "#a9dfbf" },
  shipped: { label: "Feladva", bg: "#eafaf1", color: "#145a32", border: "#82e0aa" },
  closed: { label: "Lezárva", bg: "#f2f3f4", color: "#333", border: "#ccc" },
  issue: { label: "Problémás", bg: "#fff1f0", color: "#9f1239", border: "#f3b5b3" },
};

export const adminOrderQueueFilters = [
  { key: "all", label: "Összes" },
  { key: "received", label: "Beérkezett" },
  { key: "label_ready", label: "Címkézés" },
  { key: "packed", label: "Csomagolás" },
  { key: "shipped", label: "Feladva" },
  { key: "closed", label: "Lezárva" },
  { key: "exceptions", label: "Problémás" },
] as const;

export const returnRequestStatuses = [
  { value: "new", label: "Új" },
  { value: "in_review", label: "Ellenőrzés alatt" },
  { value: "approved", label: "Jóváhagyva" },
  { value: "rejected", label: "Elutasítva" },
  { value: "completed", label: "Lezárva" },
] as const;

export const returnRequestStatusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  new: { label: "Új", bg: "#fff7ed", color: "#9a3412", border: "#fdba74" },
  in_review: { label: "Ellenőrzés alatt", bg: "#eff6ff", color: "#1d4ed8", border: "#93c5fd" },
  approved: { label: "Jóváhagyva", bg: "#ecfdf5", color: "#047857", border: "#86efac" },
  rejected: { label: "Elutasítva", bg: "#fdf2f8", color: "#be185d", border: "#f9a8d4" },
  completed: { label: "Lezárva", bg: "#f5f5f4", color: "#44403c", border: "#d6d3d1" },
};

export const returnRefundStatusConfig: Record<string, { label: string; bg: string; color: string; border: string }> = {
  not_refunded: { label: "Nincs visszatérítés", bg: "#fafaf9", color: "#57534e", border: "#d6d3d1" },
  pending: { label: "Visszatérítés folyamatban", bg: "#eff6ff", color: "#1d4ed8", border: "#93c5fd" },
  succeeded: { label: "Visszatérítve", bg: "#ecfdf5", color: "#047857", border: "#86efac" },
  failed: { label: "Visszatérítés sikertelen", bg: "#fff1f2", color: "#be123c", border: "#fda4af" },
};

export const returnRefundQueueFilters = [
  { value: "all", label: "Összes refund" },
  { value: "pending", label: "Pending refund" },
  { value: "failed", label: "Sikertelen refund" },
  { value: "succeeded", label: "Visszatérítve" },
] as const;
