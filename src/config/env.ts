import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvVars {
    DATABASE_URL: string;
    PORT: number;
    HASH_SALT_ROUNDS: number;
    JWT_SECRET: string
}

const env: EnvVars = {
    DATABASE_URL: process.env.DATABASE_URL as string,
    PORT: process.env.PORT ? parseInt(process.env.PORT) : 8000,
    HASH_SALT_ROUNDS: 10,
    JWT_SECRET: process.env.JWT_SECRET as string,
};

export default env;