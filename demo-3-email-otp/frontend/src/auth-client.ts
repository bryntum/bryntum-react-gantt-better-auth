import { createAuthClient } from 'better-auth/react';
import { emailOTPClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
    plugins        : [emailOTPClient()],
    // By default the session is refetched on window focus, which sets
    // isPending while logged out and remounts the login UI mid-flow
    sessionOptions : { refetchOnWindowFocus : false }
});
