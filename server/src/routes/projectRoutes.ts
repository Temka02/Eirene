import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  getProject,
} from '../controllers/projectController';

const router = Router();

router.use(protect);

router.post('/', createProject);
router.get('/:id', getProject);
router.get('/', getProjects);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);

export default router;
