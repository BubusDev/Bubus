export const SHOWCASE_FILTER_TYPE_LABELS = {
  new_arrivals: "Újdonságok",
  category: "Kategória",
  on_sale: "Akciós",
  giftable: "Ajándéknak",
  manual: "Kézi válogatás",
} as const;

export type ShowcaseFilterType = keyof typeof SHOWCASE_FILTER_TYPE_LABELS;

export const SHOWCASE_FILTER_TYPES = [
  { value: "new_arrivals", label: SHOWCASE_FILTER_TYPE_LABELS.new_arrivals },
  { value: "category", label: SHOWCASE_FILTER_TYPE_LABELS.category },
  { value: "on_sale", label: SHOWCASE_FILTER_TYPE_LABELS.on_sale },
  { value: "giftable", label: SHOWCASE_FILTER_TYPE_LABELS.giftable },
  { value: "manual", label: SHOWCASE_FILTER_TYPE_LABELS.manual },
] as const;

export function getShowcaseFilterTypeLabel(filterType: string) {
  return SHOWCASE_FILTER_TYPE_LABELS[filterType as ShowcaseFilterType] ?? filterType;
}
