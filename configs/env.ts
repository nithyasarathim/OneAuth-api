import dotenv from 'dotenv';
dotenv.config();

const config = {
    port: process.env.ONE_AUTH_SERVER_PORT,
    DB_Url: process.env.ONE_AUTH_DATABASE_SERVER_URL,
}

export default config;