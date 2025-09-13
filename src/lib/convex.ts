import { ConvexReactClient } from 'convex/react'

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
if (!convexUrl) {
	console.error('Missing VITE_CONVEX_URL. Set it in .env.local.');
}
const convex = new ConvexReactClient(convexUrl ?? '');

export { convex }
