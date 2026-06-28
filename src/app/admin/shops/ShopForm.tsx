"use client";

import { BigButton } from "@/components/ui";
import { saveShop } from "../actions";

type Shop = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  area: string;
  notes: string;
};

export function ShopForm({ shop }: { shop?: Shop }) {
  return (
    <form action={saveShop} className="space-y-4 p-4">
      {shop?.id && <input type="hidden" name="id" value={shop.id} />}

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Shop name</label>
        <input
          name="name"
          required
          defaultValue={shop?.name}
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
          placeholder="e.g. Joe's Spaza"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Contact person</label>
        <input
          name="contact"
          defaultValue={shop?.contact}
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Phone</label>
        <input
          name="phone"
          type="tel"
          defaultValue={shop?.phone}
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Area</label>
        <input
          name="area"
          defaultValue={shop?.area}
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
          placeholder="e.g. Main Rd, Tembisa"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Notes</label>
        <input
          name="notes"
          defaultValue={shop?.notes}
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3"
        />
      </div>

      <BigButton type="submit" variant="primary">
        {shop ? "Save shop" : "Add shop"}
      </BigButton>
    </form>
  );
}
