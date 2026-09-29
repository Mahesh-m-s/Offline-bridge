// Backwards-compatible entry point for the API verification suite.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ||= 'test-secret-that-is-at-least-thirty-two-chars';
require('jest').run(['--runInBand', require('node:path').join(__dirname, 'test/api.test.js')]);
