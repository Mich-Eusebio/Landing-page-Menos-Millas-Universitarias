/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/rifa',
        destination: '/comprame-un-dia',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
