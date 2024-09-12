import { Router } from 'express';
import { body, param } from 'express-validator';
import { ProjectController } from '../controllers/ProjectController';
import inputValidator from '../middlewares/inputValidator';
import { TaskController } from '../controllers/TaskController';
import { validateProjectExist } from '../middlewares/project';
import { authenticate } from '../middlewares/auth';
import { TeamController } from '../controllers/TeamController';
import { hasAuthorization } from '../middlewares/taskPermission';
import { NoteController } from '../controllers/NoteController';

const router = Router();
router.use(authenticate);

router.get('/', ProjectController.findAll);
router.get(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('No es un mongo id')
    .notEmpty()
    .withMessage('El id es obligatorio'),
  inputValidator,
  ProjectController.find
);

router.post(
  '/',
  body('name').notEmpty().withMessage('El nombre es obligatorio').trim(),
  body('client').notEmpty().withMessage('El cliente es obligatorio').trim(),
  body('description')
    .notEmpty()
    .withMessage('La descripcion es obligatoria')
    .trim(),
  inputValidator,
  ProjectController.create
);

router.put(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('No es un mongo id')
    .notEmpty()
    .withMessage('El id es obligatorio'),
  body('name').notEmpty().withMessage('El nombre es obligatorio').trim(),
  body('client').notEmpty().withMessage('El cliente es obligatorio').trim(),
  body('description')
    .notEmpty()
    .withMessage('La descripcion es obligatoria')
    .trim(),

  inputValidator,
  ProjectController.update
);

router.delete(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('No es un mongo id')
    .notEmpty()
    .withMessage('El id es obligatorio'),
  inputValidator,
  ProjectController.remove
);

/** Task Routes */

router.param('projectId', validateProjectExist);

router.post(
  '/:projectId/tasks',
  hasAuthorization,
  param('projectId')
    .isMongoId()
    .withMessage('No es un mongo id')
    .notEmpty()
    .withMessage('El project id es obligatorio'),
  body('name').notEmpty().withMessage('El nombre es obligatorio').trim(),
  body('description')
    .notEmpty()
    .withMessage('La descripcion es obligatoria')
    .trim(),
  inputValidator,
  TaskController.create
);

router.get(
  '/:projectId/tasks/:id',
  param('projectId')
    .isMongoId()
    .withMessage('No es un mongo id')
    .notEmpty()
    .withMessage('El project id es obligatorio'),
  param('id')
    .isMongoId()
    .withMessage('No es un mongo id')
    .notEmpty()
    .withMessage('El project id es obligatorio'),
  inputValidator,
  TaskController.find
);

router.get(
  '/:projectId/tasks/',
  param('projectId')
    .isMongoId()
    .withMessage('No es un mongo id')
    .notEmpty()
    .withMessage('El project id es obligatorio'),
  inputValidator,
  TaskController.findAll
);

router.put(
  '/:projectId/tasks/:id',
  hasAuthorization,
  param('projectId')
    .isMongoId()
    .withMessage('No es un mongo id')
    .notEmpty()
    .withMessage('El project id es obligatorio'),
  param('id')
    .isMongoId()
    .withMessage('No es un mongo id')
    .notEmpty()
    .withMessage('El project id es obligatorio'),
  body('name').notEmpty().withMessage('El nombre es obligatorio').trim(),
  body('description')
    .notEmpty()
    .withMessage('La descripcion es obligatoria')
    .trim(),
  inputValidator,
  TaskController.update
);

router.delete(
  '/:projectId/tasks/:id',
  hasAuthorization,
  param('projectId')
    .isMongoId()
    .withMessage('No es un mongo id')
    .notEmpty()
    .withMessage('El project id es obligatorio'),
  param('id')
    .isMongoId()
    .withMessage('No es un mongo id')
    .notEmpty()
    .withMessage('El project id es obligatorio'),
  inputValidator,
  TaskController.remove
);

router.patch(
  '/:projectId/tasks/:id/status',
  param('projectId')
    .isMongoId()
    .withMessage('No es un mongo id')
    .notEmpty()
    .withMessage('El project id es obligatorio'),
  param('id')
    .isMongoId()
    .withMessage('No es un mongo id')
    .notEmpty()
    .withMessage('El project id es obligatorio'),
  body('status').notEmpty().withMessage('El estatus es obligatorio').trim(),
  inputValidator,
  TaskController.updateStatus
);

/** Routes for team */
router.post(
  '/:projectId/team/find',
  body('email').isEmail().toLowerCase().withMessage('Email no valido'),
  inputValidator,
  TeamController.findMemberByEmail
);

router.post(
  '/:projectId/team',
  body('id').isMongoId().withMessage('ID no valido'),
  inputValidator,
  TeamController.addMemberById
);

router.get('/:projectId/team', TeamController.getProjectTeam);

router.delete('/:projectId/team/:memberId', TeamController.deleteMemberById);

/** Routes for notes */
router.post(
  '/:projectId/task/:taskId/notes',
  body('content').notEmpty().withMessage('El contenido es obligatorio'),
  inputValidator,
  NoteController.create
);

router.get(
  '/:projectId/task/:taskId/notes',
  NoteController.getTaskNotes
);

router.delete(
  '/:projectId/task/:taskId/notes/:noteId',
  param('id').isMongoId().withMessage('No es un mongo id valido'),
  NoteController.remove
);
export default router;
