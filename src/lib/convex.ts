import { ConvexReactClient } from 'convex/react'

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

// Validate Convex URL in development
if (import.meta.env.DEV && !convexUrl) {
	throw new Error(
		'Missing VITE_CONVEX_URL environment variable. ' +
		'Please set it in your .env.local file. ' +
		'Get your Convex URL by running "npx convex dev" and copying the deployment URL.'
	);
}

// Create client with validated URL
const convex = new ConvexReactClient(convexUrl || '');

export { convex }
