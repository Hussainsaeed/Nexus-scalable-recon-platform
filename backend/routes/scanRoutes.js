// Backwards-compatible JS route wrapper for the TS-first scan implementation.
// NOTE: Express will mount the router exported from scanRoutes.ts.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const tsRouter = require('./scanRoutes.ts');

module.exports = tsRouter.default || tsRouter;


