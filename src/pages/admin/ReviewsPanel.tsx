import { useState } from "react";
import { Loader2, Plus, Save, Star, Trash2 } from "lucide-react";
import type { Review } from "../../data/reviews";
import { Button } from "../../components/Button";
import { saveContent } from "../../lib/adminApi";
import {
  DragHandle,
  ReorderButtons,
  useDragReorder,
  withKeys,
  stripKey,
  type Keyed,
} from "./reorder";

const BLANK: Review = { name: "", rating: 5, quote: "" };

/**
 * Reviews manager — add / edit / delete / reorder the manual reviews.
 * Both public placements read this one ordered list: the homepage shows the
 * first four, the Book a Quote page the first three.
 */
export function ReviewsPanel({
  reviews,
  onSaved,
  onError,
  onNotice,
}: {
  reviews: Review[];
  onSaved: (reviews: Review[]) => void;
  onError: (msg: string) => void;
  onNotice: (msg: string) => void;
}) {
  const [draft, setDraft] = useState<Keyed<Review>[]>(() => withKeys(reviews));
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(draft.map(stripKey)) !== JSON.stringify(reviews);
  const drag = useDragReorder(draft, setDraft);

  function patch(i: number, next: Partial<Review>) {
    setDraft((prev) => prev.map((r, k) => (k === i ? { ...r, ...next } : r)));
  }

  async function save() {
    if (draft.some((r) => !r.name.trim() || !r.quote.trim())) {
      onError("Every review needs a name and a quote.");
      return;
    }
    setSaving(true);
    onError("");
    try {
      const saved = await saveContent("reviews", draft.map(stripKey));
      onSaved(saved);
      setDraft(withKeys(saved));
      onNotice("Reviews saved — they're live on the site now.");
    } catch (err) {
      onError((err as Error).message || "Could not save reviews.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-400">
            Reviews {draft.length > 0 && `(${draft.length})`}
          </h2>
          <p className="mt-1 text-xs text-navy-500">
            Order matters — the homepage shows the first 4, Book a Quote the first 3.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setDraft((p) => [...p, ...withKeys([{ ...BLANK }])])}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Add review
        </Button>
      </div>

      {draft.length === 0 ? (
        <p className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-navy-400">
          No reviews yet. Add one — until then the site shows placeholder reviews.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {draft.map((review, i) => (
            <li
              key={review._key}
              {...drag.rowProps(i)}
              className="flex gap-4 rounded-xl bg-white p-4 data-[drag-over=true]:ring-2 data-[drag-over=true]:ring-accent-500"
            >
              <div className="flex flex-col items-center gap-2 pt-1">
                <DragHandle {...drag.handleProps(i)} />
                <div className="[&_button]:bg-navy-100 [&_button]:text-navy-700 [&_button:hover]:bg-navy-200">
                  <ReorderButtons
                    items={draft}
                    index={i}
                    onReorder={setDraft}
                    label={review.name || `review ${i + 1}`}
                  />
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div>
                    <label
                      htmlFor={`rev-name-${i}`}
                      className="mb-1.5 block text-sm font-semibold text-navy-800"
                    >
                      First name
                    </label>
                    <input
                      id={`rev-name-${i}`}
                      value={review.name}
                      disabled={saving}
                      onChange={(e) => patch(i, { name: e.target.value })}
                      className="w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-navy-900 placeholder:text-navy-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                      placeholder="Sarah"
                    />
                  </div>

                  <fieldset>
                    <legend className="mb-1.5 block text-sm font-semibold text-navy-800">
                      Rating
                    </legend>
                    <div className="flex gap-1 pt-1.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          disabled={saving}
                          onClick={() => patch(i, { rating: n })}
                          aria-label={`${n} star${n > 1 ? "s" : ""}`}
                          aria-pressed={review.rating === n}
                        >
                          <Star
                            className={`h-6 w-6 ${
                              n <= review.rating
                                ? "fill-accent-500 text-accent-500"
                                : "fill-navy-200 text-navy-200"
                            }`}
                            aria-hidden
                          />
                        </button>
                      ))}
                    </div>
                  </fieldset>
                </div>

                <div>
                  <label
                    htmlFor={`rev-quote-${i}`}
                    className="mb-1.5 block text-sm font-semibold text-navy-800"
                  >
                    Quote
                  </label>
                  <textarea
                    id={`rev-quote-${i}`}
                    rows={3}
                    value={review.quote}
                    disabled={saving}
                    onChange={(e) => patch(i, { quote: e.target.value })}
                    className="w-full rounded-lg border border-navy-200 bg-white px-4 py-2.5 text-navy-900 placeholder:text-navy-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
                    placeholder="What the client said…"
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={() => setDraft((p) => p.filter((_, k) => k !== i))}
                aria-label={`Delete review ${i + 1}`}
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
          {saving ? "Saving…" : "Save reviews"}
        </Button>
        {dirty && !saving && (
          <span className="text-sm text-navy-400">Unsaved changes</span>
        )}
      </div>
    </section>
  );
}
