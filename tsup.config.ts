import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts', react: 'src/react.ts', vue: 'src/vue.ts', element: 'src/element.ts', cli: 'src/cli.ts', node: 'src/node.ts', browser: 'src/browser.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  minify: true,
  external: ['react', 'vue', '@resvg/resvg-js'],
});
