import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import {
  galleryFilters,
  type PhotoCategory,
  type Project,
} from "../../data/gallery";
import { Button } from "../../components/Button";
import {
  prettifyName,
  resizeImage,
  saveContent,
  uploadPhoto,
  type ServerPhoto,
} from "../../lib/adminApi";
import { DragHandle, ReorderButtons, move, useDragReorder } from "./reorder";

const CATEGORY_OPTIONS = galleryFilters.filter((f) => f.id !== "all");

function newProjectId(): string {
  return `proj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Projects manager — create / edit / delete projects and attach photos to them.
 *
 * `photoIds` is the single source of truth for both membership and the order the
 * photos appear in the public lightbox. A photo belongs to at most one project:
 * attaching it here detaches it from any other project first.
 *
 * Two ways to fill a project (spec 08):
 * 1. Attach photos already uploaded in the Photos tab, one at a time.
 * 2. "Upload photos into this project" — pick several files at once; they
 *    upload, join this project, and the project is saved in one step.
 */
export function ProjectsPanel({
  projects,
  photos,
  onSaved,
  onPhotosUploaded,
  onError,
  onNotice,
}: {
  projects: Project[];
  photos: ServerPhoto[];
  onSaved: (projects: Project[]) => void;
  /** New photos created by a direct-into-project upload — parent adds them to its list. */
  onPhotosUploaded: (uploaded: ServerPhoto[]) => void;
  onError: (msg: string) => void;
  onNotice: (msg: string) => void;
}) {
  const [draft, setDraft] = useState<Project[]>(projects);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<{
    projectId: string;
    done: number;
    total: number;
  } | null>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(projects);
  const drag = useDragReorder(draft, setDraft);

  // Latest draft for the async upload flow — the operator can keep editing other
  // projects while files upload, and attaching against a stale closure would
  // silently wipe those edits. Synced in an effect (not during render) so a
  // discarded concurrent/strict-mode render can't leak into the ref.
  const draftRef = useRef<Project[]>(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  // One hidden file input shared by every project's "Upload photos" button.
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<string | null>(null);

  const photoById = new Map(photos.map((p) => [p.id, p]));
  const attachedElsewhere = (projectIndex: number) =>
    new Set(draft.flatMap((p, k) => (k === projectIndex ? [] : p.photoIds)));

  function patch(i: number, next: Partial<Project>) {
    setDraft((prev) => prev.map((p, k) => (k === i ? { ...p, ...next } : p)));
  }

  /** Attaching steals the photo from whichever project currently holds it. */
  function attach(projectIndex: number, photoId: string) {
    setDraft((prev) =>
      prev.map((p, k) =>
        k === projectIndex
          ? { ...p, photoIds: [...p.photoIds, photoId] }
          : { ...p, photoIds: p.photoIds.filter((id) => id !== photoId) },
      ),
    );
  }

  function pickFilesFor(projectId: string) {
    uploadTargetRef.current = projectId;
    fileInputRef.current?.click();
  }

  function onFilesPicked(e: ChangeEvent<HTMLInputElement>) {
    const projectId = uploadTargetRef.current;
    if (e.target.files && projectId) {
      void uploadInto(projectId, Array.from(e.target.files));
    }
    e.target.value = "";
  }

  /**
   * Uploads several files and puts them straight into one project: resize →
   * upload each → append their ids to the project's `photoIds` → save the
   * projects document. One action, live on the site at the end of it.
   */
  async function uploadInto(projectId: string, files: File[]) {
    const project = draftRef.current.find((p) => p.id === projectId);
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (!project || images.length === 0 || uploading) return;
    if (!project.title.trim()) {
      onError("Give this project a title before uploading photos into it.");
      return;
    }
    setUploading({ projectId, done: 0, total: images.length });
    onError("");
    onNotice("");

    const uploaded: ServerPhoto[] = [];
    let failed = 0;
    for (let i = 0; i < images.length; i++) {
      try {
        const { dataBase64, contentType } = await resizeImage(images[i]);
        uploaded.push(
          await uploadPhoto({
            dataBase64,
            contentType,
            title: prettifyName(images[i].name) || "Untitled",
            // Photos inherit the project's category so the gallery files the
            // tile and its photos under the same filter.
            category: project.category,
            alt: "",
          }),
        );
      } catch {
        failed++;
      }
      setUploading({ projectId, done: i + 1, total: images.length });
    }

    if (uploaded.length === 0) {
      setUploading(null);
      onError("Those photos couldn't be uploaded — please try again.");
      return;
    }
    onPhotosUploaded(uploaded);

    // Attach against the *latest* draft (the operator may have kept editing),
    // then save so the grouping is live immediately — not stuck as a dirty draft.
    const base = draftRef.current;
    if (!base.some((p) => p.id === projectId)) {
      // Project deleted mid-upload: the photos exist as loose gallery photos.
      setUploading(null);
      onError(
        "That project was deleted while the photos uploaded — they're in the gallery as individual photos.",
      );
      return;
    }
    const nextDraft = base.map((p) =>
      p.id === projectId
        ? { ...p, photoIds: [...p.photoIds, ...uploaded.map((u) => u.id)] }
        : p,
    );
    setDraft(nextDraft);
    try {
      const saved = await saveContent("projects", nextDraft);
      onSaved(saved);
      setDraft(saved);
      onNotice(
        failed > 0
          ? `${uploaded.length} of ${images.length} photos added to “${project.title}” — ${failed} failed, please try those again.`
          : `${uploaded.length} photo${uploaded.length > 1 ? "s" : ""} added to “${project.title}” — live on the site now.`,
      );
    } catch (err) {
      // Keep the actionable hint even when the server sent an error message —
      // the photos are up, only the grouping still needs a save.
      const detail = (err as Error).message;
      onError(
        `Photos uploaded, but the project didn't save — press “Save projects” to finish.${
          detail ? ` (${detail})` : ""
        }`,
      );
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    if (draft.some((p) => !p.title.trim())) {
      onError("Every project needs a title.");
      return;
    }
    setSaving(true);
    onError("");
    try {
      const saved = await saveContent("projects", draft);
      onSaved(saved);
      setDraft(saved);
      onNotice("Projects saved — they're live on the site now.");
    } catch (err) {
      onError((err as Error).message || "Could not save projects.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-400">
            Projects {draft.length > 0 && `(${draft.length})`}
          </h2>
          <p className="mt-1 text-xs text-navy-500">
            A project groups photos of one job into a single gallery tile. Photos
            in no project appear on their own.
          </p>
        </div>
        <Button
          type="button"
          onClick={() =>
            setDraft((p) => [
              ...p,
              {
                id: newProjectId(),
                title: "",
                category: CATEGORY_OPTIONS[0].id as PhotoCategory,
                photoIds: [],
              },
            ])
          }
        >
          <Plus className="h-4 w-4" aria-hidden />
          New project
        </Button>
      </div>

      {photos.length === 0 && (
        <p className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-6 text-center text-sm text-navy-400">
          Upload some photos first — projects are built by attaching photos.
        </p>
      )}

      {draft.length === 0 ? (
        <p className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-navy-400">
          No projects yet. Every photo shows as its own gallery tile until you
          group some.
        </p>
      ) : (
        <ul className="mt-6 space-y-5">
          {draft.map((project, i) => {
            const taken = attachedElsewhere(i);
            const available = photos.filter(
              (p) => !taken.has(p.id) && !project.photoIds.includes(p.id),
            );
            // Skip ids whose photo was deleted — no broken thumbnails.
            const members = project.photoIds
              .map((id) => photoById.get(id))
              .filter((p): p is ServerPhoto => p !== undefined);

            // Reorder over the *resolved* member order (`k` indexes `members`,
            // not `photoIds`). Rebuilding photoIds from the live members also
            // drops any dangling (deleted-photo) ids as a side effect — they'd
            // never render anyway.
            const moveMember = (from: number, to: number) =>
              move(members.map((m) => m.id), from, to);

            return (
              <li
                key={project.id}
                {...drag.rowProps(i)}
                className="rounded-xl bg-white p-4 data-[drag-over=true]:ring-2 data-[drag-over=true]:ring-accent-500"
              >
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <DragHandle {...drag.handleProps(i)} />
                    <div className="[&_button]:bg-navy-100 [&_button]:text-navy-700 [&_button:hover]:bg-navy-200">
                      <ReorderButtons
                        items={draft}
                        index={i}
                        onReorder={setDraft}
                        label={project.title || `project ${i + 1}`}
                      />
                    </div>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`proj-title-${project.id}`}
                          className="mb-1.5 block text-sm font-semibold text-navy-800"
                        >
                          Title
                        </label>
                        <input
                          id={`proj-title-${project.id}`}
                          value={project.title}
                          disabled={saving}
                          onChange={(e) => patch(i, { title: e.target.value })}
                          className="w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-navy-900 placeholder:text-navy-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                          placeholder="Dark Ensuite Renovation"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`proj-cat-${project.id}`}
                          className="mb-1.5 block text-sm font-semibold text-navy-800"
                        >
                          Category
                        </label>
                        <select
                          id={`proj-cat-${project.id}`}
                          value={project.category}
                          disabled={saving}
                          onChange={(e) =>
                            patch(i, { category: e.target.value as PhotoCategory })
                          }
                          className="w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-navy-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                        >
                          {CATEGORY_OPTIONS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Attached photos — drag to reorder within the project */}
                    <div>
                      <p className="mb-1.5 text-sm font-semibold text-navy-800">
                        Photos ({members.length})
                        {members.length > 0 && (
                          <span className="ml-2 font-normal text-navy-500">
                            first is the tile cover
                          </span>
                        )}
                      </p>
                      {members.length === 0 ? (
                        <p className="rounded-lg bg-navy-50 px-3 py-4 text-center text-xs text-navy-500">
                          No photos attached yet.
                        </p>
                      ) : (
                        <ul className="flex flex-wrap gap-2">
                          {members.map((photo, k) => (
                            <li key={photo.id} className="relative">
                              <img
                                src={photo.url}
                                alt={photo.alt}
                                className="h-20 w-20 rounded-lg object-cover ring-1 ring-navy-200"
                              />
                              {k === 0 && (
                                <span className="absolute left-1 top-1 rounded bg-accent-500 px-1.5 py-0.5 text-[10px] font-bold text-navy-950">
                                  COVER
                                </span>
                              )}
                              <button
                                type="button"
                                disabled={saving}
                                aria-label={`Remove ${photo.title} from ${project.title || "project"}`}
                                onClick={() =>
                                  patch(i, {
                                    photoIds: project.photoIds.filter(
                                      (id) => id !== photo.id,
                                    ),
                                  })
                                }
                                className="absolute -right-1.5 -top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-navy-900 text-white transition-colors hover:bg-red-600"
                              >
                                <X className="h-3.5 w-3.5" aria-hidden />
                              </button>
                              <div className="mt-1 flex justify-center gap-1">
                                <button
                                  type="button"
                                  disabled={saving || k === 0}
                                  aria-label={`Move ${photo.title} earlier`}
                                  onClick={() =>
                                    patch(i, { photoIds: moveMember(k, k - 1) })
                                  }
                                  className="rounded bg-navy-100 px-1.5 text-xs font-bold text-navy-700 hover:bg-navy-200 disabled:opacity-30"
                                >
                                  ←
                                </button>
                                <button
                                  type="button"
                                  disabled={saving || k === members.length - 1}
                                  aria-label={`Move ${photo.title} later`}
                                  onClick={() =>
                                    patch(i, { photoIds: moveMember(k, k + 1) })
                                  }
                                  className="rounded bg-navy-100 px-1.5 text-xs font-bold text-navy-700 hover:bg-navy-200 disabled:opacity-30"
                                >
                                  →
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Fill the project: attach an existing photo, or upload
                        new ones straight into it (spec 08). */}
                    <div className="flex flex-wrap items-end gap-3">
                      {available.length > 0 && (
                        <div>
                          <label
                            htmlFor={`proj-add-${project.id}`}
                            className="mb-1.5 block text-sm font-semibold text-navy-800"
                          >
                            Attach a photo
                          </label>
                          <select
                            id={`proj-add-${project.id}`}
                            value=""
                            disabled={saving || uploading !== null}
                            onChange={(e) => {
                              if (e.target.value) attach(i, e.target.value);
                            }}
                            className="w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-navy-900 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30 sm:w-auto sm:min-w-52"
                          >
                            <option value="">Choose a photo…</option>
                            {available.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <button
                        type="button"
                        disabled={saving || uploading !== null}
                        onClick={() => pickFilesFor(project.id)}
                        className="inline-flex items-center gap-2 rounded-lg border border-navy-300 bg-navy-50 px-4 py-2.5 text-sm font-semibold text-navy-800 transition-colors hover:bg-navy-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {uploading?.projectId === project.id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                            Uploading {uploading.done}/{uploading.total}…
                          </>
                        ) : (
                          <>
                            <ImagePlus className="h-4 w-4" aria-hidden />
                            Upload photos into this project
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setDraft((p) => p.filter((_, k) => k !== i))}
                    aria-label={`Delete project ${project.title || i + 1}`}
                    className="self-start rounded-lg p-2 text-navy-400 transition-colors hover:bg-navy-100 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-5 w-5" aria-hidden />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Shared picker for every project's "Upload photos into this project". */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onFilesPicked}
      />

      <div className="mt-6 flex items-center gap-3">
        <Button
          type="button"
          size="lg"
          onClick={save}
          disabled={saving || uploading !== null || !dirty}
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <Save className="h-5 w-5" aria-hidden />
          )}
          {saving ? "Saving…" : "Save projects"}
        </Button>
        {dirty && !saving && (
          <span className="text-sm text-navy-400">Unsaved changes</span>
        )}
      </div>
    </section>
  );
}
