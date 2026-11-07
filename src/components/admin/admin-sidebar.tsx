import Link from "next/link";
import { ExternalLinkIcon, MenuIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import { AdminBrand } from "./admin-brand";
import { AdminNav } from "./admin-nav";
import { LogoutButton } from "./logout-button";

/** "Demo admin, simulated login" box with View store and Log out. */
function DemoAccountBox() {
  return (
    <div className="space-y-3 rounded-2xl border border-white/55 bg-paper/70 p-4">
      <div>
        <p className="font-medium">Demo admin</p>
        <p className="text-caption text-muted-foreground">Simulated login. Not secure.</p>
      </div>
      <Button asChild variant="ghost" size="sm" className="w-full">
        <Link href="/" target="_blank" rel="noopener">
          <ExternalLinkIcon aria-hidden="true" />
          View store
          <span className="sr-only"> (opens in a new tab)</span>
        </Link>
      </Button>
      <LogoutButton />
    </div>
  );
}

/**
 * Glass sidebar on large screens; a glass top bar with a sheet menu on small
 * ones. Static (no session read), so it renders instantly; each page checks
 * the session itself.
 */
export function AdminSidebar() {
  return (
    <>
      <aside className="glass fixed inset-y-4 left-4 z-30 hidden w-64 flex-col gap-8 rounded-card p-5 shadow-sm lg:flex">
        <Link href="/admin" aria-label="Mondays admin overview" className="inline-flex min-h-11 items-center">
          <AdminBrand />
        </Link>
        <AdminNav />
        <div className="mt-auto">
          <DemoAccountBox />
        </div>
      </aside>

      <header className="sticky top-3 z-30 mx-3 lg:hidden">
        <div className="glass flex items-center justify-between rounded-full py-1.5 pr-1.5 pl-5 shadow-sm">
          <Link href="/admin" aria-label="Mondays admin overview" className="inline-flex min-h-11 items-center">
            <AdminBrand />
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open admin menu">
                <MenuIcon aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(20rem,85vw)] gap-6 p-5">
              <SheetHeader className="p-0">
                <SheetTitle className="sr-only">Admin menu</SheetTitle>
                <SheetDescription className="sr-only">Navigate the admin dashboard.</SheetDescription>
                <AdminBrand />
              </SheetHeader>
              <AdminNav inSheet />
              <div className="mt-auto">
                <DemoAccountBox />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
