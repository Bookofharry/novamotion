import express from 'express';
import cors from 'cors';
import path from 'path';
import { CONFIG } from './config.js';
import { modelsRouter } from './routes/models.routes.js';
import { generationRouter } from './routes/generation.routes.js';
import { promptRouter } from './routes/prompt.routes.js';
import { projectsRouter } from './routes/projects.routes.js';
import { creditsRouter } from './routes/credits.routes.js';
import { uploadRouter } from './routes/upload.routes.js';
import { settingsRouter } from './routes/settings.routes.js';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());

// Serve uploaded media files statically
const uploadsDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'videolab-api',
  });
});

// Routes
app.use('/api/v1/models', modelsRouter);
app.use('/api/v1/generate', generationRouter);
app.use('/api/v1', generationRouter); // supports both /api/v1/generate and /api/v1/jobs
app.use('/api/v1/prompt', promptRouter);
app.use('/api/v1/projects', projectsRouter);
app.use('/api/v1/credits', creditsRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/settings', settingsRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]:', err);
  res.status(500).json({
    success: false,
    error: err?.message || 'Internal Server Error',
  });
});

app.listen(CONFIG.PORT, () => {
  console.log(`🚀 VideoLab API server listening on http://localhost:${CONFIG.PORT}`);
  console.log(`🎯 Active environment: ${CONFIG.NODE_ENV}`);
});
