import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Lock,
  LogOut,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { galleryFilters } from "../data/gallery";
import { Button } from "../components/Button";
import { TextInput, SelectInput } from "../components/FormInputs";
import { usePageMeta } from "../hooks/usePageMeta";
import {
  checkSession,
  deletePhoto,
  listPhotos,
  login,
  logout,
  resizeImage,
  uploadPhoto,
  type PhotoCategory,
  type ServerPhoto,
} from "../lib/adminApi";

const CATEGORY_OPTIONS = galleryFilters
  .filter((f) => f.id !== "all")
  .map((f) => ({ id: f.id as PhotoCategory, label: f.label }));

const DEFAULT_CATEGORY: PhotoCategory = CATEGORY_OPTIONS[0].id;

function categoryLabel(id: string): string {
  return galleryFilters.find((f) => f.id === id)?.label ?? id;
}

/** "kitchen-reno_final.jpg" -> "kitchen reno final" */
function prettifyName(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

interface Draft {
  key: string;
  file: File;
  preview: string;
  title: string;
  category: PhotoCategory;
  alt: string;
}

type Auth = "checking" | "locked" | "unlocked";

export default function AdminPage() {
  usePageMeta("Admin · ADN Builders");

  const [auth, setAuth] = useState<Auth>("checking");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [existing, setExisting] = useState<ServerPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const draftsRef = useRef<Draft[]>([]);
  draftsRef.current = drafts;

  // Keep this page out of search results.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  // Revoke any outstanding object URLs when the page unmounts.
  useEffect(
    () => () => {
      draftsRef.current.forEach((d) => URL.revokeObjectURL(d.preview));
    },
    [],
  );

  const loadPhotos = useCallback(async () => {
    setLoadingPhotos(true);
    try {
      setExisting(await listPhotos());
    } catch {
      /* leave the list as-is */
    } finally {
      setLoadingPhotos(false);
    }
  }, []);

  // On first load, see whether we're already unlocked from a previous session.
  useEffect(() => {
    let active = true;
    checkSession().then((ok) => {
      if (!active) return;
      setAuth(ok ? "unlocked" : "locked");
      if (ok) void loadPhotos();
    });
    return () => {
      active = false;
    };
  }, [loadPhotos]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    try {
      await login(password);
      setPassword("");
      setAuth("unlocked");
      void loadPhotos();
    } catch (err) {
      setLoginError((err as Error).message || "Login failed");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await logout().catch(() => {});
    drafts.forEach((d) => URL.revokeObjectURL(d.preview));
    setDrafts([]);
    setExisting([]);
    setAuth("locked");
  }

  const addFiles = useCallback((files: FileList | File[]) => {
    const images = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (images.length === 0) return;
    setNotice("");
    setError("");
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
    e.target.value = ""; // allow re-selecting the same file
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  }

  function updateDraft(key: string, patch: Partial<Draft>) {
    setDrafts((prev) =>
      prev.map((d) => (d.key === key ? { ...d, ...patch } : d)),
    );
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
    setError("");
    setNotice("");
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

    setExisting((prev) => [...uploaded, ...prev]);
    setDrafts(failed);
    setBusy(false);
    if (failed.length > 0) {
      setError(
        `${failed.length} photo${failed.length > 1 ? "s" : ""} couldn't be uploaded — please try again.`,
      );
    } else {
      setNotice(
        `${uploaded.length} photo${uploaded.length > 1 ? "s" : ""} published — they're live on the site now.`,
      );
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this photo? This can't be undone.")) return;
    setDeletingId(id);
    setError("");
    try {
      await deletePhoto(id);
      setExisting((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError((err as Error).message || "Could not delete that photo.");
    } finally {
      setDeletingId(null);
    }
  }

  // ---- Checking / locked screens ------------------------------------------
  if (auth === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-950 text-navy-300">
        <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (auth === "locked") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-950 px-5">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/10 text-accent-600">
              <Lock className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h1 className="text-lg font-bold text-navy-900">Portfolio admin</h1>
              <p className="text-sm text-navy-500">Enter the password to continue</p>
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-semibold text-navy-800"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={loginError ? true : undefined}
                className="w-full rounded-lg border border-navy-200 bg-white py-3 pl-4 pr-11 text-navy-900 placeholder:text-navy-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30 aria-[invalid=true]:border-red-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-navy-400 transition-colors hover:text-navy-700"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" aria-hidden />
                ) : (
                  <Eye className="h-5 w-5" aria-hidden />
                )}
              </button>
            </div>
            {loginError && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {loginError}
              </p>
            )}
          </div>

          <Button type="submit" className="mt-6 w-full" disabled={loggingIn}>
            {loggingIn ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Lock className="h-4 w-4" aria-hidden />
            )}
            {loggingIn ? "Checking…" : "Unlock"}
          </Button>

          <Link
            to="/"
            className="mt-6 block text-center text-sm font-medium text-navy-500 hover:text-navy-800"
          >
            ← Back to site
          </Link>
        </form>
      </div>
    );
  }

  // ---- Unlocked admin ------------------------------------------------------
  return (
    <div className="min-h-screen bg-navy-950 text-navy-100">
      <header className="border-b border-white/10 bg-navy-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <h1 className="text-base font-bold text-white sm:text-lg">
            Portfolio admin
          </h1>
          <div className="flex items-center gap-4">
            <Link
              to="/gallery"
              className="text-sm font-medium text-navy-300 transition-colors hover:text-white"
            >
              View gallery
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-300 transition-colors hover:text-white"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-6 sm:py-10">
        {/* Status banners */}
        {error && (
          <p
            role="alert"
            className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300"
          >
            {error}
          </p>
        )}
        {notice && (
          <p className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300">
            {notice}
          </p>
        )}

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

          {/* Drafts awaiting publish */}
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
                      onChange={(e) =>
                        updateDraft(d.key, { title: e.target.value })
                      }
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
                        onChange={(e) =>
                          updateDraft(d.key, { alt: e.target.value })
                        }
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
          <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-400">
            Current photos {existing.length > 0 && `(${existing.length})`}
          </h2>

          {loadingPhotos ? (
            <div className="mt-6 flex items-center gap-2 text-navy-400">
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Loading…
            </div>
          ) : existing.length === 0 ? (
            <p className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-navy-400">
              No photos yet. Add some above and they'll appear on the gallery.
            </p>
          ) : (
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {existing.map((p) => (
                <div
                  key={p.id}
                  className="group relative overflow-hidden rounded-xl bg-navy-900 ring-1 ring-white/10"
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
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    disabled={deletingId === p.id}
                    aria-label={`Delete ${p.title}`}
                    className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-950/70 text-white opacity-0 backdrop-blur transition-opacity hover:bg-red-600 focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-100"
                  >
                    {deletingId === p.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Trash2 className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
