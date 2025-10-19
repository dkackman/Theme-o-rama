import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Set workspace root to this directory to prevent scanning parent
  outputFileTracingRoot: path.join(__dirname),

  // Transpile the local theme-o-rama package
  transpilePackages: ['theme-o-rama'],
};

export default nextConfig;
