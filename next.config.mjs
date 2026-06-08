import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  // Disable SW in dev to avoid HMR conflicts; enable in prod build.
  disable: process.env.NODE_ENV === 'development',
  // Minimal config: cache app shell + static assets only. API responses are
  // already cached by React Query persist (localStorage, 24h TTL).
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withPWA(nextConfig);
