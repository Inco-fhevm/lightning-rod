import '@testing-library/jest-dom/vitest';
import { resolve } from 'path';
import { config } from 'dotenv';

// Navigate from backend/src/test/react-example/test/ up to project root
config({ path: resolve(__dirname, '..', '..', '..', '..', '..', '.env') });
