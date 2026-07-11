import { useRef, useState, type DragEvent, type HTMLAttributes } from "react";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";

/*
 * Reorder primitives shared by the admin panels.
 *
 * Native HTML5 drag-and-drop — spec 05 forbids adding dependencies without
 * flagging, and a drag library isn't worth one. Drag alone is inaccessible, so
 * every reorderable list also gets keyboard-operable up/down buttons.
 *
 * These live under pages/admin/ because they're internals of the admin page, not
 * shared site components (spec 05 authorises no new shared components).
 */

/** Immutably moves `from` → `to`. */
export function move<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length)
    return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Reapplies a reordering of a filtered subset back onto the full list, keeping
 * the slots the subset occupied. Lets the admin drag within one category while
 * still persisting a single deterministic global order.
 */
export function reorderSubset<T extends { id: string }>(
  all: T[],
  reorderedSubset: T[],
): T[] {
  const subsetIds = new Set(reorderedSubset.map((x) => x.id));
  const next = [...all];
  let k = 0;
  for (let i = 0; i < next.length; i++) {
    if (subsetIds.has(next[i].id)) next[i] = reorderedSubset[k++];
  }
  return next;
}

/**
 * Stable, client-only row keys for the editable content lists (reviews, team).
 *
 * Those docs have no persistent id — the server stores them positionally and
 * strips unknown fields on save (see api/content.ts) — so an id can't survive a
 * save round-trip. React still needs a key that *follows each row through a
 * reorder*: keyed by array index, React reuses DOM nodes by slot, so a focused
 * ReorderButton stays on the slot rather than the row after a move, stranding
 * keyboard users on the wrong item. These keys live only in this browser
 * session; they are never sent to, or read back from, the server.
 */
export type Keyed<T> = T & { _key: string };

let keySeq = 0;

/** Wraps each item with a fresh, stable, client-only key. */
export function withKeys<T>(items: T[]): Keyed<T>[] {
  return items.map((item) => ({ ...item, _key: `row-${(keySeq += 1)}` }));
}

/** Drops the client-only key back off, for persistence or dirty-comparison. */
export function stripKey<T>(item: Keyed<T>): T {
  const bare = { ...item } as Partial<Keyed<T>>;
  delete bare._key;
  return bare as T;
}

/**
 * Drag state + handlers for one reorderable list.
 *
 * `draggable` goes on the *handle*, not the row: a draggable ancestor swallows
 * text selection inside the row's inputs, which these rows are full of. The row
 * is only the drop target.
 */
export function useDragReorder<T>(
  items: T[],
  onReorder: (next: T[]) => void,
) {
  const dragFrom = useRef<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  return {
    overIndex,
    /** Spread onto the row (drop target). */
    rowProps(index: number) {
      return {
        onDragOver: (e: DragEvent) => {
          if (dragFrom.current === null) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          if (overIndex !== index) setOverIndex(index);
        },
        onDrop: (e: DragEvent) => {
          e.preventDefault();
          const from = dragFrom.current;
          dragFrom.current = null;
          setOverIndex(null);
          if (from !== null && from !== index) onReorder(move(items, from, index));
        },
        "data-drag-over": overIndex === index ? "true" : undefined,
      };
    },
    /** Spread onto the drag handle. */
    handleProps(index: number) {
      return {
        draggable: true,
        onDragStart: (e: DragEvent) => {
          dragFrom.current = index;
          e.dataTransfer.effectAllowed = "move";
          // Firefox never starts a drag unless some data is set.
          e.dataTransfer.setData("text/plain", String(index));
        },
        onDragEnd: () => {
          dragFrom.current = null;
          setOverIndex(null);
        },
      };
    },
  };
}

/** Keyboard-accessible equivalent of dragging one row up or down. */
export function ReorderButtons<T>({
  items,
  index,
  onReorder,
  label,
  disabled = false,
}: {
  items: T[];
  index: number;
  onReorder: (next: T[]) => void;
  label: string;
  /** Force both buttons off (e.g. while an upload for this row is in flight). */
  disabled?: boolean;
}) {
  const upRef = useRef<HTMLButtonElement>(null);
  const downRef = useRef<HTMLButtonElement>(null);
  const atTop = index === 0;
  const atBottom = index === items.length - 1;

  const btn =
    "inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/10 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30";

  // When a move lands the row at a boundary, the button just clicked becomes
  // disabled and the browser drops focus to <body>. Hand focus to the sibling
  // (still enabled) *before* the reorder so keyboard users keep their place.
  function moveUp() {
    if (index - 1 === 0) downRef.current?.focus();
    onReorder(move(items, index, index - 1));
  }
  function moveDown() {
    if (index + 1 === items.length - 1) upRef.current?.focus();
    onReorder(move(items, index, index + 1));
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        ref={upRef}
        type="button"
        className={btn}
        disabled={disabled || atTop}
        aria-label={`Move ${label} up`}
        onClick={moveUp}
      >
        <ChevronUp className="h-4 w-4" aria-hidden />
      </button>
      <button
        ref={downRef}
        type="button"
        className={btn}
        disabled={disabled || atBottom}
        aria-label={`Move ${label} down`}
        onClick={moveDown}
      >
        <ChevronDown className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

/** The grab target. Spread `handleProps(i)` onto it. */
export function DragHandle(
  props: HTMLAttributes<HTMLSpanElement> & { draggable?: boolean },
) {
  return (
    <span
      {...props}
      className="cursor-grab text-navy-500 active:cursor-grabbing"
      aria-hidden
      title="Drag to reorder"
    >
      <GripVertical className="h-5 w-5" />
    </span>
  );
}
