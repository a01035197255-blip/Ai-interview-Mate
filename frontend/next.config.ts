import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    eslint: {
        ignoreDuringBuilds: true, // ESLint 에러 무시
    },
    typescript: {
        ignoreBuildErrors: true, // TypeScript 에러 무시 (👈 이게 핵심)
    },
};

export default nextConfig;
