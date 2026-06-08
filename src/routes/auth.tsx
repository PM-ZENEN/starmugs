import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Anmelden — Sternbecher" },
      { name: "description", content: "Melde dich an oder erstelle ein Konto bei Sternbecher. Mit Zwei-Faktor-Authentifizierung." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "signup";
type Stage = "credentials" | "mfa-challenge";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [stage, setStage] = useState<Stage>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [otp, setOtp] = useState("");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Already signed in & no MFA needed → go to /account
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === aal?.nextLevel) navigate({ to: "/account" });
    });
  }, [navigate]);

  async function afterLogin() {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal && aal.nextLevel === "aal2" && aal.currentLevel === "aal1") {
      // user has a verified TOTP factor — challenge them
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const totp = factors?.totp?.[0];
      if (totp) {
        const ch = await supabase.auth.mfa.challenge({ factorId: totp.id });
        if (ch.error) { setError(ch.error.message); return; }
        setFactorId(totp.id);
        setChallengeId(ch.data.id);
        setStage("mfa-challenge");
        return;
      }
    }
    navigate({ to: "/account" });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/auth", data: { display_name: displayName } },
        });
        if (error) throw error;
        await afterLogin();
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await afterLogin();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError("");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (result.error) setError(result.error.message ?? "Google Login fehlgeschlagen");
    if (result.redirected) return;
    await afterLogin();
  }

  async function onVerifyMfa(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId || !challengeId) return;
    setLoading(true); setError("");
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code: otp });
    setLoading(false);
    if (error) { setError(error.message); return; }
    navigate({ to: "/account" });
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] flex items-center justify-center px-4 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 -left-20 w-[30rem] h-[30rem] rounded-full opacity-40 float-slow"
          style={{ background: "radial-gradient(circle, #ffb4d1, transparent 60%)" }} />
        <div className="absolute bottom-0 -right-20 w-[30rem] h-[30rem] rounded-full opacity-30 float-slow"
          style={{ background: "radial-gradient(circle, #b4d4ff, transparent 60%)", animationDelay: "-3s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md rounded-3xl glass p-8"
      >
        <Link to="/" className="text-sm text-[#06c] hover:underline">‹ Zurück</Link>

        <AnimatePresence mode="wait">
          {stage === "credentials" ? (
            <motion.div key="creds" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">
                {mode === "login" ? "Willkommen zurück." : "Konto erstellen."}
              </h1>
              <p className="mt-2 text-sm text-[#6e6e73]">
                {mode === "login" ? "Melde dich bei Sternbecher an." : "In wenigen Sekunden startklar."}
              </p>

              <button
                onClick={onGoogle}
                className="mt-6 w-full h-11 rounded-full bg-white/80 backdrop-blur border border-black/10 hover:bg-white transition flex items-center justify-center gap-3 text-sm font-medium"
              >
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83Z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"/></svg>
                Mit Google fortfahren
              </button>

              <div className="my-5 flex items-center gap-3 text-xs text-[#86868b]">
                <div className="flex-1 h-px bg-black/10" /> ODER <div className="flex-1 h-px bg-black/10" />
              </div>

              <form onSubmit={onSubmit} className="space-y-3">
                {mode === "signup" && (
                  <input
                    type="text" required value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Name" maxLength={80}
                    className="w-full h-11 px-4 rounded-2xl bg-white/70 border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#06c]/40"
                  />
                )}
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-Mail" maxLength={255}
                  className="w-full h-11 px-4 rounded-2xl bg-white/70 border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#06c]/40"
                />
                <input
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Passwort" minLength={8} maxLength={128}
                  className="w-full h-11 px-4 rounded-2xl bg-white/70 border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#06c]/40"
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                  type="submit" disabled={loading}
                  className="w-full h-11 rounded-full bg-[#06c] text-white font-medium hover:bg-[#0077ed] transition disabled:opacity-50"
                >
                  {loading ? "..." : mode === "login" ? "Anmelden" : "Registrieren"}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-[#6e6e73]">
                {mode === "login" ? "Noch kein Konto?" : "Bereits registriert?"}{" "}
                <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }} className="text-[#06c] hover:underline font-medium">
                  {mode === "login" ? "Konto erstellen" : "Anmelden"}
                </button>
              </p>
            </motion.div>
          ) : (
            <motion.form key="mfa" onSubmit={onVerifyMfa} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight">Zwei-Faktor-Code</h1>
              <p className="mt-2 text-sm text-[#6e6e73]">Öffne deine Authenticator-App und gib den 6-stelligen Code ein.</p>
              <input
                value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric" pattern="\d{6}" required autoFocus placeholder="123 456"
                className="mt-6 w-full h-14 px-4 rounded-2xl bg-white/70 border border-black/10 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-[#06c]/40"
              />
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              <button type="submit" disabled={loading || otp.length !== 6}
                className="mt-5 w-full h-11 rounded-full bg-[#06c] text-white font-medium hover:bg-[#0077ed] transition disabled:opacity-50">
                {loading ? "Prüfe..." : "Bestätigen"}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
