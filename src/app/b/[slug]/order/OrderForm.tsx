"use client";

import { useState } from "react";
import { ProductGrid, ProductItem } from "@/components/ProductGrid";
import { BigButton, PageHeader, formatPrice } from "@/components/ui";
import { createOrder } from "./actions";
import type { BusinessConfig } from "@/lib/tenant";
import { tenantAdminPath } from "@/lib/paths";

export function OrderForm({
  business,
  slug,
  products,
}: {
  business: BusinessConfig;
  slug: string;
  products: ProductItem[];
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [step, setStep] = useState<"shop" | "checkout" | "done">("shop");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "eft">("cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    area: "",
    note: "",
  });
  const [nameError, setNameError] = useState("");

  const cartItems = products
    .filter((p) => (quantities[p.id] || 0) > 0)
    .map((p) => ({ ...p, quantity: quantities[p.id] }));

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  function handleQuantityChange(productId: string, qty: number) {
    const product = products.find((p) => p.id === productId);
    if (product?.trackStock && product.stock !== undefined) {
      qty = Math.min(qty, product.stock);
    }
    setQuantities((prev) => ({ ...prev, [productId]: qty }));
  }

  function goToCheckout() {
    if (!form.customerName.trim()) {
      setNameError(`Please add your name so ${business.name} knows who ordered`);
      return;
    }
    setNameError("");
    setStep("checkout");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData();
    fd.set("customerName", form.customerName);
    fd.set("customerPhone", form.customerPhone);
    fd.set("area", form.area);
    fd.set("note", form.note);
    fd.set("paymentMethod", paymentMethod);
    fd.set("slug", slug);
    fd.set(
      "items",
      JSON.stringify(
        cartItems.map((i) => ({ productId: i.id, quantity: i.quantity }))
      )
    );

    const result = await createOrder(fd);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOrderId(result.orderId || "");
    setStep("done");
  }

  function buildWhatsAppMessage() {
    const lines = cartItems.map(
      (i) => `• ${i.quantity}x ${i.name}${i.packSize ? ` (${i.packSize})` : ""} — ${formatPrice(i.price * i.quantity)}`
    );
    return encodeURIComponent(
      `Hi ${business.name}! I'd like to order:\n\n${lines.join("\n")}\n\nTotal: ${formatPrice(total)}\n\nName: ${form.customerName}\nPhone: ${form.customerPhone}\nArea: ${form.area}\nPayment: ${paymentMethod === "cash" ? "Cash on delivery" : "EFT"}\n${form.note ? `Note: ${form.note}` : ""}`
    );
  }

  if (step === "done") {
    return (
      <div className="min-h-screen bg-hethu-cream">
        <PageHeader title="Order received!" subtitle="We'll be in touch soon" />
        <div className="p-4 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
            ✓
          </div>
          <p className="text-lg text-gray-700">
            Thanks {form.customerName}! Your order has been sent.
          </p>
          {orderId && (
            <p className="mt-2 text-sm text-gray-500">Order ref: {orderId.slice(-8).toUpperCase()}</p>
          )}
          <div className="mt-6 space-y-3">
            <a
              href={`https://wa.me/${business.whatsapp}?text=${buildWhatsAppMessage()}`}
              className="block w-full rounded-2xl bg-green-600 px-6 py-4 text-lg font-bold text-white shadow-lg active:scale-[0.98]"
            >
              Send on WhatsApp
            </a>
            <BigButton
              variant="outline"
              onClick={() => {
                setStep("shop");
                setQuantities({});
                setForm({ customerName: "", customerPhone: "", area: "", note: "" });
              }}
            >
              Place another order
            </BigButton>
          </div>
        </div>
      </div>
    );
  }

  if (step === "checkout") {
    return (
      <div className="min-h-screen bg-hethu-cream pb-32">
        <PageHeader
          title="Your details"
          subtitle={`${itemCount} pack${itemCount !== 1 ? "s" : ""} — ${formatPrice(total)}`}
        />
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div className="rounded-2xl border-2 border-hethu-red bg-white p-4">
            <label className="mb-1 block text-sm font-bold text-hethu-red">
              Your name *
            </label>
            <input
              required
              autoFocus
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-4 text-xl font-semibold"
              placeholder="e.g. John Smith"
            />
            <p className="mt-2 text-xs text-gray-500">
              So {business.name} knows who placed this order
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Phone number *</label>
            <input
              required
              type="tel"
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
              placeholder="e.g. 082 123 4567"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Area / address</label>
            <input
              required
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
              placeholder="Where should we deliver?"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Note (optional)</label>
            <input
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
              placeholder="Preferred day, gate code, etc."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">Payment</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`rounded-xl border-2 px-4 py-3 font-bold ${
                  paymentMethod === "cash"
                    ? "border-hethu-red bg-red-50 text-hethu-red"
                    : "border-gray-200 bg-white"
                }`}
              >
                Cash on delivery
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("eft")}
                className={`rounded-xl border-2 px-4 py-3 font-bold ${
                  paymentMethod === "eft"
                    ? "border-hethu-red bg-red-50 text-hethu-red"
                    : "border-gray-200 bg-white"
                }`}
              >
                EFT
              </button>
            </div>
          </div>

          {paymentMethod === "eft" && (
            <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4 text-sm">
              <p className="font-bold text-blue-900">Bank details</p>
              <p className="mt-2 text-blue-800">Bank: {business.bank.name}</p>
              <p className="text-blue-800">Account: {business.bank.accountName}</p>
              <p className="text-blue-800">Number: {business.bank.accountNumber}</p>
              <p className="text-blue-800">Branch: {business.bank.branch}</p>
              <p className="mt-2 font-semibold text-blue-900">
                Use your phone number as reference
              </p>
            </div>
          )}

          <div className="rounded-xl bg-white p-4">
            <p className="font-bold text-gray-900">Order summary</p>
            {cartItems.map((item) => (
              <div key={item.id} className="mt-2 flex justify-between text-sm text-gray-700">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="mt-3 flex justify-between border-t pt-3 font-bold">
              <span>Total</span>
              <span className="text-hethu-red">{formatPrice(total)}</span>
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 p-3 text-center text-red-700">{error}</p>
          )}

          <BigButton type="submit" variant="primary">
            {loading ? "Sending..." : "Place order"}
          </BigButton>
          <button
            type="button"
            onClick={() => setStep("shop")}
            className="w-full py-2 text-center text-gray-500"
          >
            ← Back to menu
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hethu-cream pb-28">
      <PageHeader
        title={business.name}
        subtitle="Bulk packs · Great prices · We come to you!"
      />
      <div className="px-4 py-2 space-y-2">
        <a
          href={`tel:${business.phone}`}
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-bold text-hethu-red shadow-sm"
        >
          📞 {business.phone}
        </a>

        <div className="rounded-2xl border-2 border-hethu-red bg-white p-4 shadow-sm">
          <label htmlFor="customer-name" className="mb-1 block text-sm font-bold text-hethu-red">
            Your name *
          </label>
          <input
            id="customer-name"
            required
            value={form.customerName}
            onChange={(e) => {
              setForm({ ...form, customerName: e.target.value });
              if (e.target.value.trim()) setNameError("");
            }}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-4 text-xl font-semibold"
            placeholder="Who is ordering?"
          />
          <p className="mt-1 text-xs text-gray-500">
            {business.name} needs your name to know who placed the order
          </p>
          {nameError && (
            <p className="mt-2 rounded-lg bg-red-50 p-2 text-center text-sm text-red-700">
              {nameError}
            </p>
          )}
        </div>
      </div>
      <div className="p-4">
        {products.length === 0 ? (
          <p className="text-center text-gray-500">Menu coming soon...</p>
        ) : (
          <ProductGrid
            products={products}
            quantities={quantities}
            onQuantityChange={handleQuantityChange}
            showStock
          />
        )}
      </div>

      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4 shadow-lg">
          {form.customerName.trim() && (
            <p className="mb-2 text-center text-sm font-semibold text-gray-700">
              Ordering as: <span className="text-hethu-red">{form.customerName}</span>
            </p>
          )}
          <button
            type="button"
            onClick={goToCheckout}
            className="w-full rounded-2xl bg-hethu-red px-6 py-4 text-lg font-bold text-white shadow-lg active:scale-[0.98]"
          >
            Checkout — {itemCount} pack{itemCount !== 1 ? "s" : ""} · {formatPrice(total)}
          </button>
        </div>
      )}

      <p className="pb-24 pt-4 text-center">
        <a href={tenantAdminPath(slug, "login")} className="text-xs text-gray-400">
          Owner login
        </a>
      </p>
    </div>
  );
}
