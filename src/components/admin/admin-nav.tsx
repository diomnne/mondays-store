"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboardIcon, PackageIcon, ReceiptTextIcon, TagsIcon, UsersIcon } from "lucide-react";

import { SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const ADMIN_NAV_LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboardIcon },
  { href: "/admin/products", label: "Products", icon: PackageIcon },
  { href: "/admin/categories", label: "Categories", icon: TagsIcon },
  { href: "/admin/orders", label: "Orders", icon: ReceiptTextIcon },
  { href: "/admin/customers", label: "Customers", icon: UsersIcon },
] as const;

/** Overview matches /admin exactly; the others also match their sub-pages. */
function isCurrent(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Admin navigation with the current page highlighted. `inSheet` closes the mobile menu on click. */
export function AdminNav({ inSheet = false }: { inSheet?: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin">
      <ul className="flex flex-col gap-1">
        {ADMIN_NAV_LINKS.map(({ href, label, icon: Icon }) => {
          const current = isCurrent(pathname, href);
          const link = (
            <Link
              href={href}
              aria-current={current ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-full px-4 font-medium transition-colors",
                current ? "bg-ink text-paper" : "text-foreground hover:bg-ink/5",
              )}
            >
              <Icon aria-hidden="true" className="size-4" />
              {label}
            </Link>
          );
          return <li key={href}>{inSheet ? <SheetClose asChild>{link}</SheetClose> : link}</li>;
        })}
      </ul>
    </nav>
  );
}
