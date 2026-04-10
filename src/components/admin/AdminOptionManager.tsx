"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";

import {
  createProductOptionAction,
  deleteProductOptionAction,
  reorderProductOptionsAction,
  updateProductOptionAction,
} from "@/app/admin/products/actions";
import { type ProductOptionGroup, type ProductOptionValue } from "@/lib/products";

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
          getErrorMessage(actionError, "Nem sikerult elmenteni a sorrendet."),
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
    <div className="space-y-6">
      {localGroups.map((group) => (
        <section
          key={group.type}
          className="admin-panel p-6"
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="admin-eyebrow">
                Opciókészlet
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--admin-ink-900)]">{group.label}</h2>
              <p className="mt-2 text-sm text-[var(--admin-ink-600)]">
                Húzd a fogantyút az elemek átrendezéséhez. A sorrend automatikusan mentődik.
              </p>
            </div>
          </div>

          <form
            className="admin-panel-soft mb-5 grid gap-3 p-4 md:grid-cols-[1fr_1fr_auto]"
            onSubmit={(event) => {
              event.preventDefault();
              handleCreate(group.type, new FormData(event.currentTarget));
              event.currentTarget.reset();
            }}
          >
            <input type="hidden" name="type" value={group.type} />
            <input
              name="name"
              placeholder={`Új ${group.label.toLowerCase()} neve`}
              className="admin-input h-11 rounded-2xl px-4 text-sm"
            />
            <input
              name="slug"
              placeholder="Slug (opcionális)"
              className="admin-input h-11 rounded-2xl px-4 text-sm"
            />
            <button
              type="submit"
              disabled={isPending && pendingCreateType === group.type}
              className="admin-button-primary inline-flex h-11 items-center justify-center px-5 text-sm"
            >
              Opció hozzáadása
            </button>
          </form>

          <div className="space-y-3">
            {group.options.map((option, index) => {
              const isPendingSave = isPending && pendingSaveId === option.clientId;
              const isPendingDelete = isPending && pendingDeleteId === option.clientId;

              return (
                <form
                  key={option.clientId}
                  className={`flex flex-col gap-3 rounded-[1.4rem] border bg-white p-4 transition xl:flex-row xl:items-end xl:justify-between ${
                    draggedOptionId === option.clientId
                      ? "border-[#bfd0ea] shadow-[0_10px_24px_rgba(31,79,150,0.12)]"
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

                  <div className="flex flex-1 gap-3">
                    <div className="flex shrink-0 items-start gap-2 pt-1">
                      <button
                        type="button"
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", option.clientId);
                          setDraggedOptionId(option.clientId);
                        }}
                        onDragEnd={() => setDraggedOptionId(null)}
                        className="admin-button-secondary inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[var(--admin-ink-600)]"
                        aria-label={`${option.name} átrendezése`}
                        title="Húzd az elem átrendezéséhez"
                      >
                        <GripVertical className="h-4 w-4" />
                      </button>

                      <div className="flex flex-col gap-2 sm:hidden">
                        <button
                          type="button"
                          onClick={() => handleMoveByStep(group.type, option.clientId, -1)}
                          disabled={isPending || index === 0}
                          className="admin-button-secondary inline-flex h-9 w-9 items-center justify-center text-[var(--admin-ink-600)] disabled:opacity-40"
                          aria-label={`${option.name} mozgatása felfelé`}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveByStep(group.type, option.clientId, 1)}
                          disabled={isPending || index === group.options.length - 1}
                          className="admin-button-secondary inline-flex h-9 w-9 items-center justify-center text-[var(--admin-ink-600)] disabled:opacity-40"
                          aria-label={`${option.name} mozgatása lefelé`}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid flex-1 gap-3 md:grid-cols-2">
                      <input
                        name="name"
                        defaultValue={option.name}
                        className="admin-input h-11 min-w-0 rounded-2xl px-4 text-sm"
                      />
                      <input
                        name="slug"
                        defaultValue={option.slug}
                        className="admin-input h-11 min-w-0 rounded-2xl px-4 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-[auto_auto_auto_auto] sm:items-end sm:justify-end xl:flex xl:flex-none xl:items-end">
                    <label className="admin-checkbox-pill flex h-11 items-center gap-2 px-4 text-sm">
                      <input
                        type="checkbox"
                        name="isActive"
                        defaultChecked={option.isActive}
                        className="h-4 w-4 accent-[var(--admin-blue-600)]"
                      />
                      Aktív
                    </label>
                    <button
                      type="submit"
                      disabled={isPendingSave || isPendingDelete}
                      className="admin-button-secondary inline-flex h-11 items-center justify-center px-4 text-sm disabled:opacity-60"
                    >
                      Mentés
                    </button>
                    <button
                      type="button"
                      disabled={isPendingSave || isPendingDelete}
                      onClick={() => handleDelete(group.type, option)}
                      className="admin-button-danger inline-flex h-11 items-center justify-center px-4 text-sm disabled:opacity-60"
                    >
                      Törlés
                    </button>
                    <div className="hidden gap-2 sm:flex">
                      <button
                        type="button"
                        onClick={() => handleMoveByStep(group.type, option.clientId, -1)}
                        disabled={isPending || index === 0}
                        className="admin-button-secondary inline-flex h-11 w-11 items-center justify-center text-[var(--admin-ink-600)] disabled:opacity-40"
                        aria-label={`${option.name} mozgatása felfelé`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveByStep(group.type, option.clientId, 1)}
                        disabled={isPending || index === group.options.length - 1}
                        className="admin-button-secondary inline-flex h-11 w-11 items-center justify-center text-[var(--admin-ink-600)] disabled:opacity-40"
                        aria-label={`${option.name} mozgatása lefelé`}
                      >
                        <ArrowDown className="h-4 w-4" />
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
