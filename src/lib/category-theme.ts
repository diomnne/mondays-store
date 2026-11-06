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

export function categoryTheme(categoryName: string | null | undefined): CategoryTheme {
  if (!categoryName) return FALLBACK_THEME;
  return CATEGORY_THEMES[categoryName.trim().toLowerCase()] ?? FALLBACK_THEME;
}
