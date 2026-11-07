import Link from "next/link";
import { MenuIcon } from "lucide-react";

import { Wordmark } from "@/components/shared/wordmark";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { CartNavLink } from "./cart-nav-link";
import { SHOP_NAV_LINKS } from "./nav-links";

/**
 * Floating glass nav pill. Desktop shows the links inline; below `md` they
 * move into a sheet opened from the menu button.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-3 z-40 mx-auto w-full max-w-7xl px-4 pt-3 sm:px-6">
      <nav
        aria-label="Main"
        className="glass flex items-center justify-between gap-2 rounded-full py-1.5 pr-1.5 pl-5 shadow-sm"
      >
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-full text-[1.75rem]"
          aria-label="Mondays home"
        >
          <Wordmark />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {SHOP_NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex min-h-11 items-center rounded-full px-4 font-medium transition-colors hover:bg-ink/5"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <CartNavLink />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <MenuIcon aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,85vw)]">
              <SheetHeader className="px-6 pt-6">
                <SheetTitle className="text-[1.75rem] lowercase">mondays</SheetTitle>
                <SheetDescription>Browse the shop.</SheetDescription>
              </SheetHeader>
              <ul className="flex flex-col gap-1 px-3">
                {SHOP_NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <SheetClose asChild>
                      <Link
                        href={link.href}
                        className="flex min-h-11 items-center rounded-full px-4 text-lead font-medium hover:bg-ink/5"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  </li>
                ))}
                <li>
                  <SheetClose asChild>
                    <Link
                      href="/cart"
                      className="flex min-h-11 items-center rounded-full px-4 text-lead font-medium hover:bg-ink/5"
                    >
                      Cart
                    </Link>
                  </SheetClose>
                </li>
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
