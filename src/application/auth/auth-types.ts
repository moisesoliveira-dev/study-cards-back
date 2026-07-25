import { User } from '../../domain/user/user.entity';

export type AuthTokenPayload = {
  sub: string;
  email: string;
};

export type AuthUserView = {
  id: string;
  email: string;
  username: string;
  name: string | null;
};

export type AuthResult = {
  accessToken: string;
  user: AuthUserView;
};

export type TokenSigner = {
  sign(
    payload: AuthTokenPayload,
    options?: { expiresInSeconds?: number },
  ): Promise<string>;
};

export function toAuthUserView(user: User): AuthUserView {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
  };
}
