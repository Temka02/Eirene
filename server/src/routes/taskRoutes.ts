import { Router } from 'express';
import { protect } from '../middleware/auth';
import { createTask, getTasks, updateTask, deleteTask } from '../controllers/taskController';

const router = Router();

router.use(protect);

router.post('/', createTask);
router.get('/', getTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
