"use client";

import { useRef, useState } from "react";
import { BigButton } from "@/components/ui";
import { saveProduct } from "../actions";

type ProductData = {
  id?: string;
  name: string;
  packSize: string;
  price: number;
  visible: boolean;
  trackStock: boolean;
  stock: number;
  imageUrl: string;
};

export function ProductForm({ product }: { product?: ProductData }) {
  const isEdit = !!product?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(product?.imageUrl || null);
  const [newFile, setNewFile] = useState(false);
  const [removed, setRemoved] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewFile(true);
    setRemoved(false);
    setPreview(URL.createObjectURL(file));
  }

  function clearImage() {
    setPreview(null);
    setNewFile(false);
    setRemoved(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form action={saveProduct} encType="multipart/form-data" className="space-y-4 p-4">
      {product?.id && <input type="hidden" name="id" value={product.id} />}
      {preview && !newFile && !removed && (
        <input type="hidden" name="existingImageUrl" value={preview} />
      )}
      {removed && <input type="hidden" name="clearImage" value="1" />}

      <div>
        <label className="mb-2 block text-sm font-semibold text-gray-700">
          Product photo
        </label>

        <div className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white">
          <div className="flex aspect-video items-center justify-center bg-red-50">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Product preview" className="h-full w-full object-cover" />
            ) : (
              <div className="text-center text-gray-400">
                <span className="text-5xl">🥩</span>
                <p className="mt-2 text-sm">No photo yet</p>
              </div>
            )}
          </div>

          <div className="space-y-2 p-3">
            <input
              ref={fileInputRef}
              type="file"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Product photo"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl bg-hethu-red py-4 text-center text-lg font-bold text-white"
            >
              📷 Add photo
            </button>
            <p className="text-center text-xs text-gray-400">
              Tap to take a photo or pick from gallery
            </p>

            {preview && (
              <button
                type="button"
                onClick={clearImage}
                className="w-full py-2 text-center text-sm text-gray-400"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Product name</label>
        <input
          name="name"
          required
          defaultValue={product?.name}
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
          placeholder="e.g. Cheese Russians"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Pack size</label>
        <input
          name="packSize"
          defaultValue={product?.packSize}
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
          placeholder="e.g. 10 pack, 5kg"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Price (Rands)</label>
        <input
          name="price"
          type="number"
          min="1"
          step="1"
          required
          defaultValue={product?.price}
          className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
          placeholder="e.g. 130"
        />
      </div>

      <div className="rounded-2xl border-2 border-gray-200 bg-white p-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="trackStock"
            defaultChecked={product?.trackStock ?? false}
            className="h-5 w-5"
          />
          <span className="font-semibold text-gray-700">Track stock levels</span>
        </label>
        <p className="mt-1 text-xs text-gray-500">
          When on, customers can only order what you have in stock
        </p>
        <div className="mt-3">
          <label className="mb-1 block text-sm font-semibold text-gray-700">
            Packs in stock
          </label>
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.stock ?? 0}
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-xl font-bold"
            placeholder="e.g. 20"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-xl bg-white p-4">
        <input
          type="checkbox"
          name="visible"
          defaultChecked={product?.visible ?? true}
          className="h-5 w-5"
        />
        <span className="font-semibold text-gray-700">Show on customer menu</span>
      </label>

      <BigButton type="submit" variant="primary">
        {isEdit ? "Save changes" : "Add product"}
      </BigButton>
    </form>
  );
}
