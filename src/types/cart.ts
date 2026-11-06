/**
 * What the cart stores in localStorage: product ids and quantities only.
 * Prices and stock are always loaded fresh from the server.
 */
export type CartLine = {
  productId: string;
  quantity: number;
};
