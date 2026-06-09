// Produktkatalog mit "krassen" Apple-style Namen
import type { ShapeId } from "./shapes";

export type Category = "mug" | "tote" | "beutel" | "tshirt" | "polo";

export type Product = {
  id: string;
  name: string;
  tagline: string;
  category: Category;
  price: number; // EUR
  variants?: string[];
};

export const CATEGORIES: { id: Category; label: string; emoji: string }[] = [
  { id: "mug",    label: "Tassen",         emoji: "☕" },
  { id: "tote",   label: "Tote Bags",      emoji: "👜" },
  { id: "beutel", label: "Stoffbeutel",    emoji: "🧺" },
  { id: "tshirt", label: "T-Shirts",       emoji: "👕" },
  { id: "polo",   label: "Polos",          emoji: "🎽" },
];

export const PRODUCTS: Product[] = [
  // Tassen
  { id: "mug-pro",    name: "Stellar Mug Pro",    tagline: "Die Tasse, neu gedacht.",        category: "mug",    price: 30 },
  { id: "mug-air",    name: "Stellar Mug Air",    tagline: "Leichter. Klarer. Heller.",      category: "mug",    price: 28 },
  { id: "mug-mini",   name: "Stellar Mug mini",   tagline: "Espresso, kompromisslos.",       category: "mug",    price: 22 },
  { id: "mug-max",    name: "Stellar Mug Max",    tagline: "Wenn 330 ml nicht reichen.",     category: "mug",    price: 34 },

  // Tote Bags
  { id: "tote-nova",  name: "Nova Tote",          tagline: "Trag den Kosmos.",               category: "tote",   price: 25 },
  { id: "tote-orbit", name: "Orbit Shopper",      tagline: "Für alles, was du liebst.",      category: "tote",   price: 27 },

  // Stoffbeutel
  { id: "bag-eclipse",name: "Eclipse Beutel",     tagline: "Stoff, der Statement macht.",    category: "beutel", price: 15 },
  { id: "bag-aurora", name: "Aurora Beutel",      tagline: "Sanft. Stark. Sichtbar.",        category: "beutel", price: 17 },

  // T-Shirts
  { id: "tee-cosmos", name: "Cosmos Tee",         tagline: "Bio-Baumwolle, sternklar.",      category: "tshirt", price: 35, variants: ["XS","S","M","L","XL","XXL"] },
  { id: "tee-pulsar", name: "Pulsar Tee",         tagline: "Schwarz wie der Weltraum.",      category: "tshirt", price: 38, variants: ["XS","S","M","L","XL","XXL"] },

  // Polos
  { id: "polo-halo",  name: "Halo Polo",          tagline: "Klassik trifft Galaxie.",        category: "polo",   price: 49, variants: ["S","M","L","XL","XXL"] },
  { id: "polo-zenith",name: "Zenith Polo",        tagline: "Der Gipfel der Lässigkeit.",     category: "polo",   price: 52, variants: ["S","M","L","XL","XXL"] },
];

export type CartItem = {
  productId: string;
  shape: ShapeId;
  color: string;
  colorLabel: string;
  size?: string;
  qty: number;
};
