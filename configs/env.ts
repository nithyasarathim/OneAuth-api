import dotenv from "dotenv";
import EnvError from "../errors/env.error";
dotenv.config();

interface Config {
  port: number;
  databaseUrl: string;
  windowMs: number;
  emailServerUrl: string;
  emailServerSecret: string;
  cacheServerUrl: string;
  otpTtl: number;
  verifiedTokenTtl: number;
  clientDomainUrl: string;
  sessionCookieTtl: number;
  CdnPrivateKey: string;
  CdnPublicKey: string;
  CdnPublicUrl: string;
  JwtSecret: string;
  AuthTokenTTL: string;
  AccessTokenTTL: number;
  AllowedClientID: string[];
  AllowedRedirectUrl: string[];
  ClientIdSecret: Map<string, string>;
}

const requireEnv = (value: string): string => {
  const ENV_VALUE = process.env[value];
  if (!ENV_VALUE) {
    throw new EnvError(
      `[CONFIGURATION ERROR]: ${value} is not defined in Environment`,
    );
  }
  return ENV_VALUE;
};

const buildClientSecretMap = (): Map<string, string> => {
  const raw = requireEnv("ONE_AUTH_CLIENT_ID_SECRET");

  const map = new Map<string, string>();

  raw.split(",").forEach((pair) => {
    const [clientId, secret] = pair.split(":");

    if (!clientId || !secret) {
      throw new EnvError(
        "[CONFIGURATION ERROR]: Invalid ONE_AUTH_CLIENT_ID_SECRET format",
      );
    }

    map.set(clientId.trim(), secret.trim());
  });

  return map;
};

const config: Config = {
  port: Number(requireEnv("ONE_AUTH_SERVER_PORT")),
  databaseUrl: requireEnv("ONE_AUTH_DATABASE_SERVER_URL"),
  windowMs: Number(requireEnv("ONE_AUTH_RATE_LIMIT_WINDOW_SIZE")),
  emailServerUrl: requireEnv("ONE_MAIL_SERVER_URL"),
  emailServerSecret: requireEnv("ONE_MAIL_SERVER_SECRET"),
  cacheServerUrl: requireEnv("ONE_AUTH_CACHE_SERVER_URL"),
  otpTtl: Number(requireEnv("ONE_AUTH_OTP_TTL")),
  verifiedTokenTtl: Number(requireEnv("ONE_AUTH_VERIFIED_TOKEN_TTL")),
  clientDomainUrl: requireEnv("ONE_AUTH_CLIENT_DOMAIN_URL"),
  sessionCookieTtl: Number(requireEnv("ONE_AUTH_SESSION_COOKIE_TTL")),
  CdnPublicKey: requireEnv("ONE_AUTH_IMAGE_KIT_PUBLIC_KEY"),
  CdnPrivateKey: requireEnv("ONE_AUTH_IMAGE_KIT_PRIVATE_KEY"),
  CdnPublicUrl: requireEnv("ONE_AUTH_IMAGE_KIT_PUBLIC_URL"),
  AuthTokenTTL: requireEnv("ONE_AUTH_TOKEN_TTL"),
  AccessTokenTTL: Number(requireEnv("ONE_AUTH_ACCESS_TOKEN_TTL")),
  AllowedClientID: requireEnv("ONE_AUTH_ALLOWED_CLIENT_ID").split(","),
  AllowedRedirectUrl: requireEnv("ONE_AUTH_ALLOWED_REDIRECT_URL").split(","),
  JwtSecret: requireEnv("ONE_AUTH_JWT_SECRET"),
  ClientIdSecret: buildClientSecretMap(),
};

export default config;
