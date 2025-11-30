import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import dts from 'rollup-plugin-dts';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const packageJson = require('./package.json');

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
    ],
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false,
      }),
      commonjs({
        exclude: ['node_modules/react/**', 'node_modules/react-dom/**'],
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
      postcss({
        extract: 'styles.css',
        minimize: true,
      }),
    ],
    external: (id) => {
      // Externalize React and all its submodules (including jsx-runtime)
      if (
        id === 'react' ||
        id === 'react-dom' ||
        id === 'react/jsx-runtime' ||
        id === 'react/jsx-dev-runtime' ||
        id.startsWith('react/') ||
        id.startsWith('react-dom/')
      ) {
        return true;
      }
      // Externalize other peer dependencies
      if (
        id === 'handsontable' ||
        id.startsWith('handsontable/') ||
        id === '@handsontable/react-wrapper' ||
        id.startsWith('@handsontable/') ||
        id === 'antd' ||
        id.startsWith('antd/') ||
        id === 'dayjs' ||
        id.startsWith('dayjs/') ||
        id === 'zustand' ||
        id.startsWith('zustand/') ||
        id === 'lucide-react' ||
        id.startsWith('lucide-react/')
      ) {
        return true;
      }
      return false;
    },
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [
      dts({
        exclude: ['**/*.scss', '**/*.css'],
      }),
    ],
    external: [
      'react',
      'react-dom',
      'handsontable',
      '@handsontable/react-wrapper',
      'antd',
      'dayjs',
      'zustand',
      'lucide-react',
    ],
  },
];

