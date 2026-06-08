import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Sternbecher" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "denied" | "ok">("loading");
  const [email, setEmail] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/auth" }); return; }
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal && aal.nextLevel === "aal2" && aal.currentLevel === "aal1") {
        navigate({ to: "/auth" });
        return;
      }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      const admin = (roles ?? []).some((r) => r.role === "admin");
      setEmail(session.user.email ?? "");
      setState(admin ? "ok" : "denied");
    })();
  }, [navigate]);

  if (state === "loading") return <div className="min-h-screen flex items-center justify-center text-[#86868b]">Lade…</div>;

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <Link to="/account" className="text-sm text-[#06c] hover:underline">‹ Konto</Link>

        {state === "denied" ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-3xl glass p-8 text-center">
            <h1 className="text-3xl font-semibold">Kein Zugriff</h1>
            <p className="mt-2 text-[#6e6e73]">Dieser Bereich ist nur für Administratoren.</p>
            <p className="mt-4 text-xs text-[#86868b]">
              Um dich als Admin freizuschalten, füge in der Datenbank in der Tabelle <code className="font-mono">user_roles</code> einen Eintrag mit deiner User-ID und role = "admin" hinzu.
            </p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-3xl glass p-8">
            <h1 className="text-3xl font-semibold">Admin-Bereich</h1>
            <p className="mt-1 text-[#6e6e73]">Angemeldet als {email}</p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white/60 border border-black/5">
                <p className="text-sm text-[#86868b]">Bestellungen</p>
                <p className="text-3xl font-semibold mt-1">—</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/60 border border-black/5">
                <p className="text-sm text-[#86868b]">Kunden</p>
                <p className="text-3xl font-semibold mt-1">—</p>
              </div>
            </div>
            <p className="mt-6 text-xs text-[#86868b]">Hier können später echte Bestelldaten erscheinen.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
