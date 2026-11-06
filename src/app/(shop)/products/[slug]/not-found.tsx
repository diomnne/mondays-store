import Link from "next/link";

import { SHOP_NAV_LINKS } from "@/components/shop/nav-links";
import { Button } from "@/components/ui/button";

/** Shown for unknown slugs and for products that are inactive. */
export default function ProductNotFound() {
  const categoryLinks = SHOP_NAV_LINKS.filter((link) => link.href !== "/products");

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-5 px-4 py-20 text-center">
      <h1 className="text-[clamp(2.25rem,6vw,3.5rem)] leading-tight">This one&apos;s off the shelf.</h1>
      <p className="text-lead text-muted-foreground">
        It may have been retired, or the link isn&apos;t quite right. Either way, it can&apos;t be ordered.
      </p>
      <Button asChild>
        <Link href="/products">Back to the shop</Link>
      </Button>
      <nav aria-label="Browse by category">
        <ul className="flex flex-wrap justify-center gap-2">
          {categoryLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex min-h-11 items-center rounded-full border bg-card px-5 font-medium hover:border-ink/40"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
