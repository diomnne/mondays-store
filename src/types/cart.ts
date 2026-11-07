/**
 * What the cart stores in localStorage: product ids and quantities only.
 * Prices and stock are always loaded fresh from the server.
 */
export type CartLine = {
  productId: string;
  quantity: number;
};

/** Current product data for a cart line, loaded from the database. */
export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  imageSrc: string | null;
  categoryName: string | null;
  priceCents: number;
  stock: number;
  isActive: boolean;
};

/**
 * One cart line checked against the database.
 * - `ok`: active and enough stock.
 * - `unavailable`: deleted (product is null) or inactive.
 * - `over_stock`: active, but the quantity is more than the stock (stock may be 0).
 */
export type ResolvedCartLine = {
  productId: string;
  quantity: number;
  status: "ok" | "unavailable" | "over_stock";
  product: CartProduct | null;
};
