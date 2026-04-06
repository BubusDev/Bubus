---
name: Admin product form redesign
description: AdminProductForm.tsx redesigned to glassmorphism two-column layout
type: project
---

The AdminProductForm was redesigned from a 5-step wizard to a two-column glassmorphism layout.

**Why:** User requested visual upgrade matching the shop's lush glassmorphism design language (blobs, white/60 glass cards, rose→coral CTA gradient).

**Key changes:**
- Removed step wizard (StepShell, stepDefinitions, step state)
- New two-column layout: `grid-cols-[1fr_360px]`, right column sticky `top-28`
- `CardShell` component replaces `StepShell`
- `PillSelectField` replaces `SelectField` — shows options as pill chips, keeps management modal
- `ToggleSwitch` replaces checkboxes for isNew/isGiftable/isOnSale
- Ambient blobs via `position: fixed; -z-10` with CSS keyframe animations
- Auto slug generation from product name (`generateSlug()` helper added)
- Discount % badge auto-calculated from price vs compareAtPrice
- Drag & drop image upload zone with proper `onDrop` handler
- SEO accordion section (Google snippet preview using name/slug/shortDescription)
- All submission logic, validation, and option management preserved unchanged

**How to apply:** Any future admin UI work should follow this two-column pattern and use the same design tokens (`ctaGradient`, `inputCls`, `textareaCls`, `eyebrowCls`).
