import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import {
  Check,
  ImagePlus,
  Loader2,
  Pencil,
  Save,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import {
  galleryFilters,
  type GalleryCategory,
  type Project,
} from "../../data/gallery";
import { Button } from "../../components/Button";
import { TextInput, SelectInput } from "../../components/FormInputs";
import {
  deletePhoto,
  prettifyName,
  reorderPhotos,
  resizeImage,
  updatePhoto,
  uploadPhoto,
  type PhotoCategory,
  type ServerPhoto,
} from "../../lib/adminApi";
import { DragHandle, ReorderButtons, reorderSubset, useDragReorder } from "./reorder";

const CATEGORY_OPTIONS = galleryFilters
  .filter((f) => f.id !== "all")
  .map((f) => ({ id: f.id as PhotoCategory, label: f.label }));

const DEFAULT_CATEGORY: PhotoCategory = CATEGORY_OPTIONS[0].id;

function categoryLabel(id: string): string {
  return galleryFilters.find((f) => f.id === id)?.label ?? id;
}

interface Draft {
  key: string;
  file: File;
  preview: string;
  title: string;
  category: PhotoCategory;
  alt: string;
}

/**
 * Photos panel — upload, plus the per-image controls the spec asks for:
 * assign/change category (incl. "Other"), delete, and drag-to-reorder within a
 * category.
 *
 * Reordering while a category filter is active only permutes that category's
 * photos; `reorderSubset` slots them back into the positions they occupied in the
 * full list, so a single deterministic global order is always what gets saved.
 */
export function PhotosPanel({
  photos,
  projects,
  setPhotos,
  onError,
  onNotice,
}: {
  photos: ServerPhoto[];
  projects: Project[];
  setPhotos: (next: ServerPhoto[]) => void;
  onError: (msg: string) => void;
  onNotice: (msg: string) => void;
}) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [manageFilter, setManageFilter] = useState<GalleryCategory>("all");
  const [editing, setEditing] = useState<ServerPhoto | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const draftsRef = useRef<Draft[]>([]);
  draftsRef.current = drafts;

  // Release object URLs for any drafts still queued when the panel unmounts
  // (e.g. the operator logs out mid-queue). publishAll/removeDraft cover the
  // normal paths; this catches the rest. draftsRef holds the latest list so this
  // once-on-unmount cleanup sees every outstanding preview.
  useEffect(() => {
    return () => {
      draftsRef.current.forEach((d) => URL.revokeObjectURL(d.preview));
    };
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of photos) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [photos]);

  // A photo inside a project is displayed under the *project's* category, not its
  // own — so changing this photo's category won't move it in the gallery. Surface
  // that instead of letting the operator wonder why nothing happened.
  const projectOf = useMemo(() => {
    const map = new Map<string, Project>();
    for (const project of projects)
      for (const id of project.photoIds) map.set(id, project);
    return map;
  }, [projects]);

  const shown = useMemo(
    () =>
      manageFilter === "all"
        ? photos
        : photos.filter((p) => p.category === manageFilter),
    [photos, manageFilter],
  );

  const drag = useDragReorder(shown, (nextShown) => {
    setPhotos(reorderSubset(photos, nextShown));
    setOrderDirty(true);
  });

  function reorderShown(nextShown: ServerPhoto[]) {
    setPhotos(reorderSubset(photos, nextShown));
    setOrderDirty(true);
  }

  async function saveOrder() {
    setSavingOrder(true);
    onError("");
    try {
      await reorderPhotos(photos.map((p) => p.id));
      setOrderDirty(false);
      onNotice("Photo order saved.");
    } catch (err) {
      onError((err as Error).message || "Could not save the new order.");
    } finally {
      setSavingOrder(false);
    }
  }

  const addFiles = useCallback((files: FileList | File[]) => {
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;
    setDrafts((prev) => [
      ...prev,
      ...images.map((file) => ({
        key: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        title: prettifyName(file.name),
        category: DEFAULT_CATEGORY,
        alt: "",
      })),
    ]);
  }, []);

  function onFileInput(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  }

  function updateDraft(key: string, patch: Partial<Draft>) {
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  }

  function removeDraft(key: string) {
    setDrafts((prev) => {
      const found = prev.find((d) => d.key === key);
      if (found) URL.revokeObjectURL(found.preview);
      return prev.filter((d) => d.key !== key);
    });
  }

  async function publishAll() {
    const queue = draftsRef.current;
    if (queue.length === 0 || busy) return;
    setBusy(true);
    onError("");
    onNotice("");
    setProgress({ done: 0, total: queue.length });

    const failed: Draft[] = [];
    const uploaded: ServerPhoto[] = [];
    for (let i = 0; i < queue.length; i++) {
      const d = queue[i];
      try {
        const { dataBase64, contentType } = await resizeImage(d.file);
        const photo = await uploadPhoto({
          dataBase64,
          contentType,
          title: d.title.trim() || prettifyName(d.file.name) || "Untitled",
          category: d.category,
          alt: d.alt.trim(),
        });
        uploaded.push(photo);
        URL.revokeObjectURL(d.preview);
      } catch {
        failed.push(d);
      }
      setProgress({ done: i + 1, total: queue.length });
    }

    setPhotos([...uploaded, ...photos]);
    setDrafts(failed);
    setBusy(false);
    if (failed.length > 0) {
      onError(
        `${failed.length} photo${failed.length > 1 ? "s" : ""} couldn't be uploaded — please try again.`,
      );
    } else {
      onNotice(
        `${uploaded.length} photo${uploaded.length > 1 ? "s" : ""} published — they're live on the site now.`,
      );
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this photo? This can't be undone.")) return;
    setDeletingId(id);
    onError("");
    try {
      await deletePhoto(id);
      setPhotos(photos.filter((p) => p.id !== id));
    } catch (err) {
      onError((err as Error).message || "Could not delete that photo.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      {/* Upload */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-400">
          Add photos
        </h2>

        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
            dragOver
              ? "border-accent-500 bg-accent-500/10"
              : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/[0.07]"
          }`}
        >
          <ImagePlus className="h-8 w-8 text-accent-400" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-white">
            Drag photos here, or click to browse
          </p>
          <p className="mt-1 text-xs text-navy-400">
            JPG, PNG or WebP — large photos are automatically resized for the web
          </p>
          <input
            ref={fileInputRef}
            id="admin-file-input"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onFileInput}
          />
        </div>

        {drafts.length > 0 && (
          <div className="mt-6 space-y-4">
            {drafts.map((d) => (
              <div
                key={d.key}
                className="flex flex-col gap-4 rounded-xl bg-white p-4 sm:flex-row"
              >
                <img
                  src={d.preview}
                  alt=""
                  className="h-28 w-full shrink-0 rounded-lg object-cover sm:h-28 sm:w-40"
                />
                <div className="flex-1 space-y-3">
                  <TextInput
                    label="Title"
                    id={`title-${d.key}`}
                    value={d.title}
                    disabled={busy}
                    onChange={(e) => updateDraft(d.key, { title: e.target.value })}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SelectInput
                      label="Category"
                      id={`cat-${d.key}`}
                      value={d.category}
                      disabled={busy}
                      onChange={(e) =>
                        updateDraft(d.key, {
                          category: e.target.value as PhotoCategory,
                        })
                      }
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </SelectInput>
                    <TextInput
                      label="Alt text (optional)"
                      id={`alt-${d.key}`}
                      placeholder="Describes the photo for accessibility"
                      value={d.alt}
                      disabled={busy}
                      onChange={(e) => updateDraft(d.key, { alt: e.target.value })}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeDraft(d.key)}
                  disabled={busy}
                  aria-label="Remove"
                  className="self-start rounded-lg p-2 text-navy-400 transition-colors hover:bg-navy-100 hover:text-navy-700 disabled:opacity-50"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
            ))}

            <Button
              type="button"
              size="lg"
              onClick={publishAll}
              disabled={busy}
              className="w-full sm:w-auto"
            >
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <UploadCloud className="h-5 w-5" aria-hidden />
              )}
              {busy
                ? `Publishing ${progress.done}/${progress.total}…`
                : `Publish ${drafts.length} photo${drafts.length > 1 ? "s" : ""}`}
            </Button>
          </div>
        )}
      </section>

      {/* Manage existing */}
      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-400">
              Current photos {photos.length > 0 && `(${photos.length})`}
            </h2>
            <p className="mt-1 text-xs text-navy-500">
              Drag the handle (or use the arrows) to reorder within a category.
            </p>
          </div>
          {orderDirty && (
            <Button type="button" onClick={saveOrder} disabled={savingOrder}>
              {savingOrder ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Save className="h-4 w-4" aria-hidden />
              )}
              {savingOrder ? "Saving…" : "Save order"}
            </Button>
          )}
        </div>

        {photos.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {galleryFilters.map((f) => {
              const active = manageFilter === f.id;
              const count = f.id === "all" ? photos.length : (counts[f.id] ?? 0);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setManageFilter(f.id)}
                  aria-pressed={active}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-accent-500 text-navy-950"
                      : "bg-white/5 text-navy-200 ring-1 ring-inset ring-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {f.label} <span className="opacity-70">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {photos.length === 0 ? (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-navy-400">
            No photos yet. Add some above and they'll appear on the gallery.
          </p>
        ) : shown.length === 0 ? (
          <p className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-navy-400">
            No photos in this category yet.
          </p>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {shown.map((p, i) => (
              <li
                key={p.id}
                {...drag.rowProps(i)}
                className="group relative overflow-hidden rounded-xl bg-navy-900 ring-1 ring-white/10 data-[drag-over=true]:ring-2 data-[drag-over=true]:ring-accent-500"
              >
                <img
                  src={p.url}
                  alt={p.alt}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="p-3">
                  <p className="truncate text-sm font-semibold text-white">
                    {p.title}
                  </p>
                  <p className="mt-0.5 text-xs text-navy-400">
                    {categoryLabel(p.category)}
                  </p>
                  {projectOf.has(p.id) && (
                    <p className="mt-1 truncate text-xs text-accent-400">
                      In project: {projectOf.get(p.id)!.title || "untitled"}
                    </p>
                  )}
                </div>

                <div className="absolute left-2 top-2 flex items-center gap-1 rounded-lg bg-navy-950/70 p-1 backdrop-blur">
                  <DragHandle {...drag.handleProps(i)} />
                  <ReorderButtons
                    items={shown}
                    index={i}
                    onReorder={reorderShown}
                    label={p.title}
                  />
                </div>

                <div className="absolute right-2 top-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditing(p)}
                    aria-label={`Edit ${p.title}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-950/70 text-white backdrop-blur transition-colors hover:bg-accent-500 hover:text-navy-950"
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    disabled={deletingId === p.id}
                    aria-label={`Delete ${p.title}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-950/70 text-white backdrop-blur transition-colors hover:bg-red-600 disabled:opacity-100"
                  >
                    {deletingId === p.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Trash2 className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editing && (
        <EditPhotoModal
          photo={editing}
          inProject={projectOf.get(editing.id)?.title}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setPhotos(photos.map((p) => (p.id === updated.id ? updated : p)));
            setEditing(null);
            onNotice("Photo updated.");
          }}
        />
      )}
    </>
  );
}

/** Modal for editing a photo's title / category / alt text (image unchanged). */
function EditPhotoModal({
  photo,
  inProject,
  onClose,
  onSaved,
}: {
  photo: ServerPhoto;
  /** Title of the project holding this photo, if any. */
  inProject?: string;
  onClose: () => void;
  onSaved: (photo: ServerPhoto) => void;
}) {
  const [title, setTitle] = useState(photo.title);
  const [category, setCategory] = useState<PhotoCategory>(photo.category);
  const [alt, setAlt] = useState(photo.alt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);

  // Keyboard dialog baseline, matching Lightbox: Esc closes, focus moves into
  // the dialog on open and is trapped inside it, and returns to the invoking
  // Edit button (the element focused when the modal mounted) on close. The modal
  // is mounted only while editing, so this runs once per open.
  useEffect(() => {
    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button, input, select, textarea, [href], [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => !el.hasAttribute("disabled"));

    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const els = focusables();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !dialog?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
    // Mount/unmount only — onClose is stable in behaviour across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await updatePhoto(photo.id, {
        title: title.trim(),
        category,
        alt: alt.trim(),
      });
      onSaved(updated);
    } catch (err) {
      setError((err as Error).message || "Could not save changes.");
      setSaving(false);
    }
  }

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Edit photo"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={save}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-navy-900">Edit photo</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-navy-400 transition-colors hover:bg-navy-100 hover:text-navy-700"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <img
          src={photo.url}
          alt={photo.alt}
          className="mb-5 aspect-[4/3] w-full rounded-lg object-cover"
        />

        <div className="space-y-3">
          <TextInput
            label="Title"
            id="edit-title"
            value={title}
            disabled={saving}
            onChange={(e) => setTitle(e.target.value)}
          />
          <SelectInput
            label="Category"
            id="edit-category"
            value={category}
            disabled={saving}
            onChange={(e) => setCategory(e.target.value as PhotoCategory)}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </SelectInput>
          <TextInput
            label="Alt text (optional)"
            id="edit-alt"
            placeholder="Describes the photo for accessibility"
            value={alt}
            disabled={saving}
            onChange={(e) => setAlt(e.target.value)}
          />
        </div>

        {inProject && (
          <p className="mt-3 rounded-lg bg-navy-50 px-3 py-2 text-xs text-navy-600">
            This photo is in the project <strong>{inProject}</strong>, so the
            gallery files it under <em>that project's</em> category. Changing the
            category here won't move it until you detach it.
          </p>
        )}

        {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

        <div className="mt-6 flex items-center gap-3">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Check className="h-4 w-4" aria-hidden />
            )}
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-navy-600 transition-colors hover:bg-navy-100 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
