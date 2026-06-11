// backend/src/routes/tasks.ts
import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateJWT, AuthRequest, requireRole } from '../middleware/auth.middleware';

const router = Router();

// 1. Get all tasks with filters
router.get('/', async (req, res) => {
  try {
    const { language, difficulty, reward, status } = req.query;

    const whereClause: any = {};

    // Filter by language (tags or database field)
    if (language) {
      whereClause.tags = {
        contains: String(language),
      };
    }

    // Filter by difficulty
    if (difficulty) {
      whereClause.difficulty = String(difficulty);
    }

    // Filter by status (default to OPEN if not specified)
    if (status) {
      whereClause.status = String(status);
    } else {
      // By default, show tasks that are OPEN or IN_PROGRESS
      whereClause.status = {
        in: ['OPEN', 'IN_PROGRESS'],
      };
    }

    // Filter by reward (Paid vs Volunteer)
    if (reward) {
      if (reward === 'paid') {
        whereClause.cashReward = {
          gt: 0,
        };
      } else if (reward === 'volunteer') {
        whereClause.cashReward = 0.0;
      }
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        org: {
          select: {
            name: true,
            logo: true,
            verified: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Get task details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        org: true,
        submissions: {
          include: {
            coder: {
              select: {
                id: true,
                name: true,
                githubLogin: true,
                profile: { select: { avatar: true } },
              },
            },
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Post a new task (Org only)
router.post('/', authenticateJWT, requireRole(['ORG_ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, type, difficulty, repoUrl, issueUrl, reward, cashReward, tags, deadline } = req.body;

    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    // Find organization associated with user
    const org = await prisma.organization.findFirst({
      where: { userId: req.user.id }
    });

    if (!org) {
      return res.status(400).json({ error: 'Please register your organization profile first before posting tasks' });
    }

    const rewardAmount = reward ? parseInt(reward) : 0;
    const cashRewardAmount = cashReward ? parseFloat(cashReward) : 0.0;

    // UX Rule: Organization must be verified before posting paid tasks
    if (cashRewardAmount > 0 && !org.verified) {
      return res.status(403).json({
        error: 'Your organization must be verified by OpenCraft admins before you can post paid tasks'
      });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        type: type || 'BUG_FIX',
        difficulty: difficulty || 'EASY',
        repoUrl,
        issueUrl,
        orgId: org.id,
        reward: rewardAmount,
        cashReward: cashRewardAmount,
        tags: tags || '',
        deadline: deadline ? new Date(deadline) : null,
        status: 'OPEN',
      },
    });

    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Claim a task (Coder only)
router.post('/:id/claim', authenticateJWT, requireRole(['CODER']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        submissions: {
          where: {
            status: { in: ['PENDING', 'IN_REVIEW'] },
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.status !== 'OPEN') {
      return res.status(400).json({ error: 'This task is not open for claiming' });
    }

    // UX Rule: Coder can only claim 1 active task at a time (claimed or under review)
    const activeClaim = await prisma.submission.findFirst({
      where: {
        coderId: req.user.id,
        status: { in: ['PENDING', 'IN_REVIEW', 'CHANGES_REQUESTED'] },
      },
    });

    if (activeClaim) {
      return res.status(400).json({
        error: 'You already have an active claimed or submitted task. You must complete or unclaim it first.',
        activeTaskId: activeClaim.taskId,
      });
    }

    // Check if task is already locked by someone else
    const now = new Date();
    const activeOthers = task.submissions.find(
      (s) => s.status === 'PENDING' && s.claimExpiry && s.claimExpiry > now
    );

    if (activeOthers) {
      return res.status(400).json({ error: 'This task is currently locked by another contributor' });
    }

    // 72-hour claim expiry
    const claimExpiry = new Date();
    claimExpiry.setHours(claimExpiry.getHours() + 72);

    // Create a new submission record in PENDING state (acting as claimed)
    const submission = await prisma.submission.create({
      data: {
        taskId: task.id,
        coderId: req.user.id,
        prUrl: '',
        description: '',
        status: 'PENDING',
        claimedAt: new Date(),
        claimExpiry,
      },
    });

    // Update task status to IN_PROGRESS
    await prisma.task.update({
      where: { id: task.id },
      data: { status: 'IN_PROGRESS' },
    });

    res.json({ message: 'Task claimed successfully', submission });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Unclaim a task (Coder only)
router.post('/:id/unclaim', authenticateJWT, requireRole(['CODER']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    // Find the pending/claimed submission
    const submission = await prisma.submission.findFirst({
      where: {
        taskId: id,
        coderId: req.user.id,
        status: 'PENDING',
      },
    });

    if (!submission) {
      return res.status(404).json({ error: 'No active claim found for this task by you' });
    }

    // Delete the submission claim
    await prisma.submission.delete({
      where: { id: submission.id },
    });

    // Re-open the task
    await prisma.task.update({
      where: { id },
      data: { status: 'OPEN' },
    });

    res.json({ message: 'Task unclaimed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
