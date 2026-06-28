"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { customerMenuProductFilter } from "@/lib/stock-utils";
import { validateAndDecrementInTx } from "@/lib/stock";
import { requireBusinessBySlug } from "@/lib/tenant";
import { tenantAdminPath, tenantOrderPath } from "@/lib/paths";

export async function createOrder(formData: FormData) {
  const slug = String(formData.get("slug") || "").trim();
  if (!slug) return { error: "Invalid business." };

  const business = await requireBusinessBySlug(slug);
  const businessId = business.id;

  const customerName = String(formData.get("customerName") || "").trim();
  const customerPhone = String(formData.get("customerPhone") || "").trim();
  const area = String(formData.get("area") || "").trim();
  const note = String(formData.get("note") || "").trim();
  const paymentMethod = String(formData.get("paymentMethod") || "cash");
  const itemsJson = String(formData.get("items") || "[]");

  if (!customerName || !customerPhone || !area) {
    return { error: "Please fill in your name, phone, and area." };
  }

  let items: { productId: string; quantity: number }[];
  try {
    items = JSON.parse(itemsJson);
  } catch {
    return { error: "Invalid order items." };
  }

  const validItems = items.filter((i) => i.quantity > 0);
  if (validItems.length === 0) {
    return { error: "Please add at least one product." };
  }

  const products = await prisma.product.findMany({
    where: {
      businessId,
      id: { in: validItems.map((i) => i.productId) },
      ...customerMenuProductFilter,
    },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));
  let total = 0;
  const lines = validItems
    .map((item) => {
      const product = productMap.get(item.productId);
      if (!product) return null;
      total += product.price * item.quantity;
      return {
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    })
    .filter(Boolean) as { productId: string; quantity: number; unitPrice: number }[];

  if (lines.length === 0) {
    return { error: "No valid products in order." };
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const stockResult = await validateAndDecrementInTx(tx, validItems);
      if (!stockResult.ok) {
        throw new Error(stockResult.error);
      }

      return tx.order.create({
        data: {
          businessId,
          customerName,
          customerPhone,
          area,
          note,
          paymentMethod,
          total,
          lines: { create: lines },
        },
      });
    });

    revalidatePath(tenantOrderPath(slug));
    revalidatePath(tenantAdminPath(slug));
    revalidatePath(tenantAdminPath(slug, "orders"));
    revalidatePath(tenantAdminPath(slug, "menu"));
    revalidatePath(tenantAdminPath(slug, "owing"));

    return { success: true, orderId: order.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not place order.";
    return { error: message };
  }
}
