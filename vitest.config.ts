import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.ts'],
        // Exclude sourceMap tests - they conflict with vitest's source map handling
        // Run separately with: npx vitest run tests/sourceMap.test.ts --no-sourcemap
        exclude: ['tests/sourceMap.test.ts', 'node_modules/**', 'dist/**'],
        coverage: {
            reporter: ['text', 'json', 'html'],
        },
    },
});
