import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // The Server Action default is 1MB. Raised so several phone screenshots (1–3MB each) can be sent.
    // Vercel's request limit is 4.5MB, so images are also shrunk on the client before sending (EvaluateForm).
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
