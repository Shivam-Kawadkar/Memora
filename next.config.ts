import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Memory uploads allow images up to 8 MB; the Server Action body
      // limit defaults to 1 MB, so raise it with headroom for form fields.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
