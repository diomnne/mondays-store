/**
 * Category → brand color. Categories have no slug column, so they're matched
 * by name, ignoring case. Categories added later in admin fall back to the
 * neutral header gradient.
 */

export type CategoryTheme = {
  /** Solid swatch, e.g. a chip or dot. */
  swatch: string;
  /** Single-color gradient for product tiles and placeholders. */
  gradient: string;
};

const CATEGORY_THEMES: Record<string, CategoryTheme> = {
  lips: { swatch: "bg-rose", gradient: "bg-gradient-rose" },
  face: { swatch: "bg-powder", gradient: "bg-gradient-powder" },
  skin: { swatch: "bg-sage", gradient: "bg-gradient-sage" },
};

const FALLBACK_THEME: CategoryTheme = { swatch: "bg-muted", gradient: "bg-gradient-header" };

/** The design lists categories as Lips, Face, Skin. Others follow alphabetically. */
const CATEGORY_ORDER = ["lips", "face", "skin"];

export function categoryKey(categoryName: string): string {
  return categoryName.trim().toLowerCase();
}

export function categoryTheme(categoryName: string | null | undefined): CategoryTheme {
  if (!categoryName) return FALLBACK_THEME;
  return CATEGORY_THEMES[categoryKey(categoryName)] ?? FALLBACK_THEME;
}

export function sortCategories<T extends { name: string }>(categories: readonly T[]): T[] {
  const rank = (category: T) => {
    const position = CATEGORY_ORDER.indexOf(categoryKey(category.name));
    return position === -1 ? CATEGORY_ORDER.length : position;
  };
  return [...categories].sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}
