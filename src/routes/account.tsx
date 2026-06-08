import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Konto — Sternbecher" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [factors, setFactors] = useState<{ id: string; status: string; friendly_name?: string }[]>([]);

  // Enrollment
  const [enrolling, setEnrolling] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [enrollFactorId, setEnrollFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate({ to: "/auth" }); return; }
    setEmail(session.user.email ?? "");
    const { data: list } = await supabase.auth.mfa.listFactors();
    setFactors((list?.totp ?? []).map((f) => ({ id: f.id, status: f.status, friendly_name: f.friendly_name })));
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
    setIsAdmin((roles ?? []).some((r) => r.role === "admin"));
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  async function startEnroll() {
    setError("");
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Authenticator " + Date.now() });
    if (error) { setError(error.message); return; }
    setEnrollFactorId(data.id);
    setQr(data.totp.qr_code);
    setSecret(data.totp.secret);
    setEnrolling(true);
  }

  async function confirmEnroll(e: React.FormEvent) {
    e.preventDefault();
    if (!enrollFactorId) return;
    setError("");
    const ch = await supabase.auth.mfa.challenge({ factorId: enrollFactorId });
    if (ch.error) { setError(ch.error.message); return; }
    const ver = await supabase.auth.mfa.verify({ factorId: enrollFactorId, challengeId: ch.data.id, code });
    if (ver.error) { setError(ver.error.message); return; }
    setEnrolling(false); setQr(null); setSecret(null); setCode(""); setEnrollFactorId(null);
    await refresh();
  }

  async function removeFactor(id: string) {
    await supabase.auth.mfa.unenroll({ factorId: id });
    await refresh();
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#86868b]">Lade…</div>;

  const verified = factors.filter((f) => f.status === "verified");

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] px-4 py-10 relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/3 w-[30rem] h-[30rem] rounded-full opacity-30 float-slow"
          style={{ background: "radial-gradient(circle, #b4d4ff, transparent 60%)" }} />
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-sm text-[#06c] hover:underline">‹ Zur Startseite</Link>
          <button onClick={signOut} className="text-sm text-[#86868b] hover:text-black">Abmelden</button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="rounded-3xl glass p-8">
          <h1 className="text-3xl font-semibold tracking-tight">Hallo 👋</h1>
          <p className="mt-1 text-[#6e6e73]">{email}</p>
          {isAdmin && (
            <Link to="/admin" className="inline-block mt-4 px-4 py-2 rounded-full bg-black text-white text-sm hover:bg-black/80 transition">
              Admin-Bereich öffnen →
            </Link>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 rounded-3xl glass p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Zwei-Faktor-Authentifizierung</h2>
              <p className="text-sm text-[#6e6e73] mt-1">Schützt dein Konto mit einer Authenticator-App.</p>
            </div>
            {verified.length > 0 ? (
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">Aktiv</span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-white/70 text-[#86868b] text-xs">Nicht aktiv</span>
            )}
          </div>

          <AnimatePresence mode="wait">
            {enrolling ? (
              <motion.form key="enroll" onSubmit={confirmEnroll}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="mt-6 space-y-4">
                <p className="text-sm">1. Scanne den QR-Code mit deiner Authenticator-App (z. B. Google Authenticator, 1Password, Authy).</p>
                {qr && <img src={qr} alt="QR Code" className="mx-auto rounded-2xl border border-black/10 bg-white p-2 w-48 h-48" />}
                {secret && (
                  <p className="text-xs text-center text-[#6e6e73]">
                    Oder manuell: <code className="font-mono bg-white/70 px-2 py-1 rounded">{secret}</code>
                  </p>
                )}
                <p className="text-sm">2. Gib den 6-stelligen Code aus der App ein:</p>
                <input
                  value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  inputMode="numeric" required autoFocus placeholder="000 000"
                  className="w-full h-14 px-4 rounded-2xl bg-white/70 border border-black/10 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-[#06c]/40"
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setEnrolling(false); setError(""); }}
                    className="flex-1 h-11 rounded-full bg-white/70 border border-black/10 hover:bg-white transition text-sm">Abbrechen</button>
                  <button type="submit" disabled={code.length !== 6}
                    className="flex-1 h-11 rounded-full bg-[#06c] text-white font-medium hover:bg-[#0077ed] transition disabled:opacity-50">
                    Aktivieren
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                {verified.length > 0 ? (
                  <ul className="space-y-2">
                    {verified.map((f) => (
                      <li key={f.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/60 border border-black/5">
                        <span className="text-sm">{f.friendly_name || "Authenticator"}</span>
                        <button onClick={() => removeFactor(f.id)} className="text-xs text-red-600 hover:underline">Entfernen</button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <button onClick={startEnroll}
                    className="w-full h-11 rounded-full bg-[#06c] text-white font-medium hover:bg-[#0077ed] transition">
                    2FA jetzt einrichten
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
