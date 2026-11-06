import type { Product, ProductStatus } from "@/types/catalog";

/** Inactive wins over stock: an inactive product is hidden either way. */
export function productStatus(product: Pick<Product, "is_active" | "stock">): ProductStatus {
  if (!product.is_active) return "inactive";
  if (product.stock <= 0) return "out_of_stock";
  return "active";
}

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  out_of_stock: "Out of stock",
};

/** Brand rule: Active = completed colors, Inactive = cancelled, Out of stock = preparing. */
export const PRODUCT_STATUS_BADGE_CLASSES: Record<ProductStatus, string> = {
  active: "bg-status-completed text-status-completed-foreground",
  inactive: "bg-status-cancelled text-status-cancelled-foreground",
  out_of_stock: "bg-status-preparing text-status-preparing-foreground",
};
