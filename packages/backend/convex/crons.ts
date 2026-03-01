import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
	"aggregate daily analytics",
	{ hourUTC: 0, minuteUTC: 0 },
	internal.analytics.aggregateDaily
);

export default crons;
