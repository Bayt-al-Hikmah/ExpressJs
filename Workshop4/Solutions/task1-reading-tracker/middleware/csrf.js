import { csrfSync } from "csrf-sync";

const { generateToken, csrfSynchronisedProtection } = csrfSync({
  getTokenFromRequest: (req) => req.body?._csrf
});

export { generateToken, csrfSynchronisedProtection };
