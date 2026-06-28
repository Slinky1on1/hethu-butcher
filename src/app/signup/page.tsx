import Link from "next/link";
import { PageHeader, BigButton } from "@/components/ui";
import { signupAction } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  missing: "Please fill in your business name, email, and phone.",
  email: "Please enter a valid email address.",
  slug: "Please choose a valid business link name (letters, numbers, hyphens).",
  taken: "That business link is already taken. Try a different name.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : null;

  return (
    <div className="min-h-screen bg-hethu-cream">
      <PageHeader
        title="Start your business"
        subtitle="Nexvintrix Connect — 14-day free trial"
        backHref="/"
      />

      <form action={signupAction} className="mx-auto max-w-lg space-y-4 p-4">
        {errorMessage && (
          <p className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-700">{errorMessage}</p>
        )}
        <Field label="Business name *" name="companyName" placeholder="e.g. Joe's Mobile Shop" required />
        <Field
          label="Your link name"
          name="slug"
          placeholder="joes-shop (optional — we generate from name)"
          hint="Your order page will be: yoursite.co.za/b/your-link/order"
        />
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Industry</label>
          <select
            name="industry"
            className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
            defaultValue="general"
          >
            <option value="general">General / other</option>
            <option value="butcher">Butcher / meat</option>
            <option value="food">Food & catering</option>
            <option value="retail">Mobile retail</option>
            <option value="services">Services</option>
          </select>
        </div>
        <Field label="Email *" name="email" type="email" placeholder="you@business.co.za" required />
        <Field label="Phone / WhatsApp *" name="phone" type="tel" placeholder="082 123 4567" required />

        <BigButton type="submit" variant="primary">
          Create my business
        </BigButton>

        <p className="text-center text-xs text-gray-400">
          Already have a business?{" "}
          <Link href="/" className="underline">
            Find your login link
          </Link>
        </p>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  hint,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">{label}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
      />
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
