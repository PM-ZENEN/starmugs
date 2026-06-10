import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import type { PrintifyProduct } from "@/lib/printify.functions";

export function PrintifyCard({ product }: { product: PrintifyProduct }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 18 });
  const glareX = useTransform(x, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(y, [-0.5, 0.5], ["0%", "100%"]);
  const cart = useCart();
  const [added, setAdded] = useState(false);

  const img = product.images.find((i) => i.is_default)?.src ?? product.images[0]?.src;
  const minPrice = product.variants.length
    ? Math.min(...product.variants.map((v) => v.price)) / 100
    : 0;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  const add = () => {
    const v = product.variants[0];
    cart.add({
      productId: product.id, shape: "star", color: "#1d1d1f", colorLabel: v?.title ?? "Standard",
      size: v?.title, qty: 1,
    });
    setAdded(true); setTimeout(() => setAdded(false), 1400);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-3xl p-5 bg-white/70 backdrop-blur-xl border border-black/5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)] overflow-hidden"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: useTransform(
            [glareX, glareY] as any,
            ([gx, gy]: any) => `radial-gradient(600px circle at ${gx} ${gy}, rgba(255,255,255,0.5), transparent 40%)`,
          ) as any,
        }}
      />
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#f5f5f7] to-[#e8e8ed]" style={{ transform: "translateZ(40px)" }}>
        {img ? (
          <motion.img
            src={img} alt={product.title} loading="lazy"
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#86868b]">Kein Bild</div>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3" style={{ transform: "translateZ(30px)" }}>
        <div className="min-w-0">
          <p className="font-semibold text-[15px] truncate">{product.title}</p>
          <p className="text-xs text-[#86868b] mt-0.5">{product.variants.length} Varianten</p>
        </div>
        <p className="text-[#06c] font-semibold whitespace-nowrap text-sm">ab {minPrice.toFixed(2)} €</p>
      </div>
      <motion.button
        onClick={add}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
        style={{ transform: "translateZ(30px)" }}
        className="mt-3 w-full py-2.5 rounded-full bg-[#1d1d1f] text-white text-sm font-medium hover:bg-[#06c] transition-colors"
      >
        {added ? "✓ Hinzugefügt" : "In den Warenkorb"}
      </motion.button>
    </motion.div>
  );
}
