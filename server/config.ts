import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env');

console.log('[DEBUG] Loading environment variables from:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('[ERROR] Failed to load .env file:', result.error);
  process.exit(1);
}

console.log('[DEBUG] Environment variables loaded successfully');