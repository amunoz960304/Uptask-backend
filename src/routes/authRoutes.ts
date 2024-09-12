import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { body, param } from 'express-validator';
import inputValidator from '../middlewares/inputValidator';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.post(
  '/create-account',
  body('name').notEmpty().withMessage('El nombre no puede ir vacio'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('El password debe contener minimo 8 caracteres'),
  body('password_confirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Los password no son iguales');
    }
    return true;
  }),
  body('email').isEmail().withMessage('Email no valido'),
  inputValidator,
  AuthController.createAccount
);

router.post(
  '/confirm-account',
  body('token').notEmpty().withMessage('El token no puede ir vacio'),
  inputValidator,
  AuthController.confirmAccount
);

router.post(
  '/login',

  body('email').isEmail().withMessage('Email no valido'),
  body('password').notEmpty().withMessage('El password no puede ir vacio'),
  inputValidator,
  AuthController.login
);

router.post(
  '/request-code',
  body('email').isEmail().withMessage('Email no valido'),
  inputValidator,
  AuthController.requestConfirmationCode
);

router.post(
  '/forgot-password',
  body('email').isEmail().withMessage('Email no valido'),
  inputValidator,
  AuthController.forgotPassword
);

router.post(
  '/validate-token',
  body('token').notEmpty().withMessage('El token no puede ir vacio'),
  inputValidator,
  AuthController.validateToken
);

router.post(
  '/new-password/:token',
  param('token').notEmpty().withMessage('El token no puede ir vacio'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('El password debe contener minimo 8 caracteres'),
  body('password_confirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Los password no son iguales');
    }
    return true;
  }),
  inputValidator,
  AuthController.newPassword
);

/** profile */
router.get('/user', authenticate, AuthController.user);
router.put(
  '/profile',
  authenticate,
  body('name').notEmpty().withMessage('El nombre no puede ir vacio'),
  body('email').isEmail().withMessage('Email no valido'),
  inputValidator,
  AuthController.updateProfile
);

router.post(
  '/update-password',
  authenticate,
  body('password')
    .isLength({ min: 8 })
    .withMessage('El password nuevo debe contener minimo 8 caracteres'),
  body('password_confirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Los password no son iguales');
    }
    return true;
  }),
  body('current_password')
    .notEmpty()
    .withMessage('El password actual es obligatorio'),
  inputValidator,
  AuthController.updatePassword
);

router.post(
  '/check-password',
  authenticate,
  body('password')
    .notEmpty()
    .withMessage('El password actual es obligatorio'),
    inputValidator,
    AuthController.checkPassword
);

export default router;
