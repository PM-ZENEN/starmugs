import { createServerFn } from "@tanstack/react-start";

export type PrintifyProduct = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: { src: string; is_default?: boolean }[];
  variants: { id: number; title: string; price: number; is_enabled: boolean }[];
};

export const getPrintifyProducts = createServerFn({ method: "GET" }).handler(async () => {
  const token = process.env.PRINTIFY_API_TOKEN;
  if (!token) return { enabled: false as const, products: [] as PrintifyProduct[] };

  const headers = { Authorization: `Bearer ${token}`, "User-Agent": "Sternbecher/1.0" };

  try {
    const shopsRes = await fetch("https://api.printify.com/v1/shops.json", { headers });
    if (!shopsRes.ok) return { enabled: false as const, products: [], error: `shops ${shopsRes.status}` };
    const shops = (await shopsRes.json()) as { id: number; title: string }[];
    if (!shops.length) return { enabled: true as const, products: [] };

    const all: PrintifyProduct[] = [];
    for (const shop of shops) {
      const r = await fetch(`https://api.printify.com/v1/shops/${shop.id}/products.json?limit=50`, { headers });
      if (!r.ok) continue;
      const json = (await r.json()) as { data: any[] };
      for (const p of json.data ?? []) {
        all.push({
          id: String(p.id),
          title: p.title,
          description: p.description ?? "",
          tags: p.tags ?? [],
          images: (p.images ?? []).map((i: any) => ({ src: i.src, is_default: i.is_default })),
          variants: (p.variants ?? []).filter((v: any) => v.is_enabled).map((v: any) => ({
            id: v.id, title: v.title, price: v.price, is_enabled: v.is_enabled,
          })),
        });
      }
    }
    return { enabled: true as const, products: all };
  } catch (e) {
    return { enabled: false as const, products: [], error: String(e) };
  }
});
