/**
 * Creates the admin account, or sets a new password for an existing one.
 *   npm run admin:create -- owner@example.com
 * The password is asked for in the terminal (or read from ADMIN_PASSWORD), never passed as an
 * argument, so it doesn't end up in shell history.
 */
import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import argon2 from 'argon2';
import { loginInputSchema } from '@faralyah/shared';
import { connectDb, disconnectDb } from '../src/db';
import { AdminUser } from '../src/models/admin-user';

const MIN_PASSWORD = 10;

async function askPassword(): Promise<string> {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    const first = await rl.question(`Şifre (en az ${MIN_PASSWORD} karakter): `);
    const second = await rl.question('Şifre (tekrar): ');
    if (first !== second) throw new Error('Passwords do not match.');
    return first;
  } finally {
    rl.close();
  }
}

async function main() {
  const email = process.argv.slice(2).find((arg) => !arg.startsWith('-'));
  if (!email) throw new Error('Usage: npm run admin:create -- owner@example.com');
  const password = await askPassword();
  if (password.length < MIN_PASSWORD) {
    throw new Error(`Password must be at least ${MIN_PASSWORD} characters.`);
  }
  const input = loginInputSchema.parse({ email, password });
  const passwordHash = await argon2.hash(input.password);

  await connectDb();
  try {
    const existing = await AdminUser.findOne({ email: input.email });
    await AdminUser.updateOne({ email: input.email }, { passwordHash }, { upsert: true });
    console.log(
      existing ? `[admin] password updated for ${input.email}` : `[admin] created ${input.email}`,
    );
  } finally {
    await disconnectDb();
  }
}

main().catch((error) => {
  console.error(`[admin] ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
