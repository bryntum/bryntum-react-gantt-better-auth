import { createAuthClient } from 'better-auth/react';

// No baseURL needed — requests go to /api/auth/* on the current origin,
// which Vite proxies to the Express backend on port 3001.
export const authClient = createAuthClient({
    // By default the session is refetched on window focus, which sets
    // isPending while logged out and remounts the login form mid-typing
    sessionOptions : { refetchOnWindowFocus : false }
});
