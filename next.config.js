const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ['react-monaco-editor'],
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Monaco Editor and CircularDependency plugins only for client-side
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          // Available options: https://github.com/microsoft/monaco-editor-webpack-plugin#options
          languages: ['json', 'javascript', 'typescript'],
          filename: 'static/[name].worker.js'
        }),
        new CircularDependencyPlugin({
          exclude: /a\.js|node_modules/,
          include: /src/,
          failOnError: true,
          allowAsyncCycles: false,
          cwd: process.cwd(),
        })
      );
    }

    // Exclude Monaco Editor from server-side rendering
    if (isServer) {
      config.externals = [...(config.externals || []), 'monaco-editor'];
    }

    // Add webpack aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      'vscode': require.resolve('monaco-languageclient/lib/vscode-compatibility'),
    };

    // Add extensions
    config.resolve.extensions = [
      '.wasm',
      '.ts',
      '.tsx',
      '.mjs',
      '.cjs',
      '.js',
      '.jsx',
      '.json',
      ...config.resolve.extensions,
    ];

    return config;
  },
};

module.exports = nextConfig;
