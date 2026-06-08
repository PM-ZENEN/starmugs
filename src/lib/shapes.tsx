// 12 selectable shapes. Each path is drawn inside a 24x24 viewBox.
export type ShapeId =
  | "star" | "heart" | "circle" | "triangle"
  | "arrow" | "drop" | "bow" | "bolt"
  | "moon" | "sun" | "crown" | "flower";

export const SHAPES: { id: ShapeId; label: string; path: string }[] = [
  { id: "star",     label: "Stern",         path: "M12 2 L14.6 8.6 L22 9.3 L16.2 14 L18 21 L12 17.3 L6 21 L7.8 14 L2 9.3 L9.4 8.6 Z" },
  { id: "heart",    label: "Herz",          path: "M12 21s-7-4.5-9.3-9.2C1 8 3.3 4 7 4c2 0 3.7 1 5 2.6C13.3 5 15 4 17 4c3.7 0 6 4 4.3 7.8C19 16.5 12 21 12 21Z" },
  { id: "circle",   label: "Kreis",         path: "M12 2 a10 10 0 1 0 0.001 0 Z" },
  { id: "triangle", label: "Dreieck",       path: "M12 3 L22 20 L2 20 Z" },
  { id: "arrow",    label: "Pfeil",         path: "M12 2 L20 12 L15 12 L15 22 L9 22 L9 12 L4 12 Z" },
  { id: "drop",     label: "Tropfen",       path: "M12 2 C12 2 4 11 4 16 a8 8 0 0 0 16 0 C20 11 12 2 12 2 Z" },
  { id: "bow",      label: "Bogen",         path: "M3 20 A9 9 0 0 1 21 20 L17 20 A5 5 0 0 0 7 20 Z" },
  { id: "bolt",     label: "Blitz",         path: "M13 2 L4 14 L11 14 L9 22 L20 9 L13 9 Z" },
  { id: "moon",     label: "Mond",          path: "M20 14 A9 9 0 1 1 10 4 A7 7 0 0 0 20 14 Z" },
  { id: "sun",      label: "Sonne",         path: "M12 6 a6 6 0 1 0 0.01 0 Z M12 1 L12 4 M12 20 L12 23 M1 12 L4 12 M20 12 L23 12 M4.2 4.2 L6.3 6.3 M17.7 17.7 L19.8 19.8 M4.2 19.8 L6.3 17.7 M17.7 6.3 L19.8 4.2" },
  { id: "crown",    label: "Krone",         path: "M3 18 L5 8 L9 13 L12 5 L15 13 L19 8 L21 18 Z" },
  { id: "flower",   label: "Blume",         path: "M12 12 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0 M12 3 a3 3 0 0 1 0 6 M12 15 a3 3 0 0 1 0 6 M3 12 a3 3 0 0 1 6 0 M15 12 a3 3 0 0 1 6 0 M5.6 5.6 a3 3 0 0 1 4.2 4.2 M14.2 14.2 a3 3 0 0 1 4.2 4.2 M18.4 5.6 a3 3 0 0 0 -4.2 4.2 M9.8 14.2 a3 3 0 0 0 -4.2 4.2" },
];

export function ShapeIcon({ id, color, className, stroke }: { id: ShapeId; color: string; className?: string; stroke?: boolean }) {
  const s = SHAPES.find((x) => x.id === id)!;
  return (
    <svg viewBox="0 0 24 24" className={className} fill={stroke ? "none" : color} stroke={stroke ? color : "none"} strokeWidth={stroke ? 1.8 : 0} strokeLinejoin="round" strokeLinecap="round">
      <path d={s.path} />
    </svg>
  );
}
