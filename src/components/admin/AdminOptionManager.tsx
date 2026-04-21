"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Check, GripVertical, Plus, Trash2 } from "lucide-react";

import {
  createProductOptionAction,
  deleteProductOptionAction,
  reorderProductOptionsAction,
  updateProductOptionAction,
} from "@/app/(admin)/admin/products/actions";
import { type ProductOptionGroup, type ProductOptionValue } from "@/lib/products-client";

type AdminOptionManagerProps = {
  groups: ProductOptionGroup[];
};

type ProductOptionGroupState = Omit<ProductOptionGroup, "options"> & {
  options: LocalOptionRow[];
};

type LocalOptionRow = ProductOptionValue & {
  clientId: string;
  persistedId: string | null;
};

function toLocalRow(option: ProductOptionValue): LocalOptionRow {
  return {
    ...option,
    clientId: option.id,
    persistedId: option.id,
  };
}

function normalizeOptionOrder(options: LocalOptionRow[]) {
  return options.map((option, index) => ({
    ...option,
    sortOrder: index,
  }));
}

function moveOption(options: LocalOptionRow[], activeId: string, targetId: string) {
  const activeIndex = options.findIndex((option) => option.clientId === activeId);
  const targetIndex = options.findIndex((option) => option.clientId === targetId);

  if (activeIndex === -1 || targetIndex === -1 || activeIndex === targetIndex) {
    return options;
  }

  const nextOptions = [...options];
  const [movedOption] = nextOptions.splice(activeIndex, 1);
  nextOptions.splice(targetIndex, 0, movedOption);
  return normalizeOptionOrder(nextOptions);
}

function toLocalGroups(groups: ProductOptionGroup[]): ProductOptionGroupState[] {
  return groups.map((group) => ({
    ...group,
    options: normalizeOptionOrder(group.options.map(toLocalRow)),
  }));
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function AdminOptionManager({ groups }: AdminOptionManagerProps) {
  const [localGroups, setLocalGroups] = useState(() => toLocalGroups(groups));
  const [draggedOptionId, setDraggedOptionId] = useState<string | null>(null);
  const [errorByGroup, setErrorByGroup] = useState<Record<string, string | null>>({});
  const [pendingSaveId, setPendingSaveId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingCreateType, setPendingCreateType] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLocalGroups(toLocalGroups(groups));
  }, [groups]);

  const groupLookup = useMemo(
    () => new Map(localGroups.map((group) => [group.type, group])),
    [localGroups],
  );

  function setGroupError(type: ProductOptionGroup["type"], message: string | null) {
    setErrorByGroup((current) => ({ ...current, [type]: message }));
  }

  function updateGroupOptions(type: ProductOptionGroup["type"], options: LocalOptionRow[]) {
    setLocalGroups((current) =>
      current.map((group) =>
        group.type === type
          ? { ...group, options: normalizeOptionOrder(options) }
          : group,
      ),
    );
  }

  function updateSingleOption(
    type: ProductOptionGroup["type"],
    clientId: string,
    nextOption: LocalOptionRow,
  ) {
    setLocalGroups((current) =>
      current.map((group) =>
        group.type === type
          ? {
              ...group,
              options: normalizeOptionOrder(
                group.options.map((option) =>
                  option.clientId === clientId ? nextOption : option,
                ),
              ),
            }
          : group,
      ),
    );
  }

  function removeLocalOption(type: ProductOptionGroup["type"], clientId: string) {
    setLocalGroups((current) =>
      current.map((group) =>
        group.type === type
          ? {
              ...group,
              options: normalizeOptionOrder(
                group.options.filter((option) => option.clientId !== clientId),
              ),
            }
          : group,
      ),
    );
  }

  function appendLocalOption(type: ProductOptionGroup["type"], option: ProductOptionValue) {
    setLocalGroups((current) =>
      current.map((group) =>
        group.type === type
          ? {
              ...group,
              options: normalizeOptionOrder([...group.options, toLocalRow(option)]),
            }
          : group,
      ),
    );
  }

  function persistOrder(
    type: ProductOptionGroup["type"],
    nextOptions: LocalOptionRow[],
    previousOptions: LocalOptionRow[],
  ) {
    const persistedOptionIds = nextOptions
      .map((option) => option.persistedId)
      .filter((id): id is string => Boolean(id));

    if (persistedOptionIds.length <= 1) {
      return;
    }

    const formData = new FormData();
    formData.append("type", type);
    persistedOptionIds.forEach((optionId) => {
      formData.append("orderedOptionIds", optionId);
    });

    setGroupError(type, null);

    startTransition(async () => {
      try {
        await reorderProductOptionsAction(formData);
      } catch (actionError) {
        updateGroupOptions(type, previousOptions);
        setGroupError(
          type,
          getErrorMessage(actionError, "Nem sikerült menteni a sorrendet."),
        );
      }
    });
  }

  function handleReorder(
    type: ProductOptionGroup["type"],
    activeId: string,
    targetId: string,
  ) {
    const group = groupLookup.get(type);
    if (!group || activeId === targetId) {
      return;
    }

    const previousOptions = group.options;
    const nextOptions = moveOption(previousOptions, activeId, targetId);

    if (nextOptions === previousOptions) {
      return;
    }

    updateGroupOptions(type, nextOptions);
    persistOrder(type, nextOptions, previousOptions);
  }

  function handleMoveByStep(
    type: ProductOptionGroup["type"],
    optionId: string,
    direction: -1 | 1,
  ) {
    const group = groupLookup.get(type);
    if (!group) {
      return;
    }

    const currentIndex = group.options.findIndex((option) => option.clientId === optionId);
    const targetIndex = currentIndex + direction;

    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= group.options.length) {
      return;
    }

    handleReorder(type, optionId, group.options[targetIndex].clientId);
  }

  function handleCreate(type: ProductOptionGroup["type"], formData: FormData) {
    setGroupError(type, null);
    setPendingCreateType(type);

    startTransition(async () => {
      try {
        const option = await createProductOptionAction(formData);
        appendLocalOption(type, option);
      } catch (actionError) {
        setGroupError(
          type,
          getErrorMessage(actionError, "Nem sikerült létrehozni az opciót."),
        );
      } finally {
        setPendingCreateType(null);
      }
    });
  }

  function handleSave(
    type: ProductOptionGroup["type"],
    option: LocalOptionRow,
    formData: FormData,
  ) {
    setGroupError(type, null);
    setPendingSaveId(option.clientId);

    startTransition(async () => {
      try {
        if (option.persistedId) {
          formData.set("optionId", option.persistedId);
          await updateProductOptionAction(formData);

          updateSingleOption(type, option.clientId, {
            ...option,
            name: typeof formData.get("name") === "string" ? String(formData.get("name")).trim() : option.name,
            slug: typeof formData.get("slug") === "string" ? String(formData.get("slug")).trim() : option.slug,
            isActive: formData.get("isActive") === "on",
            isStorefrontVisible:
              type === "CATEGORY"
                ? formData.getAll("isStorefrontVisible").includes("on")
                : option.isStorefrontVisible,
            showInMainNav:
              type === "CATEGORY"
                ? formData.getAll("showInMainNav").includes("on")
                : option.showInMainNav,
            navSortOrder:
              type === "CATEGORY" && typeof formData.get("navSortOrder") === "string"
                ? Number(formData.get("navSortOrder")) || 0
                : option.navSortOrder,
            navLabel:
              type === "CATEGORY" && typeof formData.get("navLabel") === "string"
                ? String(formData.get("navLabel")).trim() || null
                : option.navLabel,
            sortOrder:
              typeof formData.get("sortOrder") === "string"
                ? Number(formData.get("sortOrder")) || option.sortOrder
                : option.sortOrder,
          });
          return;
        }

        formData.delete("optionId");
        formData.set("type", type);

        const created = await createProductOptionAction(formData);
        updateSingleOption(type, option.clientId, {
          ...created,
          clientId: created.id,
          persistedId: created.id,
        });
      } catch (actionError) {
        setGroupError(type, getErrorMessage(actionError, "Nem sikerült menteni az opciót."));
      } finally {
        setPendingSaveId(null);
      }
    });
  }

  function handleDelete(type: ProductOptionGroup["type"], option: LocalOptionRow) {
    setGroupError(type, null);

    if (!option.persistedId) {
      removeLocalOption(type, option.clientId);
      return;
    }

    setPendingDeleteId(option.clientId);

    const formData = new FormData();
    formData.append("optionId", option.persistedId);

    startTransition(async () => {
      try {
        await deleteProductOptionAction(formData);
        removeLocalOption(type, option.clientId);
      } catch (actionError) {
        setGroupError(type, getErrorMessage(actionError, "Nem sikerült törölni az opciót."));
      } finally {
        setPendingDeleteId(null);
      }
    });
  }

  return (
    <div className="space-y-4">
      {localGroups.map((group) => (
        <section
          key={group.type}
          className="admin-panel p-4"
        >
          <div className="mb-3 flex items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="admin-eyebrow">Opciókészlet</p>
                <span className="admin-badge-neutral admin-pill text-[10px]">
                  {group.options.length} opció
                </span>
              </div>
              <h2 className="mt-1 text-lg font-semibold text-[var(--admin-ink-900)]">{group.label}</h2>
              <p className="mt-1 text-xs text-[var(--admin-ink-600)]">
                {group.type === "CATEGORY"
                  ? "A Boltoldal külön kategóriaoldalt engedélyez. A Főmenü csak külön bekapcsolva jelenik meg."
                  : "Húzással vagy nyilakkal rendezhető. A sorrend automatikusan mentődik."}
              </p>
            </div>
          </div>

          <form
            className="admin-panel-soft mb-3 grid gap-2 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              handleCreate(group.type, new FormData(event.currentTarget));
              event.currentTarget.reset();
            }}
          >
            <input type="hidden" name="type" value={group.type} />
            <div className="grid gap-2 md:grid-cols-[minmax(160px,1fr)_minmax(140px,0.8fr)_auto]">
              <input
                name="name"
                placeholder={`Új ${group.label.toLowerCase()}`}
                className="admin-input h-9 px-3 text-sm"
              />
              <input
                name="slug"
                placeholder="Slug"
                className="admin-input h-9 px-3 text-sm"
              />
              <button
                type="submit"
                disabled={isPending && pendingCreateType === group.type}
                className="admin-button-primary inline-flex h-9 items-center justify-center gap-1.5 px-3 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Hozzáadás
              </button>
            </div>
            {group.type === "CATEGORY" ? (
              <div className="grid gap-2 border-t border-[var(--admin-line-100)] pt-2 md:grid-cols-[auto_auto_minmax(120px,0.5fr)_minmax(140px,0.8fr)] md:items-center">
                <label className="admin-checkbox-pill flex h-8 items-center gap-2 px-2.5 text-xs">
                  <input type="hidden" name="isStorefrontVisible" value="off" />
                  <input
                    type="checkbox"
                    name="isStorefrontVisible"
                    defaultChecked
                    className="h-3.5 w-3.5 accent-[var(--admin-blue-600)]"
                  />
                  Boltoldal
                </label>
                <label className="admin-checkbox-pill flex h-8 items-center gap-2 px-2.5 text-xs">
                  <input type="hidden" name="showInMainNav" value="off" />
                  <input
                    type="checkbox"
                    name="showInMainNav"
                    className="h-3.5 w-3.5 accent-[var(--admin-blue-600)]"
                  />
                  Főmenü
                </label>
                <input
                  name="navSortOrder"
                  inputMode="numeric"
                  placeholder="Menü sorrend"
                  className="admin-input h-8 px-2.5 text-xs"
                />
                <input
                  name="navLabel"
                  placeholder="Menücímke (opcionális)"
                  className="admin-input h-8 px-2.5 text-xs"
                />
              </div>
            ) : null}
          </form>

          <div className="space-y-2">
            {group.options.map((option, index) => {
              const isPendingSave = isPending && pendingSaveId === option.clientId;
              const isPendingDelete = isPending && pendingDeleteId === option.clientId;

              return (
                <form
                  key={option.clientId}
                  className={`grid gap-2 border bg-white p-2.5 transition xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center ${
                    draggedOptionId === option.clientId
                      ? "border-[#bfd0ea] bg-[var(--admin-blue-050)]"
                      : "border-[var(--admin-line-100)]"
                  }`}
                  onSubmit={(event) => {
                    event.preventDefault();
                    handleSave(group.type, option, new FormData(event.currentTarget));
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    const activeId = event.dataTransfer.getData("text/plain");
                    setDraggedOptionId(null);
                    if (activeId) {
                      handleReorder(group.type, activeId, option.clientId);
                    }
                  }}
                >
                  <input
                    type="hidden"
                    name="optionId"
                    value={option.persistedId ?? ""}
                  />
                  <input type="hidden" name="sortOrder" value={option.sortOrder} />

                  <div className="grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", option.clientId);
                          setDraggedOptionId(option.clientId);
                        }}
                        onDragEnd={() => setDraggedOptionId(null)}
                        className="admin-button-secondary inline-flex h-8 w-8 items-center justify-center text-[var(--admin-ink-600)]"
                        aria-label={`${option.name} átrendezése`}
                        title="Húzd az elem átrendezéséhez"
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>

                      <div className="flex gap-1 sm:hidden">
                        <button
                          type="button"
                          onClick={() => handleMoveByStep(group.type, option.clientId, -1)}
                          disabled={isPending || index === 0}
                          className="admin-button-secondary inline-flex h-8 w-8 items-center justify-center text-[var(--admin-ink-600)] disabled:opacity-40"
                          aria-label={`${option.name} mozgatása felfelé`}
                          title="Fel"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveByStep(group.type, option.clientId, 1)}
                          disabled={isPending || index === group.options.length - 1}
                          className="admin-button-secondary inline-flex h-8 w-8 items-center justify-center text-[var(--admin-ink-600)] disabled:opacity-40"
                          aria-label={`${option.name} mozgatása lefelé`}
                          title="Le"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid min-w-0 gap-2 md:grid-cols-[minmax(180px,1fr)_minmax(140px,0.85fr)]">
                      <input
                        name="name"
                        defaultValue={option.name}
                        className="admin-input h-9 min-w-0 px-3 text-sm"
                        aria-label={`${option.name} neve`}
                      />
                      <input
                        name="slug"
                        defaultValue={option.slug}
                        className="admin-input h-9 min-w-0 px-3 text-sm"
                        aria-label={`${option.name} slug`}
                      />
                    </div>
                  </div>

                  {group.type === "CATEGORY" ? (
                    <div className="grid gap-2 border-t border-[var(--admin-line-100)] pt-2 md:grid-cols-[auto_auto_minmax(110px,0.5fr)_minmax(140px,0.8fr)] md:items-center xl:border-t-0 xl:pt-0">
                      <label className="admin-checkbox-pill flex h-8 items-center gap-2 px-2.5 text-xs">
                        <input type="hidden" name="isStorefrontVisible" value="off" />
                        <input
                          type="checkbox"
                          name="isStorefrontVisible"
                          defaultChecked={option.isStorefrontVisible}
                          className="h-3.5 w-3.5 accent-[var(--admin-blue-600)]"
                        />
                        Boltoldal
                      </label>
                      <label className="admin-checkbox-pill flex h-8 items-center gap-2 px-2.5 text-xs">
                        <input type="hidden" name="showInMainNav" value="off" />
                        <input
                          type="checkbox"
                          name="showInMainNav"
                          defaultChecked={option.showInMainNav}
                          className="h-3.5 w-3.5 accent-[var(--admin-blue-600)]"
                        />
                        Főmenü
                      </label>
                      <input
                        name="navSortOrder"
                        inputMode="numeric"
                        defaultValue={option.navSortOrder}
                        className="admin-input h-8 min-w-0 px-2.5 text-xs"
                        aria-label={`${option.name} főmenü sorrend`}
                      />
                      <input
                        name="navLabel"
                        defaultValue={option.navLabel ?? ""}
                        placeholder="Menücímke"
                        className="admin-input h-8 min-w-0 px-2.5 text-xs"
                        aria-label={`${option.name} főmenü címke`}
                      />
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <label
                      className="admin-checkbox-pill flex h-8 items-center gap-2 px-2.5 text-xs"
                      title={option.isActive ? "Aktív opció" : "Inaktív opció"}
                    >
                      <input
                        type="checkbox"
                        name="isActive"
                        defaultChecked={option.isActive}
                        className="h-3.5 w-3.5 accent-[var(--admin-blue-600)]"
                        aria-label={`${option.name} aktív`}
                      />
                      Aktív
                    </label>
                    <button
                      type="submit"
                      disabled={isPendingSave || isPendingDelete}
                      className="admin-button-secondary inline-flex h-8 w-8 items-center justify-center text-[var(--admin-ink-700)] disabled:opacity-60"
                      aria-label={`${option.name} mentése`}
                      title="Mentés"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isPendingSave || isPendingDelete}
                      onClick={() => handleDelete(group.type, option)}
                      className="admin-button-danger inline-flex h-8 w-8 items-center justify-center disabled:opacity-60"
                      aria-label={`${option.name} törlése`}
                      title="Törlés"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <div className="hidden gap-1.5 sm:flex">
                      <button
                        type="button"
                        onClick={() => handleMoveByStep(group.type, option.clientId, -1)}
                        disabled={isPending || index === 0}
                        className="admin-button-secondary inline-flex h-8 w-8 items-center justify-center text-[var(--admin-ink-600)] disabled:opacity-40"
                        aria-label={`${option.name} mozgatása felfelé`}
                        title="Fel"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveByStep(group.type, option.clientId, 1)}
                        disabled={isPending || index === group.options.length - 1}
                        className="admin-button-secondary inline-flex h-8 w-8 items-center justify-center text-[var(--admin-ink-600)] disabled:opacity-40"
                        aria-label={`${option.name} mozgatása lefelé`}
                        title="Le"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </form>
              );
            })}
          </div>

          {errorByGroup[group.type] ? (
            <p className="mt-3 text-sm text-[#ad4455]">{errorByGroup[group.type]}</p>
          ) : null}
        </section>
      ))}
    </div>
  );
}
