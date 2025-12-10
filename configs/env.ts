import dotenv from 'dotenv';
dotenv.config();

interface Config{
    port: number;
    databaseUrl: string;
}

const requireEnv=function (value: string) {
    const ENV_VALUE = process.env[value];
    if (!ENV_VALUE) {
        console.log(`CONFIGURATION ERROR : ${value} is not defined in environment`);
        return
    }
    return ENV_VALUE;
}

const config: Config={
    port: Number(requireEnv("ONE_AUTH_SERVER_URL")),
    databaseUrl: requireEnv("ONE_AUTH_DATABASE_SERVER_URL")!
}

export default config;