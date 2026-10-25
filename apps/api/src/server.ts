import express from 'express';
import cors from 'cors';
import { CONFIG } from './config.js';
import { modelsRouter } from './routes/models.routes.js';
import { generationRouter } from './routes/generation.routes.js';
import { promptRouter } from './routes/prompt.routes.js';
import { projectsRouter } from './routes/projects.routes.js';
import { creditsRouter } from './routes/credits.routes.js';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());

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
