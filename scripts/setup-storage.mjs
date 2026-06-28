import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "product-images";

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: existing } = await supabase.storage.getBucket(bucket);
if (existing) {
  console.log(`Bucket "${bucket}" already exists.`);
  process.exit(0);
}

const { error } = await supabase.storage.createBucket(bucket, { public: true });
if (error) {
  console.error("Failed to create bucket:", error.message);
  process.exit(1);
}

console.log(`Created public bucket "${bucket}".`);
