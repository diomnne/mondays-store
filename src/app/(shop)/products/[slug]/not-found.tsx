import { ProductUnavailable } from "@/components/shop/unavailable-messages";

/** Backstop for the page's own notFound(); the proxy normally catches these first. */
export default function ProductNotFound() {
  return <ProductUnavailable />;
}
