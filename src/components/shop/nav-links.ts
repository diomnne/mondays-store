/**
 * Storefront navigation, shared by the desktop nav pill and the mobile sheet.
 * Category links filter the listing by category name (categories have no slug).
 */
export const SHOP_NAV_LINKS = [
  { href: "/products", label: "Shop all" },
  { href: "/products?category=lips", label: "Lips" },
  { href: "/products?category=face", label: "Face" },
  { href: "/products?category=skin", label: "Skin" },
] as const;
