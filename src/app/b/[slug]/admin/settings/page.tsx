import { requireOwner } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import { requireBusinessBySlug, toBusinessConfig } from "@/lib/tenant";
import { tenantAdminPath } from "@/lib/paths";
import { saveBusinessSettings } from "../actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await requireOwner(slug);
  const business = await requireBusinessBySlug(slug);
  const config = toBusinessConfig(business);

  return (
    <div className="min-h-screen bg-hethu-cream pb-8">
      <PageHeader
        title="Business settings"
        subtitle={config.name}
        backHref={tenantAdminPath(slug, "more")}
      />

      <form action={saveBusinessSettings} className="space-y-4 p-4">
        <Field label="Business name" name="name" defaultValue={config.name} required />
        <Field label="Phone" name="phone" type="tel" defaultValue={config.phone} />
        <Field label="WhatsApp number" name="whatsapp" defaultValue={config.whatsapp} hint="Digits only, e.g. 27746410088" />

        <p className="pt-2 text-xs font-bold uppercase tracking-wide text-gray-400">Bank details (for EFT)</p>
        <Field label="Bank" name="bankName" defaultValue={config.bank.name} />
        <Field label="Account name" name="bankAccountName" defaultValue={config.bank.accountName} />
        <Field label="Account number" name="bankAccountNumber" defaultValue={config.bank.accountNumber} />
        <Field label="Branch code" name="bankBranch" defaultValue={config.bank.branch} />

        <p className="pt-2 text-xs font-bold uppercase tracking-wide text-gray-400">Security</p>
        <Field
          label="New owner PIN"
          name="newPin"
          type="password"
          inputMode="numeric"
          hint="Leave blank to keep current PIN. Minimum 4 digits."
        />

        <button
          type="submit"
          className="w-full rounded-2xl bg-hethu-red py-4 text-lg font-bold text-white"
        >
          Save settings
        </button>
      </form>

      <p className="px-4 pb-8 text-center text-xs text-gray-400">
        Your order page: {config.appUrl}
      </p>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  hint,
  inputMode,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  hint?: string;
  inputMode?: "numeric" | "tel" | "text";
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-gray-700">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        inputMode={inputMode}
        className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg"
      />
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
