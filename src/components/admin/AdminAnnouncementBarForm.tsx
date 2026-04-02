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
        className="rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_20px_45px_rgba(191,117,162,0.1)] backdrop-blur-xl"
      >
        <input type="hidden" name="id" value={announcement.id} />

        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#af7795]">
            Storefront Strip
          </p>
          <h2 className="font-[family:var(--font-display)] text-[2rem] text-[#4d2741]">
            Announcement bar
          </h2>
          <p className="max-w-[58ch] text-sm leading-7 text-[#765f6d]">
            One short editorial line above the header. Keep the message compact and restrained.
          </p>
        </div>

        <div className="mt-8 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-[#5e4454]">Text</span>
            <input
              type="text"
              name="text"
              defaultValue={announcement.text}
              maxLength={120}
              placeholder="New collection now live"
              className="h-12 rounded-2xl border border-[#ead7df] bg-[#fffafb] px-4 text-sm text-[#4d2741] outline-none transition focus:border-[#d8b5c5] focus:bg-white"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-[#5e4454]">Link</span>
            <input
              type="text"
              name="href"
              defaultValue={announcement.href}
              placeholder="/new-in"
              className="h-12 rounded-2xl border border-[#ead7df] bg-[#fffafb] px-4 text-sm text-[#4d2741] outline-none transition focus:border-[#d8b5c5] focus:bg-white"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-[#5e4454]">Variant</span>
            <select
              name="variant"
              defaultValue={announcement.variant}
              className="h-12 rounded-2xl border border-[#ead7df] bg-[#fffafb] px-4 text-sm text-[#4d2741] outline-none transition focus:border-[#d8b5c5] focus:bg-white"
            >
              {variants.map((variant) => (
                <option key={variant.value} value={variant.value}>
                  {variant.label}
                </option>
              ))}
            </select>
          </label>

          <label className="inline-flex items-center gap-3 rounded-2xl border border-[#ead7df] bg-[#fffafb] px-4 py-3 text-sm text-[#5e4454]">
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
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#f183bc] px-5 text-sm font-medium text-white shadow-[0_16px_35px_rgba(241,131,188,0.24)] transition hover:bg-[#ea6fb0]"
          >
            Save announcement
          </button>
        </div>
      </form>

      <aside className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,251,248,0.92),rgba(250,241,244,0.88))] p-6 shadow-[0_20px_45px_rgba(191,117,162,0.08)]">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#af7795]">
          Preview Notes
        </p>
        <p className="mt-4 text-sm leading-7 text-[#765f6d]">
          This strip is intentionally thin, centered, and quiet. If the message starts feeling like
          ad copy, it is too loud for the storefront direction.
        </p>
        <div className="mt-6 rounded-[1.6rem] border border-[#e8d7de] bg-[linear-gradient(180deg,rgba(252,245,242,0.96),rgba(248,237,239,0.94))] px-4 py-3">
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.28em] text-[#5f4353]">
            {announcement.text || "Announcement preview"}
          </p>
        </div>
      </aside>
    </div>
  );
}
