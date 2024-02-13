import resolve from '@rollup/plugin-node-resolve';
import autoprefixer from 'autoprefixer';
import postcssPresetEnv from 'postcss-preset-env';
import postcssNesting from 'postcss-nesting';
import fg from 'fast-glob';

const PACKAGE_ID = 'modules/vf-5e-sheet-addons';

export default () => {
  return {
    root: 'src/',
    base: `/${PACKAGE_ID}/`,
    publicDir: '../public',
    cacheDir: '../.vite-cache',
    resolve: { conditions: ['import', 'browser'] },
    esbuild: {
      target: ['es2022']
    },
    css: {
      postcss: {
        plugins: [postcssNesting, autoprefixer, postcssPresetEnv]
      }
    },
    server: {
      port: 30001,
      open: '/game',
      proxy: {
        [`^(/${PACKAGE_ID}/(assets|lang|packs|style.css))`]: 'http://localhost:30000',
        [`^(?!/${PACKAGE_ID}/)`]: 'http://localhost:30000',
        '/socket.io': { target: 'ws://localhost:30000', ws: true }
      }
    },

    build: {
      outDir: '../dist',
      emptyOutDir: true,
      sourcemap: true,
      brotliSize: true,
      minify: false,
      target: ['es2022'],
      terserOptions: void 0,
      lib: {
        entry: './index.js',
        formats: ['es'],
        fileName: 'index'
      }
    },

    plugins: [
      {
        name: 'watch-external',
        async buildStart() {
          const files = await fg(['public/**/*']);
          for (const file of files) {
            this.addWatchFile(file);
          }
        }
      },
      resolve({
        browser: true
      })
    ]
  };
};
