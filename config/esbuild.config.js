import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

// 生产构建配置
const config = {
  entryPoints: ['src/server-index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  outfile: 'build/server.js',
  sourcemap: false, // 生产环境通常不需要 sourcemap
  minify: true,
  plugins: [nodeExternalsPlugin()],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
};

// 执行生产构建
esbuild.build(config)
  .then(() => {
    console.log('Production build completed successfully.');
  })
  .catch((error) => {
    console.error('Build failed:', error);
    process.exit(1);
  });