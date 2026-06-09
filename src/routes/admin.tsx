import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCTS } from "@/lib/products";
import type { ShapeId } from "@/lib/shapes";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Sternbecher" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

type Order = {
  id: string;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  items: any;
  total_cents: number;
  status: string;
  is_fake: boolean;
  source: string;
  created_at: string;
};

const SHAPE_IDS: ShapeId[] = ["star","heart","circle","triangle","arrow","drop","bow","bolt","moon","sun","crown","flower"];
const FAKE_NAMES = ["Lena Becker","Tom Müller","Sara Klein","Max Schulz","Anna Weber","Jonas Fischer","Mia Wagner","Paul Schmidt"];
const FAKE_CITIES = ["Hanau","Frankfurt","München","Berlin","Hamburg","Köln","Stuttgart"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function AdminPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "denied" | "ok">("loading");
  const [orders, setOrders] = useState<Order[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
    setOrders((data as Order[]) ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/auth" }); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
      const admin = (roles ?? []).some((r) => r.role === "admin");
      if (!admin) { setState("denied"); return; }
      setState("ok");
      await load();
    })();
  }, [navigate, load]);

  const createFake = async () => {
    setBusy(true);
    const n = 1 + Math.floor(Math.random() * 3);
    const items = Array.from({ length: n }, () => {
      const p = pick(PRODUCTS);
      return {
        productId: p.id,
        shape: pick(SHAPE_IDS),
        color: pick(["#1c1c1e","#f5f2ee","#8aab8a","#1a2744","#d4a0a0","#e8dcc8"]),
        colorLabel: pick(["Schwarz","Weiß","Salbei","Navy","Blush","Creme"]),
        size: p.variants ? pick(p.variants) : undefined,
        qty: 1 + Math.floor(Math.random() * 2),
      };
    });
    const total_cents = items.reduce((s, it) => {
      const p = PRODUCTS.find((x) => x.id === it.productId)!;
      return s + p.price * 100 * it.qty;
    }, 0);
    const name = pick(FAKE_NAMES);
    await supabase.from("orders").insert({
      customer_name: name,
      customer_email: name.toLowerCase().replace(" ", ".") + "@example.com",
      shipping_address: `${pick(["Hauptstr.","Bahnhofstr.","Goethestr."])} ${1 + Math.floor(Math.random() * 99)}, ${10000 + Math.floor(Math.random() * 80000)} ${pick(FAKE_CITIES)}`,
      items: items as any,
      total_cents,
      status: pick(["pending","paid","shipped"]),
      is_fake: true,
      source: "admin-fake",
    });
    await load();
    setBusy(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Bestellung wirklich löschen?")) return;
    await supabase.from("orders").delete().eq("id", id);
    await load();
  };

  if (state === "loading") return <div className="min-h-screen flex items-center justify-center text-[#86868b]">Lade…</div>;

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <Link to="/account" className="text-sm text-[#06c] hover:underline">‹ Konto</Link>

        {state === "denied" ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-3xl glass p-8 text-center">
            <h1 className="text-3xl font-semibold">Kein Zugriff</h1>
            <p className="mt-2 text-[#6e6e73]">Nur Administratoren.</p>
            <p className="mt-4 text-xs text-[#86868b]">
              Trage in der Tabelle <code className="font-mono">user_roles</code> einen Eintrag mit deiner User-ID und role = "admin" ein.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-semibold">Bestellungen</h1>
                <p className="text-[#6e6e73] mt-1">
                  {orders.length} insgesamt · {orders.filter((o) => o.is_fake).length} Test ·
                  Umsatz {(orders.filter((o) => !o.is_fake).reduce((s, o) => s + o.total_cents, 0) / 100).toFixed(2)} €
                </p>
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={createFake} disabled={busy}
                className="px-5 py-2.5 rounded-full bg-[#06c] text-white font-medium shadow-lg shadow-[#06c]/30 disabled:opacity-50">
                {busy ? "…" : "+ Test-Bestellung"}
              </motion.button>
            </motion.div>

            <div className="mt-6 space-y-3">
              <AnimatePresence>
                {orders.map((o, i) => (
                  <motion.div key={o.id} layout
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: Math.min(i, 10) * 0.03 }}
                    className="glass rounded-2xl p-5 grid md:grid-cols-[1fr_auto] gap-4 items-start">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{o.customer_name}</p>
                        {o.is_fake && <span className="px-2 py-0.5 text-[10px] rounded-full bg-yellow-200 text-yellow-900">TEST</span>}
                        <span className="text-xs text-[#86868b] font-mono">#{o.id.slice(0, 8)}</span>
                      </div>
                      <p className="text-sm text-[#6e6e73]">{o.customer_email}</p>
                      <p className="text-xs text-[#86868b] mt-1">{o.shipping_address}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(Array.isArray(o.items) ? o.items : []).map((it: any, idx: number) => {
                          const p = PRODUCTS.find((x) => x.id === it.productId);
                          return <span key={idx} className="px-2 py-0.5 text-xs rounded-full bg-white/60 border border-black/5">
                            {p?.name ?? it.productId}{it.size ? ` ${it.size}` : ""} ×{it.qty}
                          </span>;
                        })}
                      </div>
                      <p className="text-xs text-[#86868b] mt-2">{new Date(o.created_at).toLocaleString("de-DE")}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-xl font-semibold">{(o.total_cents / 100).toFixed(2)} €</p>
                      <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="text-xs px-3 py-1 rounded-full bg-white/70 border border-black/10">
                        <option value="pending">Ausstehend</option>
                        <option value="paid">Bezahlt</option>
                        <option value="shipped">Versendet</option>
                        <option value="cancelled">Storniert</option>
                      </select>
                      <button onClick={() => remove(o.id)} className="text-xs text-red-500 hover:underline">Löschen</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {orders.length === 0 && <p className="text-center text-[#86868b] py-12">Noch keine Bestellungen.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
