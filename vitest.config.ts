import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node'
  },
  resolve: {
    alias: {
      '@adapters': path.resolve(__dirname, 'src/adapters'),
      '@configs': path.resolve(__dirname, 'src/configs'),
      '@domains': path.resolve(__dirname, 'src/domains'),
      '@common': path.resolve(__dirname, 'src/common'),
      '@infra': path.resolve(__dirname, 'src/infra'),
      '@middlewares': path.resolve(__dirname, 'src/middlewares'),
      '@protocols': path.resolve(__dirname, 'src/protocols'),
      '@tasks': path.resolve(__dirname, 'src/tasks'),
      '@shared': path.resolve(__dirname, 'src/shared')
    }
  }
});
