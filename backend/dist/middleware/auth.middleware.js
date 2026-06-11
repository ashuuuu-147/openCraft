"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = authenticateJWT;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'opencraft-super-secret-jwt-key-2026';
function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Bearer <token>
        if (!token) {
            return res.status(401).json({ error: 'Authentication token format is invalid' });
        }
        jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid or expired session token' });
            }
            req.user = decoded;
            next();
        });
    }
    else {
        // Check cookies fallback (if set by cookie)
        const cookies = req.headers.cookie;
        if (cookies) {
            const tokenCookie = cookies.split(';').find(c => c.trim().startsWith('token='));
            if (tokenCookie) {
                const token = tokenCookie.split('=')[1];
                jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
                    if (!err) {
                        req.user = decoded;
                        return next();
                    }
                });
            }
        }
        return res.status(401).json({ error: 'Authorization header is missing' });
    }
}
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'User is not authenticated' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'You do not have permission to access this resource' });
        }
        next();
    };
}
