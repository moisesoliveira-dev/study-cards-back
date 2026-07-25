import { createHash, randomBytes, randomInt } from 'crypto';

export function hashSecret(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function generateVerificationCode(): string {
  return String(randomInt(100000, 1000000));
}

export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}
