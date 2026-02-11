import { Router } from 'express';
import { 
  createProject, 
  getUserProjects, 
  getProjectById, 
  updateProject, 
  deleteProject 
} from '../controllers/project.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect); // All project routes require authentication

router.post('/', createProject);
router.get('/', getUserProjects);
router.get('/:id', getProjectById);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
