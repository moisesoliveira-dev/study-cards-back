import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../infrastructure/persistence/prisma/prisma.service';
import { MailService } from '../../infrastructure/mail/mail.service';
import { UserRepository } from '../../domain/user/user.repository';
import { assertValidUsername } from '../../domain/user/username';
import { assertStrongPassword } from '../../domain/user/password-policy';
import { DomainError } from '../../domain/shared/domain.error';
import {
  generateVerificationCode,
  hashSecret,
} from './auth-secrets';

const CODE_TTL_MS = 15 * 60 * 1000;

export class RegisterUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async execute(input: {
    email: string;
    username: string;
    password: string;
    name?: string | null;
  }): Promise<{ ok: true; email: string }> {
    const email = input.email?.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      throw new DomainError('INVALID_EMAIL', 'Informe um e-mail válido');
    }

    const username = assertValidUsername(input.username ?? '');
    assertStrongPassword(input.password ?? '');

    const existingEmail = await this.users.findByEmail(email);
    if (existingEmail) {
      throw new DomainError('EMAIL_IN_USE', 'Este e-mail já está cadastrado');
    }

    const existingUsername = await this.users.findByUsername(username);
    if (existingUsername) {
      throw new DomainError(
        'USERNAME_IN_USE',
        'Este nome de usuário já está em uso',
      );
    }

    const pendingUsername = await this.prisma.pendingRegistration.findFirst({
      where: {
        username,
        email: { not: email },
        expiresAt: { gt: new Date() },
      },
    });
    if (pendingUsername) {
      throw new DomainError(
        'USERNAME_IN_USE',
        'Este nome de usuário já está em uso',
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const code = generateVerificationCode();
    const codeHash = hashSecret(code);
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);
    const name = input.name?.trim() || null;

    await this.prisma.pendingRegistration.upsert({
      where: { email },
      create: {
        email,
        username,
        passwordHash,
        name,
        codeHash,
        expiresAt,
      },
      update: {
        username,
        passwordHash,
        name,
        codeHash,
        expiresAt,
      },
    });

    await this.mail.sendVerificationCode({ to: email, username, code });

    return { ok: true, email };
  }
}
