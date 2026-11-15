import { csrfSync } from "csrf-sync";
const { generateToken, csrfSynchronisedProtection } = csrfSync({ getTokenFromRequest: (req) => req.get('X-CSRF-Token') || req.body?._csrf });
export { generateToken, csrfSynchronisedProtection };
