import Link from "next/link";

import { SHOP_NAV_LINKS } from "./nav-links";

// Social links point at the platforms' home pages: Mondays has no real accounts.
const SOCIAL_LINKS = [
  { href: "https://www.instagram.com/", label: "Instagram" },
  { href: "https://www.tiktok.com/", label: "TikTok" },
  { href: "https://www.facebook.com/", label: "Facebook" },
] as const;

const linkClass =
  "inline-flex min-h-11 items-center underline-offset-4 hover:underline focus-visible:outline-paper";

/** Rounded ink card with link columns, fictional contact details, and a cropped wordmark. */
export function SiteFooter() {
  return (
    <footer className="mx-auto mt-16 w-full max-w-7xl px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="overflow-hidden rounded-footer bg-ink text-paper">
        <div className="grid gap-10 px-6 pt-10 sm:grid-cols-2 sm:px-10 sm:pt-12 lg:grid-cols-4">
          <div className="space-y-3">
            <h2 className="text-title">Easy on the face. Easy on the week.</h2>
            <p className="text-paper/80">Makeup and skincare for ordinary days.</p>
          </div>

          <nav aria-label="Footer shop links">
            <h2 className="mb-2 font-sans text-caption font-medium tracking-wide text-paper/80">Shop</h2>
            <ul>
              {SHOP_NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/cart" className={linkClass}>
                  Cart
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h2 className="mb-2 font-sans text-caption font-medium tracking-wide text-paper/80">
              Contact (fictional)
            </h2>
            <address className="not-italic">
              <ul>
                <li>
                  <a href="mailto:hello@mondays.example" className={linkClass}>
                    hello@mondays.example
                  </a>
                </li>
                <li>
                  <a href="tel:+639000000000" className={linkClass}>
                    +63 900 000 0000
                  </a>
                </li>
                <li className="py-2.5">1 Sample Street, Demo City, Philippines</li>
              </ul>
            </address>
          </div>

          <div>
            <h2 className="mb-2 font-sans text-caption font-medium tracking-wide text-paper/80">
              Follow (no real accounts)
            </h2>
            <ul>
              {SOCIAL_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mx-6 mt-10 border-t border-paper/20 pt-6 text-caption text-paper/80 sm:mx-10">
          Mondays is a fictional store built for a web development assessment. The contact details
          are placeholders, nothing is for sale, and no order will ever ship.
        </p>

        {/* Decorative, so hidden from screen readers. Cropped at the bottom by overflow-hidden. */}
        <p
          aria-hidden="true"
          className="mt-4 -mb-[0.22em] px-4 text-center font-heading text-[min(22vw,16rem)] leading-none lowercase select-none sm:px-8"
        >
          mondays
        </p>
      </div>
    </footer>
  );
}
