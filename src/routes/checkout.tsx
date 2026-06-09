import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart";
import { PRODUCTS } from "@/lib/products";
import { ShapeIcon } from "@/lib/shapes";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Sternbecher" }, { name: "robots", content: "noindex" }] }),
  component: CheckoutPage,
});

type Method = "paypal" | "card" | "klarna" | "applepay";

function CheckoutPage() {
  const { items, total, remove, clear } = useCart();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [addr, setAddr] = useState("");
  const [method, setMethod] = useState<Method>("paypal");
  const [stage, setStage] = useState<"form" | "processing" | "done">("form");
  const [orderId, setOrderId] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;
    setStage("processing");

    // Fake-Bezahlvorgang
    await new Promise((r) => setTimeout(r, 1800));

    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("orders").insert({
      user_id: user?.id ?? null,
      customer_name: name,
      customer_email: email,
      shipping_address: addr,
      items: items as any,
      total_cents: Math.round(total * 100),
      status: "pending",
      source: `fake-${method}`,
    }).select("id").single();

    if (error || !data) { setStage("form"); alert("Fehler: " + (error?.message ?? "")); return; }
    setOrderId(data.id);
    clear();
    setStage("done");
  };

  if (stage === "done") {
    return (
      <div className="min-h-screen bg-[#fbfbfd] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full text-center glass rounded-3xl p-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="mx-auto w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white text-4xl">✓</motion.div>
          <h1 className="mt-6 text-3xl font-semibold">Danke!</h1>
          <p className="mt-2 text-[#6e6e73]">Deine Bestellung ist eingegangen.</p>
          <p className="mt-1 text-xs text-[#86868b] font-mono">#{orderId.slice(0, 8)}</p>
          <Link to="/" className="mt-8 inline-block px-6 py-3 rounded-full bg-[#1d1d1f] text-white">Zurück zum Shop</Link>
        </motion.div>
      </div>
    );
  }

  if (stage === "processing") {
    return (
      <div className="min-h-screen bg-[#fbfbfd] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#06c] border-t-transparent rounded-full" />
        <p className="ml-4 text-[#6e6e73]">Zahlung wird verarbeitet…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="text-sm text-[#06c] hover:underline">‹ Weiter shoppen</Link>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Checkout</h1>

        {items.length === 0 ? (
          <div className="mt-10 text-center glass rounded-3xl p-12">
            <p className="text-xl text-[#6e6e73]">Dein Warenkorb ist leer.</p>
            <Link to="/" className="mt-6 inline-block px-6 py-3 rounded-full bg-[#1d1d1f] text-white">Zum Shop</Link>
          </div>
        ) : (
          <div className="mt-8 grid md:grid-cols-[1fr_400px] gap-8">
            {/* Form */}
            <motion.form onSubmit={submit} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-3xl p-8 space-y-5">
              <h2 className="text-2xl font-semibold">Lieferung</h2>
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Vor- und Nachname"
                className="w-full px-4 py-3 rounded-xl bg-white/70 border border-black/10 focus:border-[#06c] outline-none" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail"
                className="w-full px-4 py-3 rounded-xl bg-white/70 border border-black/10 focus:border-[#06c] outline-none" />
              <textarea required value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Straße, PLZ, Stadt, Land" rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/70 border border-black/10 focus:border-[#06c] outline-none resize-none" />

              <h2 className="text-2xl font-semibold pt-4">Zahlungsmethode</h2>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { id: "paypal", label: "PayPal", color: "#003087", bg: "#FFC439" },
                  { id: "card", label: "Kreditkarte", color: "#fff", bg: "#1d1d1f" },
                  { id: "klarna", label: "Klarna", color: "#17120F", bg: "#FFA8CD" },
                  { id: "applepay", label: " Pay", color: "#fff", bg: "#000" },
                ] as { id: Method; label: string; color: string; bg: string }[]).map((m) => (
                  <motion.button key={m.id} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setMethod(m.id)}
                    className={`py-4 rounded-xl font-semibold transition-all ${method === m.id ? "ring-2 ring-[#06c] ring-offset-2" : ""}`}
                    style={{ background: m.bg, color: m.color }}>
                    {m.label}
                  </motion.button>
                ))}
              </div>
              <p className="text-xs text-[#86868b]">Demo-Modus: Es wird keine echte Zahlung ausgelöst.</p>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                className="w-full py-4 rounded-full bg-[#06c] text-white font-semibold text-lg shadow-lg shadow-[#06c]/30">
                Jetzt zahlungspflichtig bestellen · {total.toFixed(2)} €
              </motion.button>
            </motion.form>

            {/* Cart Summary */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="glass rounded-3xl p-6 h-fit sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Warenkorb ({items.length})</h2>
              <AnimatePresence>
                {items.map((it, idx) => {
                  const p = PRODUCTS.find((x) => x.id === it.productId);
                  if (!p) return null;
                  return (
                    <motion.div key={idx} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="flex items-center gap-3 py-3 border-b border-black/5 last:border-0">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: it.color }}>
                        <ShapeIcon id={it.shape} color="#fff" className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{p.name}</p>
                        <p className="text-xs text-[#86868b]">{it.colorLabel}{it.size ? ` · ${it.size}` : ""} · ×{it.qty}</p>
                      </div>
                      <p className="text-sm font-medium">{(p.price * it.qty).toFixed(2)}€</p>
                      <button type="button" onClick={() => remove(idx)} className="text-[#86868b] hover:text-red-500 text-xs">×</button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div className="mt-4 pt-4 border-t border-black/10 flex justify-between text-lg font-semibold">
                <span>Gesamt</span><span>{total.toFixed(2)} €</span>
              </div>
              <p className="text-xs text-[#86868b] mt-1">Inkl. MwSt · Kostenfreier Versand</p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
