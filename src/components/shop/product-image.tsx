import Image from "next/image";

import { categoryTheme } from "@/lib/category-theme";
import { cn } from "@/lib/utils";

type ProductImageProps = {
  /** Resolved image path, or null to show the placeholder. */
  src: string | null;
  name: string;
  categoryName: string | null | undefined;
  /** Passed to next/image so the right size is downloaded. */
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * Fills its (relatively positioned) parent with the product photo, or with a
 * category-gradient placeholder showing the product's last word ("Tint").
 */
export function ProductImage({ src, name, categoryName, sizes, priority, className }: ProductImageProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }

  const label = name.trim().split(/\s+/).at(-1) ?? name;
  return (
    <div
      role="img"
      aria-label={`${name} (photo coming soon)`}
      className={cn(
        "absolute inset-0 flex items-center justify-center",
        categoryTheme(categoryName).gradient,
        className,
      )}
    >
      <span aria-hidden="true" className="font-heading text-[clamp(1.75rem,8cqi,4rem)] text-ink/55 lowercase">
        {label}
      </span>
    </div>
  );
}
