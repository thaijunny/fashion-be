import { Router } from 'express';
import {
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getAllProjectsAdmin,
  getOrderedProjectsAdmin
} from '../controllers/project.controller.js';
import { protect, isAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// Admin routes (put before /:id to avoid conflict)
router.get('/admin/all', protect, isAdmin, getAllProjectsAdmin);
router.get('/admin/ordered', protect, isAdmin, getOrderedProjectsAdmin);

router.use(protect); // All other project routes require authentication

router.post('/', createProject);
router.get('/', getUserProjects);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
