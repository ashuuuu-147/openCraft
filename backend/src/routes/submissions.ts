// backend/src/routes/submissions.ts
import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateJWT, AuthRequest, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Submit work for a claimed task
router.post('/', authenticateJWT, requireRole(['CODER']), async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, prUrl, description } = req.body;

    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!taskId || !prUrl || !description) {
      return res.status(400).json({ error: 'Task ID, PR URL, and description are required' });
    }

    // Validate that the PR URL looks like a GitHub PR
    const githubPrRegex = /github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/;
    if (!githubPrRegex.test(prUrl)) {
      return res.status(400).json({ error: 'Invalid PR URL. Must be a valid GitHub Pull Request link (e.g. github.com/owner/repo/pull/12)' });
    }

    // Find the claim submission
    const submission = await prisma.submission.findFirst({
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
    const updatedSubmission = await prisma.submission.update({
      where: { id: submission.id },
      data: {
        prUrl,
        description,
        status: 'IN_REVIEW',
        submittedAt: new Date(),
      },
    });

    // Update task status to UNDER_REVIEW
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'UNDER_REVIEW' },
    });

    res.json({ message: 'Submission uploaded successfully for review', submission: updatedSubmission });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get submission details
router.get('/:id', authenticateJWT, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const submission = await prisma.submission.findUnique({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
