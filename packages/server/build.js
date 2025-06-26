import * as esbuild from 'esbuild';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// 读取package.json获取依赖列表
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  // Node.js 内置模块
  'fs',
  'path',
  'crypto',
  'util',
  'stream',
  'events',
  'buffer',
  'querystring',
  'url',
  'http',
  'https',
  'zlib',
  'os',
  'child_process',
  'readline',
  'tty',
  'net',
  'cluster',
  'worker_threads',
  'perf_hooks',
];

try {
  await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'dist/bundle.js',
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    sourcemap: true,
    external,
    banner: {
      js: '#!/usr/bin/env node',
    },
    // 路径别名支持
    plugins: [
      {
        name: 'resolve-alias',
        setup(build) {
          build.onResolve({ filter: /^@xiaohongshu\// }, (args) => {
            const packageName = args.path.replace('@xiaohongshu/', '');
            return {
              path: resolve(`../../packages/${packageName}/dist/index.js`),
              external: false,
            };
          });
        },
      },
    ],
  });

  console.log('✅ 构建成功！');
} catch (error) {
  console.error('❌ 构建失败:', error);
  process.exit(1);
}
