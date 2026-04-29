import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  addSubtask,
  updateSubtask,
  deleteSubtask,
} from '../controllers/taskController';

const router = Router();

router.use(protect);

router.post('/', createTask);
router.get('/', getTasks);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

router.post('/:taskId/subtasks', addSubtask);
router.patch('/:taskId/subtasks/:subtaskId', updateSubtask);
router.delete('/:taskId/subtasks/:subtaskId', deleteSubtask);

export default router;
