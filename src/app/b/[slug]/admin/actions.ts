"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logoutOwner, getSession } from "@/lib/auth";
import { requireOwnerContext, revalidateTenant } from "@/lib/owner-context";
import { tenantAdminPath, tenantOrderPath } from "@/lib/paths";
import { prisma } from "@/lib/prisma";
import { saveProductImage } from "@/lib/upload";
import { incrementStock, validateAndDecrementInTx } from "@/lib/stock";
import { hashOwnerPin } from "@/lib/pin";

function menuRedirect(slug: string, path: string, error?: string) {
  const full = tenantAdminPath(slug, path);
  redirect(error ? `${full}?error=${error}` : full);
}

export async function logoutAction() {
  const session = await getSession();
  const slug = session.businessSlug || "hethu";
  await logoutOwner();
  redirect(tenantAdminPath(slug, "login"));
}

// --- Settings ---

export async function saveBusinessSettings(formData: FormData) {
  const { businessId, slug } = await requireOwnerContext();

  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const whatsapp = String(formData.get("whatsapp") || "").trim();
  const bankName = String(formData.get("bankName") || "").trim();
  const bankAccountName = String(formData.get("bankAccountName") || "").trim();
  const bankAccountNumber = String(formData.get("bankAccountNumber") || "").trim();
  const bankBranch = String(formData.get("bankBranch") || "").trim();
  const newPin = String(formData.get("newPin") || "").trim();

  if (!name) redirect(tenantAdminPath(slug, "settings"));

  const data: Record<string, string> = {
    name,
    phone,
    whatsapp,
    bankName,
    bankAccountName,
    bankAccountNumber,
    bankBranch,
  };

  if (newPin.length >= 4) {
    await prisma.business.update({
      where: { id: businessId },
      data: { ...data, ownerPinHash: await hashOwnerPin(newPin) },
    });
  } else {
    await prisma.business.update({ where: { id: businessId }, data });
  }

  revalidateTenant(slug, "settings", "more");
  revalidatePath(tenantOrderPath(slug));
  redirect(tenantAdminPath(slug, "settings"));
}

// --- Products ---

export async function saveProduct(formData: FormData) {
  const { businessId, slug } = await requireOwnerContext();

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
  const returnPath = id ? `menu/${id}` : "menu/new";

  if (imageFile instanceof File && imageFile.size > 0) {
    try {
      imageUrl = await saveProductImage(imageFile, businessId);
    } catch {
      menuRedirect(slug, returnPath, "image");
    }
  }

  if (!name || priceRands <= 0) menuRedirect(slug, returnPath, "validation");

  const price = Math.round(priceRands * 100);

  if (id) {
    await prisma.product.updateMany({
      where: { id, businessId },
      data: { name, packSize, price, visible, trackStock, stock, imageUrl },
    });
  } else {
    const maxOrder = await prisma.product.aggregate({
      where: { businessId },
      _max: { sortOrder: true },
    });
    await prisma.product.create({
      data: {
        businessId,
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

  revalidateTenant(slug, "menu");
  redirect(tenantAdminPath(slug, "menu"));
}

export async function toggleProductVisibility(productId: string) {
  const { businessId, slug } = await requireOwnerContext();
  const product = await prisma.product.findFirst({
    where: { id: productId, businessId },
  });
  if (!product) return;
  await prisma.product.update({
    where: { id: productId },
    data: { visible: !product.visible },
  });
  revalidateTenant(slug, "menu");
}

export async function toggleProductVisibilityAction(formData: FormData) {
  const productId = String(formData.get("productId") || "");
  if (productId) await toggleProductVisibility(productId);
}

export async function adjustStockAction(productId: string, delta: number) {
  const { businessId, slug } = await requireOwnerContext();
  const product = await prisma.product.findFirst({
    where: { id: productId, businessId },
  });
  if (!product) return;

  await prisma.product.update({
    where: { id: productId },
    data: { trackStock: true, stock: Math.max(0, product.stock + delta) },
  });

  revalidateTenant(slug, "menu", "owing");
}

export async function setStockAction(formData: FormData) {
  const { businessId, slug } = await requireOwnerContext();
  const productId = String(formData.get("productId") || "");
  const stock = Math.max(0, parseInt(String(formData.get("stock") || "0"), 10) || 0);
  if (!productId) return;

  await prisma.product.updateMany({
    where: { id: productId, businessId },
    data: { trackStock: true, stock },
  });

  revalidateTenant(slug, "menu", "owing");
}

// --- Shops ---

export async function saveShop(formData: FormData) {
  const { businessId, slug } = await requireOwnerContext();

  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const contact = String(formData.get("contact") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const area = String(formData.get("area") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!name) redirect(tenantAdminPath(slug, "shops"));

  if (id) {
    await prisma.shop.updateMany({
      where: { id, businessId },
      data: { name, contact, phone, area, notes },
    });
  } else {
    await prisma.shop.create({
      data: { businessId, name, contact, phone, area, notes },
    });
  }

  revalidateTenant(slug, "shops");
  redirect(tenantAdminPath(slug, "shops"));
}

// --- Consignment ---

export async function createConsignmentDrop(formData: FormData) {
  const { businessId, slug } = await requireOwnerContext();

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
      if (!stockResult.ok) throw new Error(stockResult.error);

      await tx.consignmentDrop.create({
        data: {
          businessId,
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
    return { error: e instanceof Error ? e.message : "Could not record drop." };
  }

  revalidateTenant(slug, "", "owing", "shops", "menu");
  redirect(tenantAdminPath(slug));
}

// --- Sales ---

export async function createSale(formData: FormData) {
  const { businessId, slug } = await requireOwnerContext();

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
    where: { businessId, id: { in: validItems.map((i) => i.productId) } },
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
    data: { shopId, total, paymentMethod, paid, note, lines: { create: lines } },
  });

  revalidateTenant(slug, "", "owing", "shops");
  redirect(tenantAdminPath(slug));
}

// --- Orders ---

function revalidateOrderPaths(slug: string) {
  revalidateTenant(slug, "orders", "menu", "owing");
}

export async function deliverOrderPaid(orderId: string) {
  const { businessId, slug } = await requireOwnerContext();
  await prisma.order.updateMany({
    where: { id: orderId, businessId },
    data: {
      status: "delivered",
      isConsignment: false,
      paid: true,
      paidAt: new Date(),
    },
  });
  revalidateOrderPaths(slug);
}

export async function approveOrderConsignment(orderId: string) {
  const { businessId, slug } = await requireOwnerContext();
  const now = new Date();
  await prisma.order.updateMany({
    where: { id: orderId, businessId },
    data: {
      status: "consignment",
      isConsignment: true,
      consignmentStartedAt: now,
      paid: false,
      paidAt: null,
    },
  });
  revalidateOrderPaths(slug);
}

export async function markOrderPaid(orderId: string) {
  const { businessId, slug } = await requireOwnerContext();
  await prisma.order.updateMany({
    where: { id: orderId, businessId },
    data: { status: "paid", paid: true, paidAt: new Date() },
  });
  revalidateOrderPaths(slug);
}

export async function markSalePaid(saleId: string) {
  const { businessId, slug } = await requireOwnerContext();
  await prisma.sale.updateMany({
    where: { id: saleId, shop: { businessId } },
    data: { paid: true },
  });
  revalidateTenant(slug, "owing", "shops");
}

export async function recordOrderReminder(orderId: string) {
  const { businessId, slug } = await requireOwnerContext();
  await prisma.order.updateMany({
    where: { id: orderId, businessId },
    data: { lastReminderAt: new Date() },
  });
  revalidateOrderPaths(slug);
}

export async function updateOrderStatus(orderId: string, status: string) {
  const { businessId, slug } = await requireOwnerContext();

  const order = await prisma.order.findFirst({
    where: { id: orderId, businessId },
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

  revalidateOrderPaths(slug);
}
