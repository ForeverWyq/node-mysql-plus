import path from 'path';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import cleaner from 'rollup-plugin-cleaner';

const outputDir = path.resolve('./lib');

export default [
  {
    input: path.resolve('./src/index.ts'),
    output: [
      {
        dir: outputDir,
        format: 'cjs',
        entryFileNames: '[name].js',
      },
      {
        dir: outputDir,
        format: 'cjs',
        entryFileNames: '[name].min.js',
        plugins: [terser()],
      },
    ],
    plugins: [
      cleaner({ targets: [outputDir] }),
      resolve(),
      typescript(),
      commonjs()
    ],
  },
];
