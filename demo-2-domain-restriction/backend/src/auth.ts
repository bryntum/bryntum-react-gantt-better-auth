import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';
import Database from 'better-sqlite3';

export const auth = betterAuth({
    database         : new Database('./auth.db'),
    emailAndPassword : {
        enabled : true
    },
    trustedOrigins : ['http://localhost:5173'],
    databaseHooks  : {
        user : {
            create : {
                before : async(user) => {
                    const allowedDomain = '@gmail.com';
                    if (!user.email.endsWith(allowedDomain)) {
                        throw new APIError('BAD_REQUEST', {
                            message : `Only ${allowedDomain} email addresses are allowed to sign up.`
                        });
                    }
                    return { data : user };
                }
            }
        }
    }
});
