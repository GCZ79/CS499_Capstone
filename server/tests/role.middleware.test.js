/**
 * tests/role.middleware.test.js — Unit tests for requireRole authorization middleware
 * Tests role-based access control in isolation without involving the database.
 * Focuses on the security boundary: ensuring only users with the required role
 * can access protected routes, and rejecting unauthorized or unauthenticated requests.
 */

const requireRole = require('../middleware/requireRole');

// Helper to build mock Express req, res, and next objects for role testing
const mockReq = (user = null) => ({ user });
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
const mockNext = jest.fn();

beforeEach(() => {
    mockNext.mockClear();
});

// *** Role Authorization ***

describe('Role Authorization Middleware', () => {
    test('allows user with correct role', () => {
        const req = mockReq({
            username: 'admin',
            role: 'admin'
        });
        const res = mockRes();
        const next = jest.fn();

        requireRole('admin')(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    test('rejects user with incorrect role', () => {
        const req = mockReq({
            username: 'employee',
            role: 'employee'
        });
        const res = mockRes();
        const next = jest.fn();

        requireRole('admin')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Access denied' });
        expect(next).not.toHaveBeenCalled();
    });

    test('rejects missing authentication', () => {
        const req = {}; // No user object means unauthenticated
        const res = mockRes();
        const next = jest.fn();

        requireRole('admin')(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        // Fix: Match the actual error message from the middleware
        expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
        expect(next).not.toHaveBeenCalled();
    });
});