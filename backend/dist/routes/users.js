"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/users.ts
const express_1 = require("express");
const db_1 = require("../db");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Get leaderboard of coders
router.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await db_1.prisma.user.findMany({
            where: {
                role: 'CODER',
            },
            select: {
                id: true,
                name: true,
                githubLogin: true,
                level: true,
                reputation: true,
                createdAt: true,
                profile: {
                    select: {
                        avatar: true,
                        bio: true,
                    }
                },
                badges: {
                    select: {
                        type: true
                    }
                }
            },
            orderBy: {
                reputation: 'desc',
            },
            take: 20, // top 20
        });
        res.json(leaderboard);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update profile (for logged-in user)
router.put('/profile', auth_middleware_1.authenticateJWT, async (req, res) => {
    try {
        const { name, bio, avatar, stack, website, twitter, timezone } = req.body;
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        // Update User name if provided
        if (name) {
            await db_1.prisma.user.update({
                where: { id: req.user.id },
                data: { name },
            });
        }
        // Convert stack array to comma-separated string if it is an array
        const stackStr = Array.isArray(stack) ? stack.join(',') : (stack || '');
        // Upsert Profile
        const profile = await db_1.prisma.profile.upsert({
            where: { userId: req.user.id },
            update: {
                bio,
                avatar,
                stack: stackStr,
                website,
                twitter,
                timezone,
            },
            create: {
                userId: req.user.id,
                bio,
                avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.user.id}`,
                stack: stackStr,
                website,
                twitter,
                timezone,
            },
        });
        res.json({ message: 'Profile updated successfully', profile });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get user profile by username or id
router.get('/profile/:username', async (req, res) => {
    try {
        const { username } = req.params;
        // Look up by githubLogin first, then by id
        let user = await db_1.prisma.user.findFirst({
            where: {
                OR: [
                    { githubLogin: username },
                    { id: username },
                    { email: username }
                ]
            },
            include: {
                profile: true,
                badges: true,
                submissions: {
                    include: {
                        task: {
                            include: { org: true }
                        },
                        reviews: true
                    },
                    orderBy: {
                        submittedAt: 'desc'
                    }
                },
                rewards: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });
        if (!user) {
            return res.status(404).json({ error: 'User profile not found' });
        }
        // Hide password before returning
        const { password, ...safeUser } = user;
        res.json(safeUser);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get personalized dashboard data for logged-in user
router.get('/dashboard/stats', auth_middleware_1.authenticateJWT, async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const userId = req.user.id;
        const user = await db_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                badges: true,
            }
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        // Active claim submission
        const activeSubmission = await db_1.prisma.submission.findFirst({
            where: {
                coderId: userId,
                status: { in: ['PENDING', 'IN_REVIEW', 'CHANGES_REQUESTED'] },
            },
            include: {
                task: {
                    include: { org: true }
                }
            }
        });
        // Submissions history counts
        const totalCompleted = await db_1.prisma.submission.count({
            where: { coderId: userId, status: 'APPROVED' }
        });
        const totalSubmitted = await db_1.prisma.submission.count({
            where: { coderId: userId }
        });
        // Total earnings (sum of cashReward from completed tasks)
        const rewards = await db_1.prisma.reward.findMany({
            where: { userId, status: 'PAID' }
        });
        const totalEarned = rewards.reduce((sum, r) => sum + r.cash, 0);
        res.json({
            user: {
                id: user.id,
                name: user.name,
                githubLogin: user.githubLogin,
                level: user.level,
                reputation: user.reputation,
                avatar: user.profile?.avatar,
                profile: user.profile,
                badges: user.badges
            },
            stats: {
                tasksCompleted: totalCompleted,
                tasksSubmitted: totalSubmitted,
                reputationScore: user.reputation,
                totalEarned
            },
            activeTask: activeSubmission
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
