/**
 * auth.js
 * JWT authentication middleware.
 *
 * Verifies the JWT token from the Authorization header.
 * Adds decoded user information to req.user.
 */

const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader =
        req.headers['authorization'];

    // Expected format:
    // Authorization: Bearer TOKEN

    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({error: 'Authentication token required'});
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET,
        (err, user) => {

            if (err) {
                return res.status(403).json({error: 'Invalid or expired token'});
            }

            // Example:
            // {
            //    id: "123456",
            //    role: "employee"
            // }

            req.user = user;

            next();
        }
    );
}

module.exports = authenticateToken;