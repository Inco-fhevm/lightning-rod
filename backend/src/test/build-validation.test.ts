// test/build-validation.test.ts
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { describe, it } from 'vitest';

// ESM-compatible __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('React Example Build Validation', () => {
  const reactExampleDir = join(__dirname, 'react-example');

  it('should build the react-example without errors', async () => {
    // Ensure dependencies are installed before building
    const nodeModulesPath = join(reactExampleDir, 'node_modules');
    if (!existsSync(nodeModulesPath)) {
      console.log('Installing dependencies for react-example...');
      execSync('bun install', {
        cwd: reactExampleDir,
        encoding: 'utf-8',
        stdio: 'inherit',
        env: {
          ...process.env,
        },
      });
    }

    try {
      execSync('bun run build', {
        cwd: reactExampleDir,
        encoding: 'utf-8',
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_ENV: 'production',
        },
      });
    } catch (error: any) {
      // Capture error output even with inherit
      throw new Error(`Build failed: ${error.message}`);
    }
  }, 120000); // 2 minute timeout for build
});
