import { OrderUnavailable } from "@/components/shop/unavailable-messages";

/** Backstop for the page's own notFound(); the proxy normally catches these first. */
export default function OrderNotFound() {
  return <OrderUnavailable />;
}
