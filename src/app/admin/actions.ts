"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginOwner, logoutOwner, requireOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveProductImage } from "@/lib/upload";
import { incrementStock, validateAndDecrementInTx } from "@/lib/stock";

function menuRedirect(path: string, error?: string) {
  redirect(error ? `${path}?error=${error}` : path);
}

export async function loginAction(formData: FormData) {
  const pin = String(formData.get("pin") || "");
  const ok = await loginOwner(pin);
  if (!ok) return { error: "Wrong PIN. Try again." };
  redirect("/admin");
}

export async function logoutAction() {
  await logoutOwner();
  redirect("/admin/login");
}

// --- Products ---

export async function saveProduct(formData: FormData) {
  await requireOwner();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const packSize = String(formData.get("packSize") || "").trim();
  const priceRands = parseFloat(String(formData.get("price") || "0"));
  const visible = formData.get("visible") === "on";
  const trackStock = formData.get("trackStock") === "on";
  const stock = Math.max(0, parseInt(String(formData.get("stock") || "0"), 10) || 0);
  const existingImageUrl =
    String(formData.get("existingImageUrl") || "").trim() || null;
  const clearImage = formData.get("clearImage") === "1";
  const imageFile = formData.get("image");

  let imageUrl: string | null = clearImage ? null : existingImageUrl;

  const returnPath = id ? `/admin/menu/${id}` : "/admin/menu/new";

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imageUrl = await saveProductImage(imageFile);
    } catch {
      menuRedirect(returnPath, "image");
    }
  }

  if (!name || priceRands <= 0) {
    menuRedirect(returnPath, "validation");
  }

  const price = Math.round(priceRands * 100);

  if (id) {
    await prisma.product.update({
      where: { id },
      data: { name, packSize, price, visible, trackStock, stock, imageUrl },
    });
  } else {
    const maxOrder = await prisma.product.aggregate({ _max: { sortOrder: true } });
    await prisma.product.create({
      data: {
        name,
        packSize,
        price,
        visible,
        trackStock,
        stock,
        imageUrl,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      },
    });
  }

  revalidatePath("/order");
  revalidatePath("/admin/menu");
  redirect("/admin/menu");
}

export async function toggleProductVisibility(productId: string) {
  "use server";
  await requireOwner();
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;
  await prisma.product.update({
    where: { id: productId },
    data: { visible: !product.visible },
  });
  revalidatePath("/order");
  revalidatePath("/admin/menu");
}

export async function toggleProductVisibilityAction(formData: FormData) {
  const productId = String(formData.get("productId") || "");
  if (productId) await toggleProductVisibility(productId);
}

export async function adjustStockAction(productId: string, delta: number) {
  await requireOwner();
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;

  const newStock = Math.max(0, product.stock + delta);
  await prisma.product.update({
    where: { id: productId },
    data: { trackStock: true, stock: newStock },
  });

  revalidatePath("/order");
  revalidatePath("/admin/menu");
  revalidatePath("/admin/owing");
}

export async function setStockAction(formData: FormData) {
  await requireOwner();
  const productId = String(formData.get("productId") || "");
  const stock = Math.max(0, parseInt(String(formData.get("stock") || "0"), 10) || 0);
  if (!productId) return;

  await prisma.product.update({
    where: { id: productId },
    data: { trackStock: true, stock },
  });

  revalidatePath("/order");
  revalidatePath("/admin/menu");
  revalidatePath("/admin/owing");
}

// --- Shops ---

export async function saveShop(formData: FormData) {
  await requireOwner();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const contact = String(formData.get("contact") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const area = String(formData.get("area") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!name) redirect("/admin/shops");

  if (id) {
    await prisma.shop.update({
      where: { id },
      data: { name, contact, phone, area, notes },
    });
  } else {
    await prisma.shop.create({ data: { name, contact, phone, area, notes } });
  }

  revalidatePath("/admin/shops");
  redirect("/admin/shops");
}

// --- Consignment ---

export async function createConsignmentDrop(formData: FormData) {
  await requireOwner();

  const shopId = String(formData.get("shopId") || "");
  const note = String(formData.get("note") || "").trim();
  const itemsJson = String(formData.get("items") || "[]");

  if (!shopId) return { error: "Select a shop." };

  let items: { productId: string; quantity: number }[];
  try {
    items = JSON.parse(itemsJson);
  } catch {
    return { error: "Invalid items." };
  }

  const validItems = items.filter((i) => i.quantity > 0);
  if (validItems.length === 0) return { error: "Add at least one product." };

  try {
    await prisma.$transaction(async (tx) => {
      const stockResult = await validateAndDecrementInTx(tx, validItems);
      if (!stockResult.ok) {
        throw new Error(stockResult.error);
      }

      await tx.consignmentDrop.create({
        data: {
          shopId,
          note,
          lines: {
            create: validItems.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
            })),
          },
        },
      });
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not record drop.";
    return { error: message };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/owing");
  revalidatePath("/admin/shops");
  revalidatePath("/admin/menu");
  revalidatePath("/order");
  redirect("/admin");
}

// --- Sales ---

export async function createSale(formData: FormData) {
  await requireOwner();

  const shopId = String(formData.get("shopId") || "");
  const paymentMethod = String(formData.get("paymentMethod") || "cash");
  const paid = formData.get("paid") === "on";
  const note = String(formData.get("note") || "").trim();
  const itemsJson = String(formData.get("items") || "[]");

  if (!shopId) return { error: "Select a shop." };

  let items: { productId: string; quantity: number }[];
  try {
    items = JSON.parse(itemsJson);
  } catch {
    return { error: "Invalid items." };
  }

  const validItems = items.filter((i) => i.quantity > 0);
  if (validItems.length === 0) return { error: "Add at least one product." };

  const products = await prisma.product.findMany({
    where: { id: { in: validItems.map((i) => i.productId) } },
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

  await prisma.sale.create({
    data: {
      shopId,
      total,
      paymentMethod,
      paid,
      note,
      lines: { create: lines },
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/owing");
  revalidatePath("/admin/shops");
  redirect("/admin");
}

// --- Orders ---

export async function deliverOrderPaid(orderId: string) {
  await requireOwner();
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "delivered",
      isConsignment: false,
      paid: true,
      paidAt: new Date(),
    },
  });
  revalidateOrderPaths();
}

export async function approveOrderConsignment(orderId: string) {
  await requireOwner();
  const now = new Date();
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "consignment",
      isConsignment: true,
      consignmentStartedAt: now,
      paid: false,
      paidAt: null,
    },
  });
  revalidateOrderPaths();
}

export async function markOrderPaid(orderId: string) {
  await requireOwner();
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "paid",
      paid: true,
      paidAt: new Date(),
    },
  });
  revalidateOrderPaths();
}

export async function markSalePaid(saleId: string) {
  await requireOwner();
  await prisma.sale.update({
    where: { id: saleId },
    data: { paid: true },
  });
  revalidatePath("/admin/owing");
  revalidatePath("/admin");
  revalidatePath("/admin/shops");
}

export async function recordOrderReminder(orderId: string) {
  await requireOwner();
  await prisma.order.update({
    where: { id: orderId },
    data: { lastReminderAt: new Date() },
  });
  revalidateOrderPaths();
}

function revalidateOrderPaths() {
  revalidatePath("/admin/orders");
  revalidatePath("/admin/menu");
  revalidatePath("/admin/owing");
  revalidatePath("/admin");
  revalidatePath("/order");
}

export async function updateOrderStatus(orderId: string, status: string) {
  await requireOwner();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { lines: true },
  });
  if (!order) return;

  const wasCancelled = order.status === "cancelled";
  const willCancel = status === "cancelled";

  await prisma.order.update({ where: { id: orderId }, data: { status } });

  if (!wasCancelled && willCancel) {
    await incrementStock(
      order.lines.map((l) => ({ productId: l.productId, quantity: l.quantity }))
    );
  }

  revalidateOrderPaths();
}
