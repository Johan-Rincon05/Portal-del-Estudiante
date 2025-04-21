import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString('hex')}.${salt}`;
}

async function main() {
  const passwords = {
    superadmin: 'admin123',
    admin: 'admin123',
    estudiante: 'estudiante123'
  };

  for (const [username, password] of Object.entries(passwords)) {
    const hash = await hashPassword(password);
    console.log(`Usuario: ${username}`);
    console.log(`Hash: ${hash}`);
    console.log('---');
  }
}

main().catch(console.error); 