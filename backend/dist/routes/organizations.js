"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/organizations.ts
const express_1 = require("express");
const db_1 = require("../db");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Register/update organization profile (Org only)
router.post('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['ORG_ADMIN']), async (req, res) => {
    try {
        const { name, website, description, logo } = req.body;
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!name) {
            return res.status(400).json({ error: 'Organization name is required' });
        }
        // Check if user already has an organization
        const existingOrg = await db_1.prisma.organization.findFirst({
            where: { userId: req.user.id }
        });
        let organization;
        if (existingOrg) {
            organization = await db_1.prisma.organization.update({
                where: { id: existingOrg.id },
                data: {
                    name,
                    website,
                    description,
                    logo: logo || existingOrg.logo,
                }
            });
        }
        else {
            organization = await db_1.prisma.organization.create({
                data: {
                    userId: req.user.id,
                    name,
                    website,
                    description,
                    logo: logo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
                    verified: false, // manual admin verification needed
                }
            });
        }
        res.json({ message: 'Organization saved successfully', organization });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get organization by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const org = await db_1.prisma.organization.findUnique({
            where: { id },
            include: {
                tasks: {
                    where: { status: { not: 'EXPIRED' } },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });
        if (!org) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        res.json(org);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get organization dashboard data (Org Admin only)
router.get('/my/dashboard', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['ORG_ADMIN']), async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const org = await db_1.prisma.organization.findFirst({
            where: { userId: req.user.id }
        });
        if (!org) {
            return res.json({ organization: null, tasks: [] });
        }
        // Get all tasks posted by this org, along with active claimants/submissions
        const tasks = await db_1.prisma.task.findMany({
            where: { orgId: org.id },
            include: {
                submissions: {
                    include: {
                        coder: {
                            select: {
                                id: true,
                                name: true,
                                githubLogin: true,
                                level: true,
                                profile: { select: { avatar: true } }
                            }
                        }
                    },
                    orderBy: { submittedAt: 'desc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            organization: org,
            tasks
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Contributor discovery (Org Admin only, search developers)
router.get('/contributors/discover', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['ORG_ADMIN']), async (req, res) => {
    try {
        const { skill, level } = req.query;
        const whereClause = {
            role: 'CODER'
        };
        // Filter by badge/level
        if (level) {
            whereClause.level = String(level);
        }
        const coders = await db_1.prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                githubLogin: true,
                level: true,
                reputation: true,
                createdAt: true,
                profile: {
                    select: {
                        bio: true,
                        avatar: true,
                        stack: true,
                        website: true,
                        twitter: true,
                    }
                },
                badges: true,
                submissions: {
                    where: { status: 'APPROVED' },
                    select: { id: true }
                }
            },
            orderBy: {
                reputation: 'desc'
            }
        });
        // Custom filtering on skill (since stack is a comma-separated string)
        let filteredCoders = coders;
        if (skill) {
            const searchSkill = String(skill).toLowerCase();
            filteredCoders = coders.filter(coder => {
                const stackStr = coder.profile?.stack || '';
                return stackStr.toLowerCase().split(',').some(s => s.trim() === searchSkill || s.trim().includes(searchSkill));
            });
        }
        res.json(filteredCoders);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
