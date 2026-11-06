import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  // Storefront pages check whether each product image exists before rendering
  // it (lib/data/product-image.ts). On Vercel, public/ files aren't in the
  // server bundle unless traced in, so include the product images.
  outputFileTracingIncludes: {
    "/**": ["./public/products/**/*"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
