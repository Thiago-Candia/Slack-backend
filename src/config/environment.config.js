import dotenv from "dotenv";

dotenv.config();

const getRequiredEnv = (name) => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
};

const port = Number(process.env.PORT) || 3000;

const ENVIRONMENT = {
    PORT: port,
    MONGO_DB_URL: getRequiredEnv("MONGO_DB_URL"),
    SECRET_KEY_JWT: getRequiredEnv("SECRET_KEY_JWT"),
    GMAIL_USERNAME: getRequiredEnv("GMAIL_USERNAME"),
    GMAIL_PASSWORD: getRequiredEnv("GMAIL_PASSWORD"),
    URL_BACKEND: process.env.URL_BACKEND || `http://localhost:${port}`,
    URL_FRONTEND: process.env.URL_FRONTEND || "http://localhost:5173"
};

export default ENVIRONMENT;
