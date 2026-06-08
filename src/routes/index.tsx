import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { SHAPES, ShapeIcon, type ShapeId } from "@/lib/shapes";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sternbecher — Handgefertigte Tassen mit Stern" },
      { name: "description", content: "Premium Tassen mit zwölf Motiven zur Auswahl. Sechs Farben, ein Preis: 30 €." },
      { property: "og:title", content: "Sternbecher — Deine Form, deine Tasse" },
      { property: "og:description", content: "Premium Tassen mit zwölf Motiven. 30 €." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

const COLORS = [
  { id: "white", label: "Weiß", hex: "#f5f2ee", motif: "#1c1c1e" },
  { id: "black", label: "Schwarz", hex: "#1c1c1e", motif: "#f5f2ee" },
  { id: "cream", label: "Creme", hex: "#e8dcc8", motif: "#3a2a1a" },
  { id: "navy", label: "Navy", hex: "#1a2744", motif: "#e8c87a" },
  { id: "sage", label: "Salbei", hex: "#8aab8a", motif: "#f5f2ee" },
  { id: "blush", label: "Blush", hex: "#d4a0a0", motif: "#3a1a1a" },
];

function shade(hex: string, amt: number) {
  const h = hex.replace("#", "");
  const r = Math.max(0, Math.min(255, parseInt(h.slice(0, 2), 16) + amt));
  const g = Math.max(0, Math.min(255, parseInt(h.slice(2, 4), 16) + amt));
  const b = Math.max(0, Math.min(255, parseInt(h.slice(4, 6), 16) + amt));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function MugCanvas({ color, size = 520 }: { color: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let raf = 0;
    const draw = (t: number) => {
      const W = size, H = size;
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2 + Math.sin(t * 0.0009) * 10;

      const sh = ctx.createRadialGradient(cx, H * 0.86, 8, cx, H * 0.86, 130);
      sh.addColorStop(0, "rgba(0,0,0,0.32)");
      sh.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sh;
      ctx.beginPath();
      ctx.ellipse(cx, H * 0.86, 130, 24, 0, 0, Math.PI * 2);
      ctx.fill();

      const mugW = W * 0.5, mugH = H * 0.6;
      const mx = cx - mugW / 2, my = cy - mugH * 0.5;

      ctx.strokeStyle = shade(color, -25);
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.arc(mx + mugW + 6, cy, mugH * 0.28, -Math.PI * 0.55, Math.PI * 0.55);
      ctx.stroke();
      ctx.strokeStyle = color;
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(mx + mugW + 6, cy, mugH * 0.28, -Math.PI * 0.55, Math.PI * 0.55);
      ctx.stroke();

      const grd = ctx.createLinearGradient(mx, 0, mx + mugW, 0);
      grd.addColorStop(0, shade(color, -40));
      grd.addColorStop(0.15, shade(color, -10));
      grd.addColorStop(0.5, color);
      grd.addColorStop(0.85, color);
      grd.addColorStop(1, shade(color, -45));
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(mx, my + 18);
      ctx.quadraticCurveTo(mx + mugW / 2, my - 12, mx + mugW, my + 18);
      ctx.lineTo(mx + mugW, my + mugH - 8);
      ctx.quadraticCurveTo(mx + mugW / 2, my + mugH + 22, mx, my + mugH - 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = shade(color, -30);
      ctx.beginPath();
      ctx.ellipse(cx, my + 18, mugW / 2, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = shade(color, -55);
      ctx.beginPath();
      ctx.ellipse(cx, my + 18, mugW / 2 - 6, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      const hi = ctx.createLinearGradient(mx, 0, mx + mugW * 0.4, 0);
      hi.addColorStop(0, "rgba(255,255,255,0)");
      hi.addColorStop(0.6, "rgba(255,255,255,0.18)");
      hi.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = hi;
      ctx.fillRect(mx + 14, my + 28, mugW * 0.35, mugH - 50);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [color, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} className="max-w-full h-auto" />;
}

function Mug({ color, motif, shape, size = 480 }: { color: string; motif: string; shape: ShapeId; size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <MugCanvas color={color} size={size} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={shape}
            initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: size * 0.22, height: size * 0.22, marginTop: size * 0.03, marginLeft: -size * 0.025 }}
          >
            <ShapeIcon id={shape} color={motif} className="w-full h-full drop-shadow-sm" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Index() {
  const [colorIdx, setColorIdx] = useState(0);
  const [shape, setShape] = useState<ShapeId>("star");
  const [cart, setCart] = useState(0);
  const [toast, setToast] = useState("");
  const color = COLORS[colorIdx];

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const addToCart = () => {
    setCart((c) => c + 1);
    const label = SHAPES.find((s) => s.id === shape)?.label ?? "";
    setToast(`${color.label} · ${label} hinzugefügt`);
    setTimeout(() => setToast(""), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] antialiased overflow-x-hidden">
      {/* Ambient gradient blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[40rem] h-[40rem] rounded-full opacity-30 float-slow"
          style={{ background: "radial-gradient(circle, #ffb4d1, transparent 60%)" }} />
        <div className="absolute top-1/3 -right-40 w-[36rem] h-[36rem] rounded-full opacity-25 float-slow"
          style={{ background: "radial-gradient(circle, #b4d4ff, transparent 60%)", animationDelay: "-3s" }} />
        <div className="absolute bottom-0 left-1/4 w-[32rem] h-[32rem] rounded-full opacity-20 float-slow"
          style={{ background: "radial-gradient(circle, #fff1b4, transparent 60%)", animationDelay: "-6s" }} />
      </div>

      {/* Nav — liquid glass */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="sticky top-3 z-50 mx-3 md:mx-auto md:max-w-5xl rounded-full glass"
      >
        <div className="px-5 h-12 flex items-center justify-between text-sm">
          <a href="#top" className="font-semibold tracking-tight">★ Sternbecher</a>
          <nav className="flex items-center gap-5 text-[13px] text-[#1d1d1f]/80">
            <a href="#produkt" className="hover:text-black transition">Produkt</a>
            <a href="#farben" className="hidden sm:inline hover:text-black transition">Farben</a>
            <Link to="/impressum" className="hidden sm:inline hover:text-black transition">Impressum</Link>
            <Link to="/auth" className="px-3 py-1 rounded-full bg-black text-white text-xs hover:bg-black/80 transition">Login</Link>
            <span className="px-2 py-0.5 rounded-full bg-white/70 backdrop-blur text-[#1d1d1f] text-xs tabular-nums border border-black/10">{cart}</span>
          </nav>
        </div>
      </motion.header>

      {/* Hero */}
      <section ref={heroRef} id="top" className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden">
        <motion.div style={{ scale: heroScale, opacity: heroOpacity, y: heroY }} className="text-center px-6 pt-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-sm uppercase tracking-[0.2em] text-[#86868b] mb-4"
          >
            Neu · Edition 2026
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.9 }}
            className="text-6xl md:text-8xl font-semibold tracking-tight leading-[0.95] bg-gradient-to-br from-[#1d1d1f] via-[#1d1d1f] to-[#6e6e73] bg-clip-text text-transparent"
          >
            Deine Form.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9 }}
            className="mt-5 text-2xl md:text-3xl text-[#86868b] font-light"
          >
            Zwölf Motive. Sechs Farben. Ein Preis.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-8 flex items-center justify-center gap-6 text-[17px]"
          >
            <span className="text-[#06c] font-medium">Ab 30 €</span>
            <span className="text-[#86868b]">·</span>
            <a href="#produkt" className="text-[#06c] hover:underline">Mehr erfahren ›</a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4"
        >
          <Mug color={color.hex} motif={color.motif} shape={shape} size={420} />
        </motion.div>
      </section>

      {/* Produkt */}
      <section id="produkt" className="py-32 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={color.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                <Mug color={color.hex} motif={color.motif} shape={shape} size={480} />
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 className="text-5xl md:text-6xl font-semibold tracking-tight">Wähle dein Motiv.</h2>
            <p className="mt-4 text-xl text-[#86868b] font-light">Zwölf handveredelte Formen — jedes Motiv ein Unikat.</p>

            {/* Shape grid — glass cards */}
            <div className="mt-8 grid grid-cols-4 gap-2">
              {SHAPES.map((s) => (
                <motion.button
                  key={s.id}
                  whileHover={{ y: -3, scale: 1.04 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setShape(s.id)}
                  className={`group relative rounded-2xl p-3 transition-all ${
                    shape === s.id ? "glass ring-2 ring-[#06c]" : "bg-white/40 backdrop-blur hover:bg-white/70 border border-black/5"
                  }`}
                  aria-label={s.label}
                >
                  <div className="aspect-square flex items-center justify-center">
                    <ShapeIcon id={s.id} color="#1d1d1f" className="w-7 h-7" />
                  </div>
                  <p className="text-[10px] text-center mt-1 text-[#6e6e73]">{s.label}</p>
                </motion.button>
              ))}
            </div>

            <h3 id="farben" className="mt-10 text-sm uppercase tracking-[0.18em] text-[#86868b]">Farbe</h3>
            <div className="mt-3 grid grid-cols-6 gap-2">
              {COLORS.map((c, i) => (
                <motion.button
                  key={c.id}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setColorIdx(i)}
                  className={`rounded-full aspect-square border-2 transition-all ${
                    colorIdx === i ? "border-[#1d1d1f] shadow-lg" : "border-transparent hover:border-black/20"
                  }`}
                  style={{ background: `radial-gradient(circle at 30% 30%, ${shade(c.hex, 30)}, ${c.hex} 60%, ${shade(c.hex, -30)})` }}
                  aria-label={c.label}
                />
              ))}
            </div>

            <div className="mt-10 flex items-center gap-4">
              <div>
                <p className="text-3xl font-semibold">30,00 €</p>
                <p className="text-sm text-[#86868b]">Inkl. MwSt · Kostenfreier Versand</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={addToCart}
                className="ml-auto px-8 py-3.5 rounded-full bg-[#06c] text-white font-medium hover:bg-[#0077ed] transition shadow-lg shadow-[#06c]/30 relative overflow-hidden"
              >
                <span className="relative z-10">In den Warenkorb</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Details — dark glass */}
      <section id="details" className="py-32 px-6 bg-gradient-to-b from-black via-[#0a0a0c] to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[#06c] blur-3xl float-slow" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#d4a0a0] blur-3xl float-slow" style={{ animationDelay: "-4s" }} />
        </div>
        <div className="max-w-5xl mx-auto relative">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-semibold tracking-tight text-center"
          >
            Details, die zählen.
          </motion.h2>

          <div className="mt-20 grid md:grid-cols-3 gap-6">
            {[
              { t: "Steinzeug", d: "Bei 1240 °C gebrannt. Spülmaschinen- und mikrowellenfest." },
              { t: "Handveredelt", d: "Jedes Motiv wird in Hanau von Hand glasiert." },
              { t: "330 ml", d: "Die ideale Größe für deinen Morgenkaffee." },
            ].map((f, i) => (
              <motion.div
                key={f.t}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className="p-8 rounded-3xl glass-dark"
              >
                <p className="text-2xl font-semibold">{f.t}</p>
                <p className="mt-3 text-white/70 leading-relaxed">{f.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-5xl md:text-7xl font-semibold tracking-tight"
        >
          Bereit für dein Motiv?
        </motion.h2>
        <motion.a
          href="#produkt"
          whileHover={{ scale: 1.05 }}
          className="inline-block mt-10 px-10 py-4 rounded-full bg-[#1d1d1f] text-white font-medium text-lg"
        >
          Jetzt bestellen — 30 €
        </motion.a>
      </section>

      <footer className="border-t border-black/10 py-10 px-6 text-center text-sm text-[#86868b]">
        <p>© 2026 Sternbecher · Paula Walldorf</p>
        <p className="mt-2">
          <Link to="/impressum" className="hover:text-black underline-offset-4 hover:underline">Impressum</Link>
          {" · "}
          <Link to="/auth" className="hover:text-black underline-offset-4 hover:underline">Login</Link>
        </p>
      </footer>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full glass-dark text-white text-sm z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
