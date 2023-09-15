export interface LoginPayload {
  username: string;
  password: string;
}

export type RequestLoginType = Partial<Record<"Payload", LoginPayload>>;

export interface RefreshTokenPayload {
  refreshToken: string;
}

export type RequestRefreshTokenType = Partial<Record<"Payload", RefreshTokenPayload>>;

export interface LogoutPayload {
  refreshToken: string;
}

export type RequestLogoutType = Partial<Record<"Payload", LogoutPayload>>;
