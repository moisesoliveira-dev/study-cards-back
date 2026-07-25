import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';
import { MailService } from '../../infrastructure/mail/mail.service';
import { DomainError } from '../../domain/shared/domain.error';
import {
  generateVerificationCode,
  hashSecret,
} from './auth-secrets';

const CODE_TTL_MS = 15 * 60 * 1000;

export class ResendVerificationCodeUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async execute(input: { email: string }): Promise<{ ok: true }> {
    const email = input.email?.trim().toLowerCase();
    if (!email) {
      throw new DomainError('INVALID_EMAIL', 'Informe um e-mail válido');
    }

    const pending = await this.prisma.pendingRegistration.findUnique({
      where: { email },
    });
    if (!pending) {
      throw new DomainError(
        'PENDING_NOT_FOUND',
        'Não há cadastro pendente para este e-mail',
      );
    }

    const code = generateVerificationCode();
    await this.prisma.pendingRegistration.update({
      where: { email },
      data: {
        codeHash: hashSecret(code),
        expiresAt: new Date(Date.now() + CODE_TTL_MS),
      },
    });

    await this.mail.sendVerificationCode({
      to: email,
      username: pending.username,
      code,
    });

    return { ok: true };
  }
}
