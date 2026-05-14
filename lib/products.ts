export type Product = {
  level: number;
  name: string;
  image: string;
};

export const PRODUCTS: Product[] = [
  { level: 1,  name: "Glass Bottle",            image: "/images/level-01-glass-bottle.jpeg" },
  { level: 2,  name: "Motivational Bottle",     image: "/images/level-02-motivational-bottle.jpeg" },
  { level: 3,  name: "Travel Pouches (Set of 3)", image: "/images/level-03-pouches.jpeg" },
  { level: 4,  name: "Canvas Tote Bag",         image: "/images/level-04-canvas-tote.jpeg" },
  { level: 5,  name: "Quilted Bag",             image: "/images/level-05-quilted-bag.jpeg" },
  { level: 6,  name: "Resistance Band Set",     image: "/images/level-06-resistance-band.jpeg" },
  { level: 7,  name: "Stanley Tumbler",         image: "/images/level-07-stanley-tumbler.png" },
  { level: 8,  name: "Wrap-Around Weights",     image: "/images/level-08-wrap-weights.jpeg" },
  { level: 9,  name: "Duffel Bag",              image: "/images/level-09-duffel-bag.png" },
  { level: 10, name: "Tego Yoga Mat",           image: "/images/level-10-tego-mat.png" },
  { level: 11, name: "Wiselife Yoga Mat",       image: "/images/level-11-wiselife-mat.png" },
];

// The 10 head-to-head pairs: (1v2), (2v3), ... (10v11)
export const PAIRS: { low: number; high: number }[] = PRODUCTS
  .slice(0, -1)
  .map((p) => ({ low: p.level, high: p.level + 1 }));

export function getProduct(level: number): Product {
  const p = PRODUCTS.find((x) => x.level === level);
  if (!p) throw new Error(`No product at level ${level}`);
  return p;
}
