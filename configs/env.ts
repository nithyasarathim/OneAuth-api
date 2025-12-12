import dotenv from 'dotenv';
import EnvError from '../errors/env.error';
dotenv.config();

interface Config{
    port: number;
    databaseUrl: string;
    windowMs: number;
    emailServerUrl: string;
    emailServerSecret: string;
    cacheServerUrl: string;
    otpTtl: number;
    verifiedTokenTtl: number;
}

const requireEnv=function (value: string) {
    const ENV_VALUE = process.env[value];
    if (!ENV_VALUE) {
        throw new EnvError(`[CONFIGURATION ERROR] : ${value}} is not defined in Environment`);
    }
    return ENV_VALUE;
}

const config: Config={
    port: Number(requireEnv("ONE_AUTH_SERVER_PORT")),
    databaseUrl: requireEnv("ONE_AUTH_DATABASE_SERVER_URL"),
    windowMs: Number(requireEnv("ONE_AUTH_RATE_LIMIT_WINDOW_SIZE")),
    emailServerUrl: requireEnv("ONE_MAIL_SERVER_URL"),
    emailServerSecret: requireEnv("ONE_MAIL_SERVER_SECRET"),
    cacheServerUrl: requireEnv("ONE_AUTH_CACHE_SERVER_URL"),
    otpTtl: Number(requireEnv("ONE_AUTH_OTP_TTL")),
    verifiedTokenTtl:Number(requireEnv("ONE_AUTH_VERIFIED_TOKEN_TTL"))
}

export default config;