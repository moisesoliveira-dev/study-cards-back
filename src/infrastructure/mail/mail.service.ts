import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

type MailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private readonly from: string;
  readonly appUrl: string;

  constructor(config: ConfigService) {
    this.appUrl = (
      config.get<string>('APP_URL') ?? 'http://localhost:5173'
    ).replace(/\/$/, '');
    const host = config.get<string>('SMTP_HOST') ?? '';
    const user = config.get<string>('SMTP_USER') ?? '';
    const pass = config.get<string>('SMTP_PASS') ?? '';
    this.from =
      config.get<string>('SMTP_FROM') ??
      (user ? `Study Cards <${user}>` : 'Study Cards <noreply@studycards.app>');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(config.get('SMTP_PORT') ?? 587),
        secure: config.get('SMTP_SECURE') === 'true',
        auth: { user, pass },
      });
      this.logger.log(`SMTP pronto (${host} como ${user})`);
    } else {
      this.logger.warn(
        'SMTP não configurado — e-mails serão apenas registrados no log.',
      );
    }
  }

  async sendVerificationCode(input: {
    to: string;
    username: string;
    code: string;
  }) {
    const { to, username, code } = input;
    await this.send({
      to,
      subject: `${code} · confirme seu e-mail no Study Cards`,
      text: `Olá @${username}!\n\nSeu código de verificação é: ${code}\nEle expira em 15 minutos.\n\nSe você não criou uma conta, ignore este e-mail.`,
      html: this.shell({
        eyebrow: 'Verificação de e-mail',
        title: `Olá, @${username}`,
        body: `
          <p style="margin:0 0 18px;color:#4a4843;font-size:15px;line-height:1.55">
            Use o código abaixo para concluir seu cadastro no Study Cards.
            Ele vale por <strong>15 minutos</strong>.
          </p>
          <div style="margin:24px 0;padding:18px 16px;border-radius:14px;background:#f0efeb;text-align:center;letter-spacing:0.35em;font-size:28px;font-weight:700;color:#1a1917">
            ${code}
          </div>
          <p style="margin:0;color:#8a8680;font-size:13px;line-height:1.5">
            Se você não pediu este código, pode ignorar este e-mail com segurança.
          </p>
        `,
      }),
    });
  }

  async sendPasswordReset(input: { to: string; username: string; token: string }) {
    const { to, username, token } = input;
    const link = `${this.appUrl}/reset-password?token=${encodeURIComponent(token)}`;
    await this.send({
      to,
      subject: 'Redefina sua senha · Study Cards',
      text: `Olá @${username}!\n\nPara redefinir sua senha, abra este link (válido por 1 hora):\n${link}\n\nSe você não pediu isso, ignore este e-mail.`,
      html: this.shell({
        eyebrow: 'Recuperação de senha',
        title: `Olá, @${username}`,
        body: `
          <p style="margin:0 0 18px;color:#4a4843;font-size:15px;line-height:1.55">
            Recebemos um pedido para redefinir a senha da sua conta.
            O link abaixo vale por <strong>1 hora</strong>.
          </p>
          <p style="margin:28px 0;text-align:center">
            <a href="${link}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#1a1917;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px">
              Redefinir senha
            </a>
          </p>
          <p style="margin:0 0 10px;color:#8a8680;font-size:12px;line-height:1.5;word-break:break-all">
            Ou copie e cole no navegador:<br/>${link}
          </p>
          <p style="margin:0;color:#8a8680;font-size:13px;line-height:1.5">
            Se você não solicitou a troca, ignore este e-mail — sua senha permanece a mesma.
          </p>
        `,
      }),
    });
  }

  private shell(input: { eyebrow: string; title: string; body: string }) {
    return `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;padding:0;background:#f7f7f5;font-family:Georgia,'Times New Roman',serif">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f7f5;padding:32px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border:1px solid #e5e4df;border-radius:18px;overflow:hidden">
          <tr>
            <td style="padding:22px 28px;background:linear-gradient(135deg,#1a1917,#3a3833);color:#f3f1ea">
              <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;opacity:.72;font-family:Inter,Arial,sans-serif">Study Cards</div>
              <div style="margin-top:6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:.85;font-family:Inter,Arial,sans-serif">${input.eyebrow}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px">
              <h1 style="margin:0 0 14px;font-size:26px;line-height:1.2;color:#1a1917;font-weight:600">${input.title}</h1>
              ${input.body}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 22px;border-top:1px solid #efeee9;color:#8a8680;font-size:12px;font-family:Inter,Arial,sans-serif">
              Study Cards · seu ambiente de estudo pessoal
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  private async send(payload: MailPayload) {
    if (!this.transporter) {
      this.logger.log(
        `[dev-mail] to=${payload.to} subject=${payload.subject}\n${payload.text}`,
      );
      return;
    }
    await this.transporter.sendMail({
      from: this.from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });
  }
}
