"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/db/seed.ts
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
        console.log('Database already has users. Skipping seeding.');
        return;
    }
    console.log('Clearing database...');
    // Delete in order to avoid foreign key constraints
    await prisma.reward.deleteMany({});
    await prisma.badge.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.submission.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.organization.deleteMany({});
    await prisma.profile.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Seeding users...');
    const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
    // 1. Seed Org Admins
    const devtoolAdmin = await prisma.user.create({
        data: {
            email: 'admin@devtoolco.com',
            name: 'DevToolCo Admin',
            password: hashedPassword,
            role: 'ORG_ADMIN',
        }
    });
    const openaiAdmin = await prisma.user.create({
        data: {
            email: 'admin@openai-sdk.org',
            name: 'OpenAI SDK Admin',
            password: hashedPassword,
            role: 'ORG_ADMIN',
        }
    });
    const rustlangAdmin = await prisma.user.create({
        data: {
            email: 'admin@rustlang.org',
            name: 'Rustlang Admin',
            password: hashedPassword,
            role: 'ORG_ADMIN',
        }
    });
    // 2. Seed Organizations
    const devToolCo = await prisma.organization.create({
        data: {
            userId: devtoolAdmin.id,
            name: 'DevToolCo',
            description: 'Building developer experience and developer testing tools.',
            website: 'https://devtoolco.example.com',
            verified: true,
            logo: 'https://api.dicebear.com/7.x/initials/svg?seed=DTC&backgroundColor=03a9f4',
        }
    });
    const openaiSDK = await prisma.organization.create({
        data: {
            userId: openaiAdmin.id,
            name: 'OpenAI SDK Project',
            description: 'Community SDKs and wrappers for OpenAI models.',
            website: 'https://openai.example.com',
            verified: true,
            logo: 'https://api.dicebear.com/7.x/initials/svg?seed=OA&backgroundColor=10b981',
        }
    });
    const rustlangComm = await prisma.organization.create({
        data: {
            userId: rustlangAdmin.id,
            name: 'Rustlang Community',
            description: 'Open source tools built by the community for the Rust language.',
            website: 'https://rustlang.example.org',
            verified: true,
            logo: 'https://api.dicebear.com/7.x/initials/svg?seed=RL&backgroundColor=f59e0b',
        }
    });
    // 3. Seed Mentors
    const mentor1 = await prisma.user.create({
        data: {
            email: 'alex@opencraft.dev',
            name: 'Alex Mentor',
            password: hashedPassword,
            role: 'MENTOR',
            level: 'MENTOR_LEVEL',
            reputation: 150,
            profile: {
                create: {
                    bio: 'Senior JS & Python engineer. Open source maintainer for 8+ years.',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
                    stack: 'JavaScript,TypeScript,Python,Node.js,React',
                    timezone: 'EST',
                }
            }
        }
    });
    const mentor2 = await prisma.user.create({
        data: {
            email: 'sarah@opencraft.dev',
            name: 'Sarah Tech',
            password: hashedPassword,
            role: 'MENTOR',
            level: 'MENTOR_LEVEL',
            reputation: 220,
            profile: {
                create: {
                    bio: 'Systems Programmer. Loves Rust, Go, and low-level optimization.',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
                    stack: 'Rust,Go,C++,WebAssembly',
                    timezone: 'CET',
                }
            }
        }
    });
    // 4. Seed Coders (to make logging in and testing immediate)
    const coder1 = await prisma.user.create({
        data: {
            email: 'coder@opencraft.dev',
            name: 'Jane Dev',
            password: hashedPassword,
            role: 'CODER',
            level: 'BEGINNER',
            reputation: 15,
            githubLogin: 'janedev',
            profile: {
                create: {
                    bio: 'Junior fullstack developer. Excited about open source!',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
                    stack: 'JavaScript,React,CSS,Tailwind',
                    timezone: 'IST',
                }
            }
        }
    });
    const coder2 = await prisma.user.create({
        data: {
            email: 'verified.coder@opencraft.dev',
            name: 'John Pro',
            password: hashedPassword,
            role: 'CODER',
            level: 'VERIFIED',
            reputation: 85,
            githubLogin: 'johnpro',
            profile: {
                create: {
                    bio: 'React and Python enthusiast. Completed multiple OSS warm-ups.',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
                    stack: 'JavaScript,TypeScript,React,Python,Django',
                    timezone: 'GMT',
                }
            }
        }
    });
    // 5. Seed Tasks (4x JS, 3x Python, 3x Rust)
    const tasksData = [
        // JS Tasks
        {
            title: 'Fix auth middleware token leakage',
            description: 'The authentication middleware leaks active token structures in response headers on specific redirect codes. Audit src/middleware/auth.ts and ensure no bearer tokens are appended to query strings or headers.',
            type: 'BUG_FIX',
            difficulty: 'MEDIUM',
            repoUrl: 'https://github.com/DevToolCo/dx-auth',
            issueUrl: 'https://github.com/DevToolCo/dx-auth/issues/234',
            orgId: devToolCo.id,
            status: 'OPEN',
            reward: 30,
            cashReward: 50.0,
            tags: 'JavaScript,Security,Express',
        },
        {
            title: 'Document CLI commands and configuration hooks',
            description: 'Create a comprehensive guide in README.md detailing all flags, environment parameters, and config files for our deployment client. Include snippets for dev, testing, and production environments.',
            type: 'DOCUMENTATION',
            difficulty: 'STARTER',
            repoUrl: 'https://github.com/DevToolCo/deploy-cli',
            issueUrl: 'https://github.com/DevToolCo/deploy-cli/issues/45',
            orgId: devToolCo.id,
            status: 'OPEN',
            reward: 10,
            cashReward: 0.0, // Volunteer
            tags: 'JavaScript,Markdown,Documentation',
        },
        {
            title: 'Refactor client storage wrapper to use LocalStorage fallback',
            description: 'In server-less environments, memory storage should fallback gracefully. Refactor src/storage.ts to detect storage availability and switch between memory and localStorage context.',
            type: 'REFACTOR',
            difficulty: 'STARTER',
            repoUrl: 'https://github.com/DevToolCo/storage-sdk',
            issueUrl: 'https://github.com/DevToolCo/storage-sdk/issues/88',
            orgId: devToolCo.id,
            status: 'OPEN',
            reward: 15,
            cashReward: 25.0,
            tags: 'JavaScript,Refactoring,Vite',
        },
        {
            title: 'Write Jest unit tests for API route handlers',
            description: 'The controller tests are missing verification scenarios for bad payloads and rate-limited clients. Add at least 6 new test fixtures in tests/controllers/api.test.js.',
            type: 'TESTING',
            difficulty: 'MEDIUM',
            repoUrl: 'https://github.com/DevToolCo/dx-auth',
            issueUrl: 'https://github.com/DevToolCo/dx-auth/issues/240',
            orgId: devToolCo.id,
            status: 'OPEN',
            reward: 25,
            cashReward: 25.0,
            tags: 'JavaScript,Testing,Jest',
        },
        // Python Tasks
        {
            title: 'Add support for streaming completions in Python wrapper',
            description: 'Implement chunk-based generator pipelines to handle streaming API responses from ChatCompletions. Ensure standard chunk objects are formatted correctly and yield cleanly.',
            type: 'FEATURE',
            difficulty: 'ADVANCED',
            repoUrl: 'https://github.com/openai-sdk-project/py-wrapper',
            issueUrl: 'https://github.com/openai-sdk-project/py-wrapper/issues/102',
            orgId: openaiSDK.id,
            status: 'OPEN',
            reward: 60,
            cashReward: 100.0,
            tags: 'Python,API,Generators',
        },
        {
            title: 'Fix argument parse error in startup script',
            description: 'The argument parser throws a ValueError when user passes multiple optional environment flags simultaneously. Check main.py line 42 and modify config parsing logic.',
            type: 'BUG_FIX',
            difficulty: 'STARTER',
            repoUrl: 'https://github.com/openai-sdk-project/py-wrapper',
            issueUrl: 'https://github.com/openai-sdk-project/py-wrapper/issues/89',
            orgId: openaiSDK.id,
            status: 'OPEN',
            reward: 12,
            cashReward: 0.0, // Volunteer
            tags: 'Python,CLI,Debugging',
        },
        {
            title: 'Optimize image resizing matrix loops',
            description: 'The matrix calculations in processor.py are currently double-iterating on pixels. Refactor utilizing NumPy vectorized operations to improve performance by 15x.',
            type: 'REFACTOR',
            difficulty: 'ADVANCED',
            repoUrl: 'https://github.com/openai-sdk-project/py-processor',
            issueUrl: 'https://github.com/openai-sdk-project/py-processor/issues/304',
            orgId: openaiSDK.id,
            status: 'OPEN',
            reward: 80,
            cashReward: 100.0,
            tags: 'Python,NumPy,Performance',
        },
        // Rust Tasks
        {
            title: 'Optimize thread pool allocator in parser pipeline',
            description: 'Modify parser.rs to use crossbeam channels for cleaner worker thread allocation. Address lock contention issues in central parsing buffers.',
            type: 'REFACTOR',
            difficulty: 'MEDIUM',
            repoUrl: 'https://github.com/rustlang-community/rust-parser',
            issueUrl: 'https://github.com/rustlang-community/rust-parser/issues/112',
            orgId: rustlangComm.id,
            status: 'OPEN',
            reward: 40,
            cashReward: 50.0,
            tags: 'Rust,Concurrency,Optimization',
        },
        {
            title: 'Implement CLI terminal spinner animations',
            description: 'Integrate a custom terminal rendering loop inside output.rs to display loading status and spinner frames during parsing operations. Ensure handling of Ctrl+C exits.',
            type: 'FEATURE',
            difficulty: 'MEDIUM',
            repoUrl: 'https://github.com/rustlang-community/rust-cli-fmt',
            issueUrl: 'https://github.com/rustlang-community/rust-cli-fmt/issues/14',
            orgId: rustlangComm.id,
            status: 'OPEN',
            reward: 35,
            cashReward: 25.0,
            tags: 'Rust,CLI,Animation',
        },
        {
            title: 'Write integration test suite for AST transformer',
            description: 'Write functional tests verifying translation of various syntax trees under tests/transform_tests.rs. Make sure to capture corner-case syntax trees.',
            type: 'TESTING',
            difficulty: 'MEDIUM',
            repoUrl: 'https://github.com/rustlang-community/rust-parser',
            issueUrl: 'https://github.com/rustlang-community/rust-parser/issues/120',
            orgId: rustlangComm.id,
            status: 'OPEN',
            reward: 30,
            cashReward: 50.0,
            tags: 'Rust,Testing,AST',
        }
    ];
    console.log('Seeding tasks...');
    for (const t of tasksData) {
        await prisma.task.create({
            data: t
        });
    }
    // Pre-seed some badges for John Pro
    await prisma.badge.createMany({
        data: [
            { coderId: coder2.id, type: 'FIRST_CONTRIBUTION' },
            { coderId: coder2.id, type: 'LANGUAGE_EXPERT' }
        ]
    });
    console.log('Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
