// backend/src/routes/organizations.ts
import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateJWT, AuthRequest, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Register/update organization profile (Org only)
router.post('/', authenticateJWT, requireRole(['ORG_ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { name, website, description, logo } = req.body;

    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!name) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    // Check if user already has an organization
    const existingOrg = await prisma.organization.findFirst({
      where: { userId: req.user.id }
    });

    let organization;

    if (existingOrg) {
      organization = await prisma.organization.update({
        where: { id: existingOrg.id },
        data: {
          name,
          website,
          description,
          logo: logo || existingOrg.logo,
        }
      });
    } else {
      organization = await prisma.organization.create({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get organization by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const org = await prisma.organization.findUnique({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get organization dashboard data (Org Admin only)
router.get('/my/dashboard', authenticateJWT, requireRole(['ORG_ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const org = await prisma.organization.findFirst({
      where: { userId: req.user.id }
    });

    if (!org) {
      return res.json({ organization: null, tasks: [] });
    }

    // Get all tasks posted by this org, along with active claimants/submissions
    const tasks = await prisma.task.findMany({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Contributor discovery (Org Admin only, search developers)
router.get('/contributors/discover', authenticateJWT, requireRole(['ORG_ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { skill, level } = req.query;

    const whereClause: any = {
      role: 'CODER'
    };

    // Filter by badge/level
    if (level) {
      whereClause.level = String(level);
    }

    const coders = await prisma.user.findMany({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
