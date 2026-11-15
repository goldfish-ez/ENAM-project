/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Snapshot JSON written by the refresh pipeline is read at request time.
  outputFileTracingIncludes: { '/**': ['./data/snapshot/**/*'] },
};
export default nextConfig;
