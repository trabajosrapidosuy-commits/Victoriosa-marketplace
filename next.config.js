/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { hostname: 'ngliugfcwydnfbpalkpb.supabase.co' }
    ]
  }
}

export default nextConfig;
