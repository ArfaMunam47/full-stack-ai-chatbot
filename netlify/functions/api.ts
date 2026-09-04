import serverless from "serverless-http";
import { app } from "../../server/app.ts";

// Netlify Function handler wrapping Express app
export const handler = serverless(app);
