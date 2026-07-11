import { useRef, useState, type ChangeEvent } from "react";
import { Loader2, Plus, Save, Trash2, Upload, User } from "lucide-react";
import type { TeamMember } from "../../data/about";
import { Button } from "../../components/Button";
import { resizeImage, saveContent, uploadImage } from "../../lib/adminApi";
import {
  DragHandle,
  ReorderButtons,
  useDragReorder,
  withKeys,
  stripKey,
  type Keyed,
} from "./reorder";

const BLANK: TeamMember = { name: "", description: "", alt: "" };

/** Team manager — edit the team cards shown on /about (photo, name, description). */
export function TeamPanel({
  team,
  onSaved,
  onError,
  onNotice,
}: {
  team: TeamMember[];
  onSaved: (team: TeamMember[]) => void;
  onError: (msg: string) => void;
  onNotice: (msg: string) => void;
}) {
  const [draft, setDraft] = useState<Keyed<TeamMember>[]>(() => withKeys(team));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const fileInputs = useRef<Record<number, HTMLInputElement | null>>({});
  const dirty = JSON.stringify(draft.map(stripKey)) !== JSON.stringify(team);
  const drag = useDragReorder(draft, setDraft);

  function patch(i: number, next: Partial<TeamMember>) {
    setDraft((prev) => prev.map((m, k) => (k === i ? { ...m, ...next } : m)));
  }

  async function pickPhoto(i: number, e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setUploading(i);
    onError("");
    try {
      // Portraits render at 4:5 — 1200px on the long edge is plenty.
      const { dataBase64, contentType } = await resizeImage(file, 1200);
      const url = await uploadImage({ dataBase64, contentType, prefix: "team" });
      patch(i, { photo: url });
      onNotice("Photo uploaded — remember to save.");
    } catch (err) {
      onError((err as Error).message || "Could not upload that photo.");
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    if (draft.some((m) => !m.name.trim())) {
      onError("Every team member needs a name.");
      return;
    }
    setSaving(true);
    onError("");
    try {
      const saved = await saveContent(
        "team",
        draft.map((m) => ({
          ...stripKey(m),
          alt: m.alt.trim() || `Portrait of ${m.name.trim()}`,
        })),
      );
      onSaved(saved);
      setDraft(withKeys(saved));
      onNotice("Team saved — it's live on the About page now.");
    } catch (err) {
      onError((err as Error).message || "Could not save the team.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-400">
            Team {draft.length > 0 && `(${draft.length})`}
          </h2>
          <p className="mt-1 text-xs text-navy-500">
            Shown on the About page. Portraits look best as a 4:5 portrait crop.
          </p>
        </div>
        <div className="flex gap-3">
          {draft.length === 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setDraft(withKeys(Array.from({ length: 4 }, () => ({ ...BLANK }))))
              }
            >
              Start with 4 cards
            </Button>
          )}
          <Button
            type="button"
            onClick={() => setDraft((p) => [...p, ...withKeys([{ ...BLANK }])])}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add member
          </Button>
        </div>
      </div>

      {draft.length === 0 ? (
        <p className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-navy-400">
          No team members yet. Until you add some, the About page shows four
          placeholder cards.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {draft.map((member, i) => (
            <li
              key={member._key}
              {...drag.rowProps(i)}
              className="flex gap-4 rounded-xl bg-white p-4 data-[drag-over=true]:ring-2 data-[drag-over=true]:ring-accent-500"
            >
              <div className="flex flex-col items-center gap-2 pt-1">
                {/* Reorder is locked while any upload is in flight: pickPhoto
                    captured this row's index and patches it after the await, so
                    a mid-upload reorder would write the photo onto another
                    member. */}
                <DragHandle
                  {...drag.handleProps(i)}
                  draggable={uploading === null}
                />
                <div className="[&_button]:bg-navy-100 [&_button]:text-navy-700 [&_button:hover]:bg-navy-200">
                  <ReorderButtons
                    items={draft}
                    index={i}
                    onReorder={setDraft}
                    label={member.name || `member ${i + 1}`}
                    disabled={uploading !== null}
                  />
                </div>
              </div>

              {/* Portrait */}
              <div className="shrink-0">
                <div className="aspect-[4/5] w-24 overflow-hidden rounded-lg bg-navy-100">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-navy-400">
                      <User className="h-8 w-8" strokeWidth={1.5} aria-hidden />
                    </div>
                  )}
                </div>
                <input
                  ref={(el) => {
                    fileInputs.current[i] = el;
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void pickPhoto(i, e)}
                />
                <button
                  type="button"
                  disabled={saving || uploading !== null}
                  onClick={() => fileInputs.current[i]?.click()}
                  className="mt-2 inline-flex w-24 items-center justify-center gap-1.5 rounded-lg bg-navy-100 px-2 py-1.5 text-xs font-semibold text-navy-700 transition-colors hover:bg-navy-200 disabled:opacity-50"
                >
                  {uploading === i ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Upload className="h-3.5 w-3.5" aria-hidden />
                  )}
                  {member.photo ? "Replace" : "Photo"}
                </button>
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <label
                    htmlFor={`team-name-${i}`}
                    className="mb-1.5 block text-sm font-semibold text-navy-800"
                  >
                    Name
                  </label>
                  <input
                    id={`team-name-${i}`}
                    value={member.name}
                    disabled={saving}
                    onChange={(e) => patch(i, { name: e.target.value })}
                    className="w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-navy-900 placeholder:text-navy-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                    placeholder="Anthony"
                  />
                </div>
                <div>
                  <label
                    htmlFor={`team-desc-${i}`}
                    className="mb-1.5 block text-sm font-semibold text-navy-800"
                  >
                    Description
                  </label>
                  <textarea
                    id={`team-desc-${i}`}
                    rows={2}
                    value={member.description}
                    disabled={saving}
                    onChange={(e) => patch(i, { description: e.target.value })}
                    className="w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-navy-900 placeholder:text-navy-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                    placeholder="Role — one or two lines on what they do."
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => setDraft((p) => p.filter((_, k) => k !== i))}
                aria-label={`Delete ${member.name || `member ${i + 1}`}`}
                className="self-start rounded-lg p-2 text-navy-400 transition-colors hover:bg-navy-100 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 className="h-5 w-5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex items-center gap-3">
        <Button type="button" size="lg" onClick={save} disabled={saving || !dirty}>
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <Save className="h-5 w-5" aria-hidden />
          )}
          {saving ? "Saving…" : "Save team"}
        </Button>
        {dirty && !saving && (
          <span className="text-sm text-navy-400">Unsaved changes</span>
        )}
      </div>
    </section>
  );
}
