import type { Database } from "./database";

type Tables = Database["public"]["Tables"];

export type Category = Tables["categories"]["Row"];
export type Product = Tables["products"]["Row"];

/** Derived for display: an active product with 0 stock is "out of stock". */
export type ProductStatus = "active" | "inactive" | "out_of_stock";

/** A product as the storefront shows it in tiles and cards. */
export type ProductSummary = Pick<
  Product,
  "id" | "name" | "slug" | "description" | "price_cents" | "stock" | "is_featured"
> & {
  category: Pick<Category, "id" | "name"> | null;
  /**
   * Resolved on the server: the image path if the file exists, otherwise null
   * so the UI shows the category-gradient placeholder instead of a broken image.
   */
  imageSrc: string | null;
};

/** The details page needs the category id to look up related products. */
export type ProductDetail = ProductSummary & Pick<Product, "category_id">;
