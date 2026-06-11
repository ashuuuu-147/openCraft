"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/submissions.ts
const express_1 = require("express");
const db_1 = require("../db");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Submit work for a claimed task
router.post('/', auth_middleware_1.authenticateJWT, (0, auth_middleware_1.requireRole)(['CODER']), async (req, res) => {
    try {
        const { taskId, prUrl, description } = req.body;
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!taskId || !prUrl || !description) {
            return res.status(400).json({ error: 'Task ID, PR URL, and description are required' });
        }
        // Validate that the PR URL looks like a GitHub PR
        const githubPrRegex = /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/;
        if (!githubPrRegex.test(prUrl)) {
            return res.status(400).json({ error: 'Invalid PR URL. Must be a valid GitHub Pull Request link (e.g. github.com/owner/repo/pull/12)' });
        }
        // Find the claim submission
        const submission = await db_1.prisma.submission.findFirst({
            where: {
                taskId,
                coderId: req.user.id,
                status: { in: ['PENDING', 'CHANGES_REQUESTED'] },
            },
        });
        if (!submission) {
            return res.status(400).json({ error: 'You do not have an active claim on this task. You must claim it first.' });
        }
        // Update submission record with PR details and change status to IN_REVIEW
        const updatedSubmission = await db_1.prisma.submission.update({
            where: { id: submission.id },
            data: {
                prUrl,
                description,
                status: 'IN_REVIEW',
                submittedAt: new Date(),
            },
        });
        // Update task status to UNDER_REVIEW
        await db_1.prisma.task.update({
            where: { id: taskId },
            data: { status: 'UNDER_REVIEW' },
        });
        res.json({ message: 'Submission uploaded successfully for review', submission: updatedSubmission });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get submission details
router.get('/:id', auth_middleware_1.authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await db_1.prisma.submission.findUnique({
            where: { id },
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
                        profile: true,
                    }
                },
                reviews: {
                    include: {
                        mentor: {
                            select: {
                                id: true,
                                name: true,
                                profile: { select: { avatar: true } },
                            }
                        }
                    }
                }
            },
        });
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        res.json(submission);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
