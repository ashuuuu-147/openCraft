"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/auth.ts
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'opencraft-super-secret-jwt-key-2026';
// Register standard email/password user
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'All fields (email, password, name) are required' });
        }
        const existingUser = await db_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        const validRoles = ['CODER', 'MENTOR', 'ORG_ADMIN'];
        const chosenRole = validRoles.includes(role) ? role : 'CODER';
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: chosenRole,
                level: chosenRole === 'MENTOR' ? 'MENTOR_LEVEL' : 'BEGINNER',
                profile: {
                    create: {
                        bio: chosenRole === 'MENTOR' ? 'Verified Mentor on OpenCraft' : 'Junior Developer',
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
                        stack: '',
                    }
                }
            },
            include: {
                profile: true
            }
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, level: user.level }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, level: user.level, avatar: user.profile?.avatar } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Login standard email/password user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await db_1.prisma.user.findUnique({
            where: { email },
            include: { profile: true }
        });
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, level: user.level }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, level: user.level, avatar: user.profile?.avatar } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GitHub OAuth Login & Callback
router.post('/github', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ error: 'Authorization code is required' });
        }
        let githubId = '';
        let githubLogin = '';
        let email = '';
        let name = '';
        let avatarUrl = '';
        const clientID = process.env.GITHUB_CLIENT_ID;
        const clientSecret = process.env.GITHUB_CLIENT_SECRET;
        // Check if we should use mock auth (either explicitly requested by mock code, or credentials are missing)
        if (code.startsWith('mock_github_code_') || !clientID || !clientSecret) {
            console.log('GitHub credentials missing or mock code provided. Using simulated GitHub OAuth flow.');
            // Extract handle from code or fallback
            const handle = code.replace('mock_github_code_', '') || 'dev_guest';
            // Check if we match one of our seeded accounts to make role testing simple
            if (handle === 'jane') {
                const jane = await db_1.prisma.user.findUnique({ where: { email: 'coder@opencraft.dev' }, include: { profile: true } });
                if (jane) {
                    const token = jsonwebtoken_1.default.sign({ id: jane.id, email: jane.email, role: jane.role, level: jane.level }, JWT_SECRET, { expiresIn: '24h' });
                    return res.json({ token, user: { id: jane.id, email: jane.email, name: jane.name, role: jane.role, level: jane.level, avatar: jane.profile?.avatar } });
                }
            }
            else if (handle === 'john') {
                const john = await db_1.prisma.user.findUnique({ where: { email: 'verified.coder@opencraft.dev' }, include: { profile: true } });
                if (john) {
                    const token = jsonwebtoken_1.default.sign({ id: john.id, email: john.email, role: john.role, level: john.level }, JWT_SECRET, { expiresIn: '24h' });
                    return res.json({ token, user: { id: john.id, email: john.email, name: john.name, role: john.role, level: john.level, avatar: john.profile?.avatar } });
                }
            }
            else if (handle === 'alex') {
                const alex = await db_1.prisma.user.findUnique({ where: { email: 'alex@opencraft.dev' }, include: { profile: true } });
                if (alex) {
                    const token = jsonwebtoken_1.default.sign({ id: alex.id, email: alex.email, role: alex.role, level: alex.level }, JWT_SECRET, { expiresIn: '24h' });
                    return res.json({ token, user: { id: alex.id, email: alex.email, name: alex.name, role: alex.role, level: alex.level, avatar: alex.profile?.avatar } });
                }
            }
            else if (handle === 'sarah') {
                const sarah = await db_1.prisma.user.findUnique({ where: { email: 'sarah@opencraft.dev' }, include: { profile: true } });
                if (sarah) {
                    const token = jsonwebtoken_1.default.sign({ id: sarah.id, email: sarah.email, role: sarah.role, level: sarah.level }, JWT_SECRET, { expiresIn: '24h' });
                    return res.json({ token, user: { id: sarah.id, email: sarah.email, name: sarah.name, role: sarah.role, level: sarah.level, avatar: sarah.profile?.avatar } });
                }
            }
            else if (handle === 'devtool') {
                const devtool = await db_1.prisma.user.findUnique({ where: { email: 'admin@devtoolco.com' }, include: { profile: true } });
                if (devtool) {
                    const token = jsonwebtoken_1.default.sign({ id: devtool.id, email: devtool.email, role: devtool.role, level: devtool.level }, JWT_SECRET, { expiresIn: '24h' });
                    return res.json({ token, user: { id: devtool.id, email: devtool.email, name: devtool.name, role: devtool.role, level: devtool.level, avatar: devtool.profile?.avatar } });
                }
            }
            // Create a new mock user
            githubId = `mock_id_${handle}`;
            githubLogin = handle;
            email = `${handle}@github.example.com`;
            name = handle.charAt(0).toUpperCase() + handle.slice(1);
            avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${handle}`;
        }
        else {
            // Real GitHub OAuth exchange
            // 1. Get access token
            const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    client_id: clientID,
                    client_secret: clientSecret,
                    code,
                }),
            });
            const tokenData = await tokenResponse.json();
            if (tokenData.error) {
                return res.status(400).json({ error: tokenData.error_description || tokenData.error });
            }
            const accessToken = tokenData.access_token;
            // 2. Get GitHub User profile details
            const userResponse = await fetch('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'User-Agent': 'OpenCraft-Application',
                },
            });
            const userData = await userResponse.json();
            githubId = String(userData.id);
            githubLogin = userData.login;
            email = userData.email || `${userData.login}@github.example.com`;
            name = userData.name || userData.login;
            avatarUrl = userData.avatar_url;
        }
        // Upsert user based on githubId
        let user = await db_1.prisma.user.findUnique({
            where: { githubId },
            include: { profile: true }
        });
        if (!user) {
            // Create user. Role is CODER by default, can be modified in first login step.
            user = await db_1.prisma.user.create({
                data: {
                    githubId,
                    githubLogin,
                    email,
                    name,
                    role: 'CODER',
                    level: 'BEGINNER',
                    profile: {
                        create: {
                            bio: `GitHub user @${githubLogin} onboarded.`,
                            avatar: avatarUrl,
                            stack: '',
                        }
                    }
                },
                include: {
                    profile: true
                }
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, level: user.level }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, level: user.level, avatar: user.profile?.avatar } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update role (first login flow)
router.post('/select-role', auth_middleware_1.authenticateJWT, async (req, res) => {
    try {
        const { role } = req.body;
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!role || !['CODER', 'MENTOR', 'ORG_ADMIN'].includes(role)) {
            return res.status(400).json({ error: 'Valid role is required (CODER, MENTOR, ORG_ADMIN)' });
        }
        const updatedUser = await db_1.prisma.user.update({
            where: { id: req.user.id },
            data: {
                role,
                level: role === 'MENTOR' ? 'MENTOR_LEVEL' : 'BEGINNER',
            },
            include: {
                profile: true
            }
        });
        // Generate a new token with updated role/level
        const token = jsonwebtoken_1.default.sign({ id: updatedUser.id, email: updatedUser.email, role: updatedUser.role, level: updatedUser.level }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role, level: updatedUser.level, avatar: updatedUser.profile?.avatar } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get current profile
router.get('/me', auth_middleware_1.authenticateJWT, async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = await db_1.prisma.user.findUnique({
            where: { id: req.user.id },
            include: { profile: true }
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ id: user.id, email: user.email, name: user.name, role: user.role, level: user.level, avatar: user.profile?.avatar, profile: user.profile });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
