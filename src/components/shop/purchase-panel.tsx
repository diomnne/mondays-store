"use client";

import { useState } from "react";

import { AddToCartButton } from "./add-to-cart-button";
import { QuantityStepper } from "./quantity-stepper";

type PurchasePanelProps = {
  productId: string;
  productName: string;
  stock: number;
};

/** Quantity selector plus Add to cart on the details page. */
export function PurchasePanel({ productId, productName, stock }: PurchasePanelProps) {
  const [quantity, setQuantity] = useState(1);

  if (stock <= 0) {
    return (
      <div className="space-y-3">
        <AddToCartButton productId={productId} productName={productName} stock={0} />
        <p className="text-caption text-muted-foreground">Out of stock for now. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <QuantityStepper value={quantity} max={stock} onChange={setQuantity} />
      <AddToCartButton productId={productId} productName={productName} stock={stock} quantity={quantity} />
    </div>
  );
}
