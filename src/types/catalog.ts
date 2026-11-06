import type { Database } from "./database";

type Tables = Database["public"]["Tables"];

export type Category = Tables["categories"]["Row"];
export type Product = Tables["products"]["Row"];

/** Derived for display: an active product with 0 stock is "out of stock". */
export type ProductStatus = "active" | "inactive" | "out_of_stock";

/** A product row with its category name joined in, for lists and tiles. */
export type ProductSummary = Pick<
  Product,
  "id" | "name" | "slug" | "price_cents" | "stock" | "image_url" | "is_featured"
> & {
  category: Pick<Category, "id" | "name"> | null;
};
