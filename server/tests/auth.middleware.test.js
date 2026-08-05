/**
 * tests/auth.middleware.test.js — Unit tests for JWT authentication middleware
 * Tests token validation and user authentication in isolation without involving the database.
 * Focuses on the security boundary: ensuring invalid or missing tokens are rejected
 * and valid tokens are properly decoded and attached to the request object.
 */

const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/auth');

describe('JWT Authentication Middleware', () => {
    test('rejects missing token', () => {
        const req = {
            headers: {}
        };

        const res = {
            status: function(code) {
                this.code = code;
                return this;
            },
            json: function(data) {
                this.data = data;
            }
        };

        const next = jest.fn();

        authenticateToken(req, res, next);

        expect(res.code).toBe(401);
        expect(next).not.toHaveBeenCalled();
    });

    test('accepts valid token', () => {
        process.env.JWT_SECRET = 'testsecret';

        const token = jwt.sign(
            {
                username: 'admin',
                role: 'admin'
            },
            process.env.JWT_SECRET
        );

        const req = {
            headers: {
                authorization: `Bearer ${token}`
            }
        };

        const res = {
            status: function(code) {
                this.code = code;
                return this;
            },
            json: function(data) {
                this.data = data;
            }
        };

        const next = jest.fn();

        authenticateToken(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user.role).toBe('admin');
    });
});