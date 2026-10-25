import { Router } from 'express';
import { Project } from '@videolab/shared';
import { v4 as uuidv4 } from 'uuid';

export const projectsRouter = Router();

const projects: Project[] = [
  {
    id: 'proj-default',
    name: 'Main Production Studio',
    description: 'Default project workspace for video generations',
    videoCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

projectsRouter.get('/', (req, res) => {
  res.json({
    success: true,
    data: projects,
  });
});

projectsRouter.post('/', (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    res.status(400).json({ success: false, error: 'Project name is required' });
    return;
  }

  const newProject: Project = {
    id: `proj-${uuidv4().substring(0, 8)}`,
    name: name.trim(),
    description: description?.trim() || '',
    videoCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  projects.push(newProject);
  res.status(201).json({
    success: true,
    data: newProject,
  });
});
