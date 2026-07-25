import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';
import { MailService } from '../../infrastructure/mail/mail.service';
import { UserRepository } from '../../domain/user/user.repository';
import {
  generateResetToken,
  hashSecret,
} from './auth-secrets';

const RESET_TTL_MS = 60 * 60 * 1000;

export class ForgotPasswordUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  /** Always succeeds to avoid account enumeration. */
  async execute(input: { email: string }): Promise<{ ok: true }> {
    const email = input.email?.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      return { ok: true };
    }

    const user = await this.users.findByEmail(email);
    if (!user) {
      return { ok: true };
    }

    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = generateResetToken();
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashSecret(token),
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      },
    });

    await this.mail.sendPasswordReset({
      to: user.email,
      username: user.username,
      token,
    });

    return { ok: true };
  }
}
