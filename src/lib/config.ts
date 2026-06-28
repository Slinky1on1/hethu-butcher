import { SessionOptions } from "iron-session";

export interface SessionData {
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "complex_password_at_least_32_characters_long",
  cookieName: "hethu_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

export function formatCurrency(cents: number): string {
  return `R${(cents / 100).toFixed(0)}`;
}

export function priceToCents(rands: number): number {
  return Math.round(rands * 100);
}

export function centsToRands(cents: number): number {
  return cents / 100;
}

export const businessConfig = {
  name: process.env.NEXT_PUBLIC_BUSINESS_NAME || "Hethu Mobile Butcher",
  phone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || "0746410088",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "27746410088",
  bank: {
    name: process.env.NEXT_PUBLIC_BANK_NAME || "Your Bank",
    accountName: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME || "Hethu Mobile Butcher",
    accountNumber: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || "0000000000",
    branch: process.env.NEXT_PUBLIC_BANK_BRANCH || "000000",
  },
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};
