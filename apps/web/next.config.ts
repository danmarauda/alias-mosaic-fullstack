import "@alias-mosaic-fullstack/env/web";

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
	transpilePackages: ["shiki"],
	experimental: {
		optimizeCss: false,
	},
};

export default nextConfig;

initOpenNextCloudflareForDev();
