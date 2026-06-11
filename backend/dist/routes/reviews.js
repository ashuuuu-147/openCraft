"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/reviews.ts
const express_1 = require("express");
const db_1 = require("../db");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Get queue of submissions pending review (Mentor only)
router.get('/queue', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['MENTOR', 'PLATFORM_ADMIN']), async (req, res) => {
    try {
        const queue = await db_1.prisma.submission.findMany({
            where: {
                status: 'IN_REVIEW',
            },
            include: {
                task: {
                    include: { org: true }
                },
                coder: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        githubLogin: true,
                        level: true,
                        profile: true
                    }
                }
            },
            orderBy: {
                submittedAt: 'asc', // oldest first
            }
        });
        res.json(queue);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Submit a review (Mentor only)
router.post('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['MENTOR', 'PLATFORM_ADMIN']), async (req, res) => {
    try {
        const { submissionId, action, comment, score } = req.body;
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!submissionId || !action || !['APPROVED', 'CHANGES_REQUESTED', 'REJECTED'].includes(action)) {
            return res.status(400).json({ error: 'Submission ID and a valid action (APPROVED, CHANGES_REQUESTED, REJECTED) are required' });
        }
        const submission = await db_1.prisma.submission.findUnique({
            where: { id: submissionId },
            include: { task: true, coder: true },
        });
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        if (submission.status !== 'IN_REVIEW') {
            return res.status(400).json({ error: 'This submission is not in review' });
        }
        // Create the Review record
        const scoreVal = score ? parseInt(score) : null;
        const review = await db_1.prisma.review.create({
            data: {
                submissionId,
                mentorId: req.user.id,
                action,
                comment,
                score: scoreVal,
            },
        });
        // Update Submission and Task based on action
        if (action === 'APPROVED') {
            // 1. Approve submission
            await db_1.prisma.submission.update({
                where: { id: submissionId },
                data: { status: 'APPROVED' },
            });
            // 2. Set task to COMPLETED
            await db_1.prisma.task.update({
                where: { id: submission.taskId },
                data: { status: 'COMPLETED' },
            });
            // 3. Award points & reputation to coder
            const pointsAwarded = submission.task.reward;
            const updatedCoder = await db_1.prisma.user.update({
                where: { id: submission.coderId },
                data: {
                    reputation: { increment: pointsAwarded }
                }
            });
            // 4. Create a Reward record (mock Stripe payout)
            if (submission.task.cashReward > 0) {
                await db_1.prisma.reward.create({
                    data: {
                        userId: submission.coderId,
                        taskId: submission.taskId,
                        points: pointsAwarded,
                        cash: submission.task.cashReward,
                        status: 'PAID', // mark as paid in mock
                        paidAt: new Date(),
                    }
                });
            }
            // 5. Badge & Level logic
            // Get count of APPROVED submissions for this coder
            const approvedCount = await db_1.prisma.submission.count({
                where: { coderId: submission.coderId, status: 'APPROVED' },
            });
            // Award FIRST_CONTRIBUTION badge if first approval
            if (approvedCount === 1) {
                await db_1.prisma.badge.create({
                    data: {
                        coderId: submission.coderId,
                        type: 'FIRST_CONTRIBUTION',
                    }
                });
            }
            // Award LANGUAGE_EXPERT if they completed multiple tasks in a language
            const taskLanguage = submission.task.tags.split(',')[0] || 'General';
            const langApprovedCount = await db_1.prisma.submission.count({
                where: {
                    coderId: submission.coderId,
                    status: 'APPROVED',
                    task: { tags: { contains: taskLanguage } }
                }
            });
            if (langApprovedCount === 3) {
                // Award badge if not already earned
                const existingLangBadge = await db_1.prisma.badge.findFirst({
                    where: { coderId: submission.coderId, type: 'LANGUAGE_EXPERT' }
                });
                if (!existingLangBadge) {
                    await db_1.prisma.badge.create({
                        data: {
                            coderId: submission.coderId,
                            type: 'LANGUAGE_EXPERT',
                        }
                    });
                }
            }
            // Upgrade levels: 1+ approved = ACTIVE, 5+ = VERIFIED, 15+ = MENTOR_LEVEL
            let newLevel = 'BEGINNER';
            if (approvedCount >= 15) {
                newLevel = 'MENTOR_LEVEL';
            }
            else if (approvedCount >= 5) {
                newLevel = 'VERIFIED';
            }
            else if (approvedCount >= 1) {
                newLevel = 'ACTIVE';
            }
            if (newLevel !== updatedCoder.level) {
                await db_1.prisma.user.update({
                    where: { id: submission.coderId },
                    data: { level: newLevel }
                });
            }
        }
        else if (action === 'CHANGES_REQUESTED') {
            // Coder needs to edit and resubmit
            await db_1.prisma.submission.update({
                where: { id: submissionId },
                data: { status: 'CHANGES_REQUESTED' },
            });
            await db_1.prisma.task.update({
                where: { id: submission.taskId },
                data: { status: 'IN_PROGRESS' },
            });
        }
        else if (action === 'REJECTED') {
            // Rejection of submission
            await db_1.prisma.submission.update({
                where: { id: submissionId },
                data: { status: 'REJECTED' },
            });
            // Re-open task so someone else can claim it
            await db_1.prisma.task.update({
                where: { id: submission.taskId },
                data: { status: 'OPEN' },
            });
        }
        // Increment mentor reputation & count
        await db_1.prisma.user.update({
            where: { id: req.user.id },
            data: {
                reputation: { increment: 10 }
            }
        });
        res.json({ message: `Submission reviewed successfully with action: ${action}`, review });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
