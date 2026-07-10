import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Lock,
  LogOut,
  MessageSquareQuote,
  Users,
  Wrench,
} from "lucide-react";
import { Button } from "../components/Button";
import { usePageMeta } from "../hooks/usePageMeta";
import {
  checkSession,
  getContent,
  listPhotos,
  login,
  logout,
  type ServerPhoto,
  type SiteContent,
} from "../lib/adminApi";
import { PhotosPanel } from "./admin/PhotosPanel";
import { ProjectsPanel } from "./admin/ProjectsPanel";
import { ReviewsPanel } from "./admin/ReviewsPanel";
import { TeamPanel } from "./admin/TeamPanel";

type Auth = "checking" | "locked" | "unlocked";

const TABS = [
  { id: "photos", label: "Photos", icon: ImageIcon },
  { id: "projects", label: "Projects", icon: Wrench },
  { id: "reviews", label: "Reviews", icon: MessageSquareQuote },
  { id: "team", label: "Team", icon: Users },
] as const;

type Tab = (typeof TABS)[number]["id"];

const EMPTY_CONTENT: SiteContent = { reviews: [], team: [], projects: [] };

/**
 * Admin shell: password gate, then four managers over the site's editable
 * content. Photos and content are loaded once here and shared with the panels so
 * the Projects manager can see the photo list it attaches from.
 */
export default function AdminPage() {
  usePageMeta("Admin · ADN Builders");

  const [auth, setAuth] = useState<Auth>("checking");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<Tab>("photos");
  const [photos, setPhotos] = useState<ServerPhoto[]>([]);
  const [content, setContent] = useState<SiteContent>(EMPTY_CONTENT);
  // Starts true so the panels never mount against empty content and snapshot it
  // into their drafts.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

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

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      // `fresh` bypasses the edge cache so the admin always shows true state.
      const [nextPhotos, nextContent] = await Promise.all([
        listPhotos(true),
        getContent(true),
      ]);
      setPhotos(nextPhotos);
      setContent(nextContent);
    } catch {
      /* leave whatever we have */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void checkSession().then((ok) => {
      if (!active) return;
      setAuth(ok ? "unlocked" : "locked");
      if (ok) void loadAll();
    });
    return () => {
      active = false;
    };
  }, [loadAll]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);
    try {
      await login(password);
      setPassword("");
      setAuth("unlocked");
      void loadAll();
    } catch (err) {
      setLoginError((err as Error).message || "Login failed");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await logout().catch(() => {});
    setPhotos([]);
    setContent(EMPTY_CONTENT);
    setAuth("locked");
  }

  // Banners are transient — clear them whenever the operator switches context.
  function switchTab(next: Tab) {
    setTab(next);
    setError("");
    setNotice("");
  }

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
              <h1 className="text-lg font-bold text-navy-900">Site admin</h1>
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
              <p className="mt-1 text-xs font-medium text-red-600">{loginError}</p>
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

  return (
    <div className="min-h-screen bg-navy-950 text-navy-100">
      <header className="border-b border-white/10 bg-navy-950/80 backdrop-blur">
        <div className="mx-auto w-full max-w-5xl px-5 sm:px-6">
          <div className="flex items-center justify-between gap-4 py-4">
            <h1 className="text-base font-bold text-white sm:text-lg">Site admin</h1>
            <div className="flex items-center gap-4">
              <Link
                to="/gallery"
                className="text-sm font-medium text-navy-300 transition-colors hover:text-white"
              >
                View site
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

          {/* Tabs */}
          <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Admin sections">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => switchTab(t.id)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    active
                      ? "border-accent-500 text-white"
                      : "border-transparent text-navy-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-6 sm:py-10">
        {error && (
          <p
            role="alert"
            className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300"
          >
            {error}
          </p>
        )}
        {notice && (
          <p
            role="status"
            className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-300"
          >
            {notice}
          </p>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-navy-400">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Loading…
          </div>
        ) : (
          // All four panels stay mounted and are hidden rather than unmounted:
          // each owns a local draft, and unmounting would silently throw away
          // unsaved edits the moment the operator clicked another tab.
          <>
            <div hidden={tab !== "photos"}>
              <PhotosPanel
                photos={photos}
                projects={content.projects}
                setPhotos={setPhotos}
                onError={setError}
                onNotice={setNotice}
              />
            </div>
            <div hidden={tab !== "projects"}>
              <ProjectsPanel
                projects={content.projects}
                photos={photos}
                onSaved={(projects) => setContent((c) => ({ ...c, projects }))}
                onError={setError}
                onNotice={setNotice}
              />
            </div>
            <div hidden={tab !== "reviews"}>
              <ReviewsPanel
                reviews={content.reviews}
                onSaved={(reviews) => setContent((c) => ({ ...c, reviews }))}
                onError={setError}
                onNotice={setNotice}
              />
            </div>
            <div hidden={tab !== "team"}>
              <TeamPanel
                team={content.team}
                onSaved={(team) => setContent((c) => ({ ...c, team }))}
                onError={setError}
                onNotice={setNotice}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
