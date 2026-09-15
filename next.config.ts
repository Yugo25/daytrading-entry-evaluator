import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Server Action の既定は 1MB。スマホのスクリーンショット(1〜3MB)を複数枚送れるよう拡張する。
    // Vercel のリクエスト上限が 4.5MB なので、クライアント側でも送信前に画像を縮小している(EvaluateForm)。
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
