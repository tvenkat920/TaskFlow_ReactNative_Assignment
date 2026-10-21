import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { authenticate } from '../middleware/authMiddleware';
import { validateBody, validateQuery } from '../middleware/validateMiddleware';
import { createTaskSchema, updateTaskSchema, taskQuerySchema } from '../validators/taskValidators';

const router = Router();

// Protect all task endpoints with JWT authentication
router.use(authenticate);

router.get('/', validateQuery(taskQuerySchema), TaskController.getTasks);
router.post('/', validateBody(createTaskSchema), TaskController.createTask);
router.get('/:id', TaskController.getTaskById);
router.patch('/:id', validateBody(updateTaskSchema), TaskController.updateTask);
router.patch('/:id/complete', TaskController.toggleComplete);
router.delete('/:id', TaskController.deleteTask);

export default router;
