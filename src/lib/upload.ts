import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { getSupabaseAdmin, isSupabaseStorageConfigured } from "./supabase";

const MAX_SIZE = 4 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extensionForMime(type: string): string {
  if (type === "image/jpeg") return "jpg";
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "gif";
}

function validateImage(file: File) {
  if (!file || file.size === 0) {
    throw new Error("No image provided");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("Image must be under 4MB");
  }
  if (!ALLOWED.has(file.type)) {
    throw new Error("Use JPG, PNG, or WebP");
  }
}

async function saveToSupabase(file: File): Promise<string> {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";
  const ext = extensionForMime(file.type);
  const filename = `products/${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const bytes = await file.arrayBuffer();

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).upload(filename, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

async function saveToLocalDisk(file: File): Promise<string> {
  const ext = extensionForMime(file.type);
  const filename = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(uploadDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));

  return `/uploads/products/${filename}`;
}

export async function saveProductImage(file: File): Promise<string> {
  validateImage(file);

  if (isSupabaseStorageConfigured()) {
    return saveToSupabase(file);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Image upload is not configured. Set Supabase storage env vars on Vercel."
    );
  }

  return saveToLocalDisk(file);
}
