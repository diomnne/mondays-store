import { notFound } from "next/navigation";

/**
 * Target of the proxy's rewrite for unknown order ids.
 * Calling notFound() while the page is prerendered makes it a static page
 * that is always served with a real 404 status. See src/proxy.ts.
 */
export default function UnavailableOrderPage() {
  notFound();
}
