import { CartProvider } from "@/components/shop/cart-provider";
import { PromoStrip } from "@/components/shop/promo-strip";
import { SiteFooter } from "@/components/shop/site-footer";
import { SiteHeader } from "@/components/shop/site-header";

/**
 * Customer-facing shell: promo strip, floating nav pill, page, footer card.
 * CartProvider makes the localStorage cart available to every shop page.
 */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-3 focus:text-paper"
      >
        Skip to content
      </a>
      <PromoStrip />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </CartProvider>
  );
}
