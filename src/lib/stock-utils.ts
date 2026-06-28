export function isInStock(product: { trackStock: boolean; stock: number }): boolean {
  return !product.trackStock || product.stock > 0;
}

export function maxOrderQuantity(product: { trackStock: boolean; stock: number }): number {
  if (!product.trackStock) return 999;
  return Math.max(0, product.stock);
}

/** Products shown on the public order page */
export const customerMenuProductFilter = {
  visible: true,
  OR: [{ trackStock: false }, { stock: { gt: 0 } }],
};
