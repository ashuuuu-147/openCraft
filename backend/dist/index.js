"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/index.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const submissions_1 = __importDefault(require("./routes/submissions"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const users_1 = __importDefault(require("./routes/users"));
const organizations_1 = __importDefault(require("./routes/organizations"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Enable CORS for frontend running on localhost:3000
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express_1.default.json());
// Logger middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/tasks', tasks_1.default);
app.use('/api/submissions', submissions_1.default);
app.use('/api/reviews', reviews_1.default);
app.use('/api/users', users_1.default);
app.use('/api/orgs', organizations_1.default);
const email_1 = require("./utils/email");
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        email: (0, email_1.getEmailConfigStatus)()
    });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: 'An internal server error occurred' });
});
app.listen(PORT, () => {
    console.log(`🚀 OpenCraft API running on http://localhost:${PORT}`);
});
