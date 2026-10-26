import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// Two entries. `core` is pure logic (no React, no host imports) and is published
// as the `@ghost-next/news/core` subpath. The host's feature-flag stub replaces
// only the bare `@ghost-next/news` import, so `core` stays available to builds
// where the News Studio components are switched off.
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src'],
    }),
    {
      name: 'inject-use-client',
      generateBundle(_, bundle) {
        for (const chunk of Object.values(bundle)) {
          if (chunk.type === 'chunk' && chunk.isEntry && chunk.name === 'news') {
            chunk.code = '"use client";\n' + chunk.code;
          }
        }
      },
    },
  ],
  build: {
    lib: {
      entry: {
        news: resolve(__dirname, 'src/index.ts'),
        core: resolve(__dirname, 'src/core/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, name) => `${name}.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'tailwindcss'],
    },
  },
})
