import bcrypt from "bcryptjs";

export async function hashOwnerPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function verifyOwnerPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}
