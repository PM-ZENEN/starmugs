import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { SHAPES, ShapeIcon, type ShapeId } from "@/lib/shapes";
import { PRODUCTS, CATEGORIES, type Category, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { getPrintifyProducts } from "@/lib/printify.functions";
import { PrintifyCard } from "@/components/PrintifyCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sternbecher — Tassen, Bags, Tees & Polos" },
      { name: "description", content: "Handveredelte Produkte mit zwölf Motiven. Tassen, Tote Bags, Stoffbeutel, T-Shirts & Polos." },
      { property: "og:title", content: "Sternbecher — Deine Form, dein Stil" },
      { property: "og:description", content: "Premium Tassen, Bags, Tees & Polos. Ab 15 €." },
    ],
    links: [
      { rel: "canonical", href: "/" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-192.svg" },
    ],
  }),
  component: Index,
});

const COLORS = [
  { id: "white",   label: "Weiß",      hex: "#f5f2ee", motif: "#1c1c1e" },
  { id: "black",   label: "Schwarz",   hex: "#1c1c1e", motif: "#f5f2ee" },
  { id: "cream",   label: "Creme",     hex: "#e8dcc8", motif: "#3a2a1a" },
  { id: "navy",    label: "Navy",      hex: "#1a2744", motif: "#e8c87a" },
  { id: "sage",    label: "Salbei",    hex: "#8aab8a", motif: "#f5f2ee" },
  { id: "blush",   label: "Blush",     hex: "#d4a0a0", motif: "#3a1a1a" },
  { id: "sunset",  label: "Sunset",    hex: "#ff7a59", motif: "#fff4e6" },
  { id: "ocean",   label: "Ocean",     hex: "#0a84ff", motif: "#e8f4ff" },
  { id: "forest",  label: "Forest",    hex: "#2d5a3d", motif: "#e8f0d8" },
  { id: "lavender",label: "Lavendel",  hex: "#b8a4e3", motif: "#2a1a44" },
  { id: "graphite",label: "Graphit",   hex: "#3a3a3c", motif: "#ffd60a" },
  { id: "rose",    label: "Rosé Gold", hex: "#e8b4a8", motif: "#5a2a2a" },
  { id: "mint",    label: "Mint",      hex: "#a8e8d4", motif: "#1a4a3a" },
  { id: "midnight",label: "Midnight",  hex: "#0a0a1f", motif: "#a8b4ff" },
];

function shade(hex: string, amt: number) {
  const h = hex.replace("#", "");
  const r = Math.max(0, Math.min(255, parseInt(h.slice(0, 2), 16) + amt));
  const g = Math.max(0, Math.min(255, parseInt(h.slice(2, 4), 16) + amt));
  const b = Math.max(0, Math.min(255, parseInt(h.slice(4, 6), 16) + amt));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function MugCanvas({ color, size = 480 }: { color: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    c.width = size * dpr; c.height = size * dpr; ctx.scale(dpr, dpr);
    let raf = 0;
    const draw = (t: number) => {
      const W = size, H = size; ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2 + Math.sin(t * 0.0009) * 10;
      const sh = ctx.createRadialGradient(cx, H * 0.86, 8, cx, H * 0.86, 130);
      sh.addColorStop(0, "rgba(0,0,0,0.32)"); sh.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sh; ctx.beginPath(); ctx.ellipse(cx, H * 0.86, 130, 24, 0, 0, Math.PI * 2); ctx.fill();
      const mugW = W * 0.5, mugH = H * 0.6; const mx = cx - mugW / 2, my = cy - mugH * 0.5;
      ctx.strokeStyle = shade(color, -25); ctx.lineWidth = 18;
      ctx.beginPath(); ctx.arc(mx + mugW + 6, cy, mugH * 0.28, -Math.PI * 0.55, Math.PI * 0.55); ctx.stroke();
      ctx.strokeStyle = color; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.arc(mx + mugW + 6, cy, mugH * 0.28, -Math.PI * 0.55, Math.PI * 0.55); ctx.stroke();
      const grd = ctx.createLinearGradient(mx, 0, mx + mugW, 0);
      grd.addColorStop(0, shade(color, -40)); grd.addColorStop(0.15, shade(color, -10));
      grd.addColorStop(0.5, color); grd.addColorStop(0.85, color); grd.addColorStop(1, shade(color, -45));
      ctx.fillStyle = grd; ctx.beginPath();
      ctx.moveTo(mx, my + 18); ctx.quadraticCurveTo(mx + mugW / 2, my - 12, mx + mugW, my + 18);
      ctx.lineTo(mx + mugW, my + mugH - 8); ctx.quadraticCurveTo(mx + mugW / 2, my + mugH + 22, mx, my + mugH - 8);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = shade(color, -30); ctx.beginPath(); ctx.ellipse(cx, my + 18, mugW / 2, 14, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = shade(color, -55); ctx.beginPath(); ctx.ellipse(cx, my + 18, mugW / 2 - 6, 10, 0, 0, Math.PI * 2); ctx.fill();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [color, size]);
  return <canvas ref={canvasRef} style={{ width: size, height: size }} className="max-w-full h-auto" />;
}

function ToteSVG({ color, motif, shape, size = 480 }: { color: string; motif: string; shape: ShapeId; size?: number }) {
  return (
    <svg viewBox="0 0 200 240" style={{ width: size, height: size }} className="max-w-full h-auto">
      <defs>
        <linearGradient id={`tg-${color}`} x1="0" x2="1"><stop offset="0" stopColor={shade(color,-30)}/><stop offset=".5" stopColor={color}/><stop offset="1" stopColor={shade(color,-40)}/></linearGradient>
      </defs>
      <path d="M65 40 Q65 15 100 15 Q135 15 135 40" fill="none" stroke={shade(color,-40)} strokeWidth="5"/>
      <path d="M40 50 L160 50 L170 220 L30 220 Z" fill={`url(#tg-${color})`}/>
      <g transform={`translate(75,95) scale(2.1)`}><ShapeIcon id={shape} color={motif} className="w-full h-full"/></g>
    </svg>
  );
}

function TeeSVG({ color, motif, shape, size = 480 }: { color: string; motif: string; shape: ShapeId; size?: number }) {
  return (
    <svg viewBox="0 0 240 240" style={{ width: size, height: size }} className="max-w-full h-auto">
      <defs><linearGradient id={`tt-${color}`} x1="0" x2="1"><stop offset="0" stopColor={shade(color,-25)}/><stop offset=".5" stopColor={color}/><stop offset="1" stopColor={shade(color,-35)}/></linearGradient></defs>
      <path d="M50 40 L90 25 Q120 50 150 25 L190 40 L210 80 L175 95 L175 215 L65 215 L65 95 L30 80 Z" fill={`url(#tt-${color})`} stroke={shade(color,-50)} strokeWidth="1.5"/>
      <g transform="translate(95,110) scale(2.1)"><ShapeIcon id={shape} color={motif} className="w-full h-full"/></g>
    </svg>
  );
}

function PoloSVG({ color, motif, shape, size = 480 }: { color: string; motif: string; shape: ShapeId; size?: number }) {
  return (
    <svg viewBox="0 0 240 240" style={{ width: size, height: size }} className="max-w-full h-auto">
      <defs><linearGradient id={`pp-${color}`} x1="0" x2="1"><stop offset="0" stopColor={shade(color,-25)}/><stop offset=".5" stopColor={color}/><stop offset="1" stopColor={shade(color,-35)}/></linearGradient></defs>
      <path d="M50 40 L95 25 L105 50 L120 60 L135 50 L145 25 L190 40 L210 80 L175 95 L175 215 L65 215 L65 95 L30 80 Z" fill={`url(#pp-${color})`} stroke={shade(color,-50)} strokeWidth="1.5"/>
      <path d="M105 50 L120 90 L135 50" fill="none" stroke={shade(color,-50)} strokeWidth="2"/>
      <circle cx="113" cy="65" r="1.8" fill={shade(color,-50)}/><circle cx="113" cy="78" r="1.8" fill={shade(color,-50)}/>
      <g transform="translate(95,120) scale(1.8)"><ShapeIcon id={shape} color={motif} className="w-full h-full"/></g>
    </svg>
  );
}

function BeutelSVG({ color, motif, shape, size = 480 }: { color: string; motif: string; shape: ShapeId; size?: number }) {
  return (
    <svg viewBox="0 0 200 240" style={{ width: size, height: size }} className="max-w-full h-auto">
      <defs><linearGradient id={`bb-${color}`} x1="0" x2="1"><stop offset="0" stopColor={shade(color,-20)}/><stop offset=".5" stopColor={color}/><stop offset="1" stopColor={shade(color,-30)}/></linearGradient></defs>
      <path d="M70 30 Q70 10 100 10 Q130 10 130 30" fill="none" stroke={shade(color,-40)} strokeWidth="3"/>
      <path d="M50 45 Q40 50 45 80 L55 225 L145 225 L155 80 Q160 50 150 45 Z" fill={`url(#bb-${color})`}/>
      <g transform="translate(75,100) scale(2)"><ShapeIcon id={shape} color={motif} className="w-full h-full"/></g>
    </svg>
  );
}

function ProductVisual({ product, color, motif, shape, size }: { product: Product; color: string; motif: string; shape: ShapeId; size?: number }) {
  if (product.category === "mug") return (
    <div className="relative" style={{ width: size, height: size }}>
      <MugCanvas color={color} size={size}/>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div key={shape} initial={{ opacity: 0, scale: 0.6, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 20 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: (size ?? 480) * 0.22, height: (size ?? 480) * 0.22, marginTop: (size ?? 480) * 0.03, marginLeft: -(size ?? 480) * 0.025 }}>
            <ShapeIcon id={shape} color={motif} className="w-full h-full drop-shadow-sm"/>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
  if (product.category === "tote") return <ToteSVG color={color} motif={motif} shape={shape} size={size}/>;
  if (product.category === "beutel") return <BeutelSVG color={color} motif={motif} shape={shape} size={size}/>;
  if (product.category === "tshirt") return <TeeSVG color={color} motif={motif} shape={shape} size={size}/>;
  return <PoloSVG color={color} motif={motif} shape={shape} size={size}/>;
}

function Index() {
  const [cat, setCat] = useState<Category>("mug");
  const [productId, setProductId] = useState(PRODUCTS[0].id);
  const [colorIdx, setColorIdx] = useState(0);
  const [shape, setShape] = useState<ShapeId>("star");
  const [size, setSize] = useState<string>("M");
  const [toast, setToast] = useState("");
  const cart = useCart();
  const color = COLORS[colorIdx];

  const productsInCat = useMemo(() => PRODUCTS.filter((p) => p.category === cat), [cat]);
  const product = useMemo(() => PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0], [productId]);

  useEffect(() => {
    if (product.category !== cat) setProductId(productsInCat[0]?.id ?? PRODUCTS[0].id);
  }, [cat, product.category, productsInCat]);

  // Register service worker
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const addToCart = () => {
    cart.add({
      productId: product.id, shape, color: color.hex, colorLabel: color.label,
      size: product.variants ? size : undefined, qty: 1,
    });
    setToast(`${product.name} hinzugefügt`);
    setTimeout(() => setToast(""), 2000);
  };

  const printifyQ = useQuery({
    queryKey: ["printify-products"],
    queryFn: () => getPrintifyProducts(),
    staleTime: 5 * 60 * 1000,
  });
  const printifyProducts = printifyQ.data?.enabled ? printifyQ.data.products : [];
  const hasPrintify = printifyProducts.length > 0;


  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] antialiased overflow-x-hidden">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[40rem] h-[40rem] rounded-full opacity-30 float-slow"
          style={{ background: "radial-gradient(circle, #ffb4d1, transparent 60%)" }}/>
        <div className="absolute top-1/3 -right-40 w-[36rem] h-[36rem] rounded-full opacity-25 float-slow"
          style={{ background: "radial-gradient(circle, #b4d4ff, transparent 60%)", animationDelay: "-3s" }}/>
        <div className="absolute bottom-0 left-1/4 w-[32rem] h-[32rem] rounded-full opacity-20 float-slow"
          style={{ background: "radial-gradient(circle, #fff1b4, transparent 60%)", animationDelay: "-6s" }}/>
      </div>

      <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        className="sticky top-3 z-50 mx-3 md:mx-auto md:max-w-5xl rounded-full glass">
        <div className="px-5 h-12 flex items-center justify-between text-sm">
          <a href="#top" className="font-semibold tracking-tight">★ Sternbecher</a>
          <nav className="flex items-center gap-4 text-[13px]">
            <a href="#shop" className="hover:text-black transition">Shop</a>
            <Link to="/impressum" className="hidden sm:inline hover:text-black transition">Impressum</Link>
            <Link to="/auth" className="hidden sm:inline px-3 py-1 rounded-full bg-black text-white text-xs hover:bg-black/80 transition">Login</Link>
            <Link to="/checkout" className="relative px-3 py-1 rounded-full bg-white/70 backdrop-blur border border-black/10 tabular-nums">
              🛒 {cart.count}
            </Link>
          </nav>
        </div>
      </motion.header>

      {/* Hero */}
      <section ref={heroRef} id="top" className="relative min-h-[100vh] flex flex-col items-center justify-center overflow-hidden">
        <motion.div style={{ scale: heroScale, opacity: heroOpacity, y: heroY }} className="text-center px-6 pt-12">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
            className="text-sm uppercase tracking-[0.2em] text-[#86868b] mb-4">Edition 2026 · Neu</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.9 }}
            className="text-6xl md:text-8xl font-semibold tracking-tight leading-[0.95] bg-gradient-to-br from-[#1d1d1f] via-[#1d1d1f] to-[#6e6e73] bg-clip-text text-transparent">
            Stellar.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9 }}
            className="mt-5 text-2xl md:text-3xl text-[#86868b] font-light">Tassen. Bags. Tees. Polos. Ein Stil.</motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="mt-8 flex items-center justify-center gap-6">
            <a href="#shop" className="text-[#06c] font-medium">Jetzt entdecken ›</a>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="mt-4">
          <ProductVisual product={product} color={color.hex} motif={color.motif} shape={shape} size={400}/>
        </motion.div>
      </section>

      {hasPrintify ? (
        /* Printify Collection — replaces local catalog when API token connected */
        <section id="shop" className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="flex items-center justify-between flex-wrap gap-4 mb-10">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[#86868b]">Live · Printify</p>
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mt-1">Die Kollektion</h2>
              </div>
              <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                ● {printifyProducts.length} Produkte · Echtzeit
              </span>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {printifyProducts.map((p) => (
                <PrintifyCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Kategorien */}
          <section id="shop" className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              {printifyQ.isLoading && (
                <p className="text-center text-sm text-[#86868b] mb-6">Lade Printify-Katalog …</p>
              )}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                {CATEGORIES.map((c) => (
                  <motion.button key={c.id} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }} onClick={() => setCat(c.id)}
                    className={`px-5 py-2.5 rounded-full font-medium whitespace-nowrap transition-all ${
                      cat === c.id ? "bg-[#1d1d1f] text-white shadow-lg" : "glass text-[#1d1d1f]"
                    }`}>
                    <span className="mr-1.5">{c.emoji}</span>{c.label}
                  </motion.button>
                ))}
              </motion.div>

              <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                  {productsInCat.map((p, i) => (
                    <motion.button key={p.id} layout
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setProductId(p.id)}
                      className={`text-left p-5 rounded-3xl transition-all ${
                        productId === p.id ? "glass ring-2 ring-[#06c]" : "glass"
                      }`}>
                      <p className="font-semibold text-lg">{p.name}</p>
                      <p className="text-sm text-[#86868b] mt-1">{p.tagline}</p>
                      <p className="mt-3 text-[#06c] font-medium">{p.price.toFixed(2)} €</p>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </section>

          {/* Konfigurator */}
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="flex justify-center">
                <AnimatePresence mode="wait">
                  <motion.div key={`${product.id}-${color.id}`}
                    initial={{ opacity: 0, scale: 0.9, rotateY: -20 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    exit={{ opacity: 0, scale: 0.9, rotateY: 20 }}
                    transition={{ duration: 0.5 }}>
                    <ProductVisual product={product} color={color.hex} motif={color.motif} shape={shape} size={460}/>
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
                <p className="text-sm uppercase tracking-[0.18em] text-[#86868b]">{CATEGORIES.find((c) => c.id === cat)?.label}</p>
                <h2 className="mt-1 text-5xl md:text-6xl font-semibold tracking-tight">{product.name}</h2>
                <p className="mt-3 text-xl text-[#86868b] font-light">{product.tagline}</p>

                <h3 className="mt-8 text-sm uppercase tracking-[0.18em] text-[#86868b]">Motiv</h3>
                <div className="mt-3 grid grid-cols-6 gap-2">
                  {SHAPES.map((s) => (
                    <motion.button key={s.id} whileHover={{ y: -3, scale: 1.06 }} whileTap={{ scale: 0.94 }}
                      onClick={() => setShape(s.id)}
                      className={`group rounded-xl p-2.5 transition-all ${
                        shape === s.id ? "glass ring-2 ring-[#06c]" : "bg-white/40 backdrop-blur hover:bg-white/70 border border-black/5"
                      }`} aria-label={s.label}>
                      <ShapeIcon id={s.id} color="#1d1d1f" className="w-6 h-6"/>
                    </motion.button>
                  ))}
                </div>

                <h3 className="mt-6 text-sm uppercase tracking-[0.18em] text-[#86868b]">Farbe · {color.label}</h3>
                <div className="mt-3 grid grid-cols-7 gap-2">
                  {COLORS.map((c, i) => (
                    <motion.button key={c.id} whileHover={{ y: -3, scale: 1.1 }} whileTap={{ scale: 0.94 }} onClick={() => setColorIdx(i)}
                      className={`rounded-full aspect-square border-2 transition-all ${
                        colorIdx === i ? "border-[#1d1d1f] shadow-xl scale-110" : "border-transparent hover:border-black/20"
                      }`}
                      style={{ background: `radial-gradient(circle at 30% 30%, ${shade(c.hex, 30)}, ${c.hex} 60%, ${shade(c.hex, -30)})` }}
                      aria-label={c.label}/>
                  ))}
                </div>

                {product.variants && (
                  <>
                    <h3 className="mt-6 text-sm uppercase tracking-[0.18em] text-[#86868b]">Größe</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {product.variants.map((v) => (
                        <motion.button key={v} whileTap={{ scale: 0.94 }} onClick={() => setSize(v)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            size === v ? "bg-[#1d1d1f] text-white" : "bg-white/60 border border-black/10"
                          }`}>{v}</motion.button>
                      ))}
                    </div>
                  </>
                )}

                <div className="mt-10 flex items-center gap-4">
                  <div>
                    <p className="text-3xl font-semibold">{product.price.toFixed(2)} €</p>
                    <p className="text-sm text-[#86868b]">Inkl. MwSt · Kostenfreier Versand</p>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addToCart}
                    className="ml-auto px-8 py-3.5 rounded-full bg-[#06c] text-white font-medium hover:bg-[#0077ed] transition shadow-lg shadow-[#06c]/30">
                    In den Warenkorb
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </section>
        </>
      )}

      {/* Details */}
      <section className="py-32 px-6 bg-gradient-to-b from-black via-[#0a0a0c] to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[#06c] blur-3xl float-slow"/>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#d4a0a0] blur-3xl float-slow" style={{ animationDelay: "-4s" }}/>
        </div>
        <div className="max-w-5xl mx-auto relative">
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-semibold tracking-tight text-center">Details, die zählen.</motion.h2>
          <div className="mt-20 grid md:grid-cols-3 gap-6">
            {[
              { t: "Premium-Materialien", d: "Steinzeug, Bio-Baumwolle, fair produziert." },
              { t: "Handveredelt", d: "Jedes Stück wird in Hanau von Hand finalisiert." },
              { t: "12 Motive · 6 Farben", d: "Über 70 Kombinationen pro Produkt." },
            ].map((f, i) => (
              <motion.div key={f.t} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }} className="p-8 rounded-3xl glass-dark">
                <p className="text-2xl font-semibold">{f.t}</p>
                <p className="mt-3 text-white/70 leading-relaxed">{f.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-black/10 py-12 px-6 text-center text-sm text-[#86868b]">
        <div className="flex justify-center gap-3 mb-6">
          {[
            { name: "TikTok", url: "https://tiktok.com/@pietromerico", bg: "#000",
              svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/></svg> },
            { name: "Instagram", url: "https://instagram.com/pietromerico", bg: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",
              svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg> },
            { name: "YouTube", url: "https://youtube.com/@pietromerico", bg: "#ff0000",
              svg: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"/></svg> },
          ].map((s) => (
            <motion.a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
              whileHover={{ y: -4, scale: 1.1, rotate: [0, -5, 5, 0] }} whileTap={{ scale: 0.9 }}
              transition={{ rotate: { duration: 0.4 } }}
              className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-lg"
              style={{ background: s.bg }} aria-label={s.name}>
              {s.svg}
            </motion.a>
          ))}
        </div>
        <p>© 2026 Sternbecher · Pietro Merico</p>
        <p className="mt-2">
          <Link to="/impressum" className="hover:text-black underline-offset-4 hover:underline">Impressum</Link>
          {" · "}<Link to="/auth" className="hover:text-black underline-offset-4 hover:underline">Login</Link>
          {" · "}<Link to="/account" className="hover:text-black underline-offset-4 hover:underline">Konto</Link>
        </p>
      </footer>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full glass-dark text-white text-sm z-50">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
