import { saveAnnouncementBarAction } from "@/app/admin/announcement/actions";
import type { AdminAnnouncementBarValues } from "@/lib/announcement-bar";

type AdminAnnouncementBarFormProps = {
  announcement: AdminAnnouncementBarValues;
};

const variants = [
  { value: "DEFAULT", label: "Default" },
  { value: "SALE", label: "Sale" },
  { value: "SPECIAL_EDITION", label: "Special Edition" },
  { value: "NEW_COLLECTION", label: "New Collection" },
] as const;

export function AdminAnnouncementBarForm({
  announcement,
}: AdminAnnouncementBarFormProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_360px]">
      <form
        action={saveAnnouncementBarAction}
        className="admin-panel p-6"
      >
        <input type="hidden" name="id" value={announcement.id} />

        <div className="space-y-2">
          <p className="admin-eyebrow">
            Storefront Strip
          </p>
          <h2 className="font-[family:var(--font-display)] text-[2rem] text-[var(--admin-ink-900)]">
            Announcement bar
          </h2>
          <p className="max-w-[58ch] text-sm leading-7 text-[var(--admin-ink-600)]">
            One short editorial line above the header. Keep the message compact and restrained.
          </p>
        </div>

        <div className="mt-8 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-[var(--admin-ink-700)]">Text</span>
            <input
              type="text"
              name="text"
              defaultValue={announcement.text}
              maxLength={120}
              placeholder="New collection now live"
              className="admin-input h-12 px-4 text-sm"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-[var(--admin-ink-700)]">Link</span>
            <input
              type="text"
              name="href"
              defaultValue={announcement.href}
              placeholder="/new-in"
              className="admin-input h-12 px-4 text-sm"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-[var(--admin-ink-700)]">Variant</span>
            <select
              name="variant"
              defaultValue={announcement.variant}
              className="admin-select h-12 px-4 text-sm"
            >
              {variants.map((variant) => (
                <option key={variant.value} value={variant.value}>
                  {variant.label}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-checkbox-pill inline-flex items-center gap-3 px-4 py-3 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={announcement.isActive}
              className="h-4 w-4 rounded border-[#cfb2c0] text-[#8f5f77] focus:ring-[#d8b5c5]"
            />
            Show above the header
          </label>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="admin-button-primary h-12 px-5 text-sm"
          >
            Save announcement
          </button>
        </div>
      </form>

      <aside className="admin-panel-soft p-6">
        <p className="admin-eyebrow">
          Preview Notes
        </p>
        <p className="mt-4 text-sm leading-7 text-[var(--admin-ink-600)]">
          This strip is intentionally thin, centered, and quiet. If the message starts feeling like
          ad copy, it is too loud for the storefront direction.
        </p>
        <div className="admin-panel-muted mt-6 px-4 py-3">
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.28em] text-[var(--admin-ink-700)]">
            {announcement.text || "Announcement preview"}
          </p>
        </div>
      </aside>
    </div>
  );
}
