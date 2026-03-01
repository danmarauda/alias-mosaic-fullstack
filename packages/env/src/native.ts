import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	clientPrefix: "EXPO_PUBLIC_",
	client: {
		EXPO_PUBLIC_CONVEX_URL: z.string().url(),
		EXPO_PUBLIC_CONVEX_SITE_URL: z.string().url(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
