import * as dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import * as path from 'path';
import type { LocalNodePepper } from '@inco/js/lite';

const root = path.resolve(__dirname, '..', '..');

export function loadDotEnv(envFile = '.env') {
  const envPath = path.join(root, envFile);
  dotenv.config({ path: envPath });
}

export function resolveRoot(...paths: string[]): string {
  return path.resolve(root, ...paths);
}

export async function readFileFromRoot(...paths: string[]): Promise<Buffer> {
  return await readFile(resolveRoot(...paths));
}

export function getPepper(): LocalNodePepper {
  return (process.env.PEPPER ?? 'mainnet') as LocalNodePepper;
}
