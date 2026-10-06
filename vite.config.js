import { defineConfig } from 'vite'

// The build has to run two ways: hosted as a link, and double-clicked from a
// folder with no server. Browsers refuse module scripts and web fonts on
// file:// pages, so the bundle is a plain deferred script and fonts are
// inlined. Everything in public/ is copied as-is and referenced by relative
// path from src/content.js.
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    modulePreload: false,
    cssCodeSplit: false,
    assetsInlineLimit: (file) => (/\.(woff2?|ttf|otf)$/.test(file) ? true : undefined),
    rollupOptions: {
      output: {
        format: 'iife',
        entryFileNames: 'deck.js',
        assetFileNames: 'deck[extname]',
      },
    },
  },
  plugins: [
    {
      name: 'classic-script',
      apply: 'build',
      enforce: 'post',
      transformIndexHtml: (html) =>
        html.replace(/<script type="module" crossorigin/g, '<script defer').replace(/ crossorigin/g, ''),
    },
  ],
})
