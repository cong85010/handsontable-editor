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
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
      }),
      postcss({
        extract: 'styles.css',
        minimize: true,
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

