import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
// import path from 'path' // No longer needed if removing manual alias

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  // resolve: { // Remove this section
  //   alias: {
  //     '@': path.resolve(__dirname, './')
  //   }
  // },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      'supabase/functions/**' // Exclude Supabase functions tests
    ],
    globals: true,
  },
}) 