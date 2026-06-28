const MESSAGES: Record<string, string> = {
  image: "Could not save the photo. Use JPG or PNG under 4MB, then try again.",
  validation: "Enter a product name and price greater than zero.",
};

export function ProductSaveError({ error }: { error?: string }) {
  if (!error || !MESSAGES[error]) return null;

  return (
    <div className="mx-4 mt-4 rounded-xl bg-red-50 p-4 text-center text-sm text-red-700">
      {MESSAGES[error]}
    </div>
  );
}
