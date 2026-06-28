import { businessConfig } from "./config";

export function formatPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("27")) return digits;
  if (digits.startsWith("0")) return `27${digits.slice(1)}`;
  return digits;
}

export function buildPaymentReminderMessage(opts: {
  customerName: string;
  totalFormatted: string;
  daysOnConsignment: number;
}): string {
  return (
    `Hi ${opts.customerName}, this is ${businessConfig.name}. ` +
    `Friendly reminder: your order of ${opts.totalFormatted} has been on consignment for ${opts.daysOnConsignment} day${opts.daysOnConsignment !== 1 ? "s" : ""}. ` +
    `Please arrange payment when you can. Thank you!`
  );
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const waPhone = formatPhoneForWhatsApp(phone);
  return `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
}

export function daysSince(date: Date): number {
  const ms = Date.now() - date.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}
