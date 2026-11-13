const test = require('node:test');
const assert = require('node:assert/strict');
const { authenticate, allow } = require('../src/middleware/auth');
const jwt = require('jsonwebtoken');

test('JWT authentication rejects missing token and accepts a valid token', () => {
  const invoke = (headers) => {
    const req = { headers };
    const res = { statusCode: 0, status(code) { this.statusCode = code; return this; }, json(value) { this.value = value; } };
    let proceeded = false;
    authenticate(req, res, () => { proceeded = true; });
    return { res, req, proceeded };
  };
  assert.equal(invoke({}).res.statusCode, 401);
  const token = jwt.sign({ id: 'user-id', role: 'officer' }, 'development-only-change-this-secret');
  assert.equal(invoke({ authorization: `Bearer ${token}` }).proceeded, true);
});

test('RBAC denies citizens access to officer review', () => {
  const req = { user: { role: 'citizen' } };
  const res = { statusCode: 0, status(code) { this.statusCode = code; return this; }, json() {} };
  allow('officer')(req, res, () => assert.fail('citizen must not proceed'));
  assert.equal(res.statusCode, 403);
});
