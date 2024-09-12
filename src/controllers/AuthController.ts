import type { Request, Response } from 'express';
import UserRepository from '../repositories/UserRespository';
import { generateToken } from '../utils/token';
import Token from '../models/Token';
import User from '../models/User';
import { hashPassword, validatePassword } from '../utils/auth';
import { AuthEmail } from '../emails/AuthEmail';
import { generateJWT } from '../utils/jwt';

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const userExist = await UserRepository.getByEmail(email);

      if (userExist) {
        const error = new Error(
          `El correo ${email} ya pertenece a otra cuenta`
        );

        return res.status(409).json({ error: error.message });
      }

      const user = new User(req.body);
      user.password = await hashPassword(password);

      const token = new Token();
      token.token = generateToken();
      token.user = user.id;

      await AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await Promise.allSettled([user.save(), token.save()]);

      res.send('Cuenta creada, revisa tu email para confirmarla');
    } catch (error: any) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExist = await Token.findOne({ token });

      if (!tokenExist) {
        const error = new Error(`Token no valido`);
        return res.status(401).json({ error: error.message });
      }
      const user = await User.findById(tokenExist.user);

      if (user) {
        user.confirmed = true;
        await Promise.allSettled([user.save(), tokenExist.deleteOne()]);
        res.send('Cuenta confirmada Correctamente');
      }
    } catch (error: any) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const user = await UserRepository.getByEmail(email);

      if (!user) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({ error: error.message });
      }

      if (!user.confirmed) {
        const token = new Token();
        token.user = user.id;
        token.token = generateToken();

        await AuthEmail.sendConfirmationEmail({
          email: user.email,
          name: user.name,
          token: token.token,
        });

        await token.save();
        const error = new Error(
          'La cuenta no ha sido confirmada, hemos enviado un email de confirmacion'
        );
        return res.status(401).json({ error: error.message });
      }

      const isPasswordCorrect = await validatePassword(password, user.password);

      if (!isPasswordCorrect) {
        const error = new Error('Password incorrecto');
        return res.status(403).json({ error: error.message });
      }

      const jwt = generateJWT({ id: user.id });

      res.send(jwt);
    } catch (error: any) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static requestConfirmationCode = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = await UserRepository.getByEmail(email);

      if (!user) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({ error: error.message });
      }

      if (user.confirmed) {
        const error = new Error('La cuenta ya ha sido confirmada');
        return res.status(409).json({ error: error.message });
      }

      const token = new Token();
      token.user = user.id;
      token.token = generateToken();

      await AuthEmail.sendConfirmationEmail({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      await token.save();
      return res.send('Se envio un nuevo token a tu email');
    } catch (error: any) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static forgotPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const user = await UserRepository.getByEmail(email);

      if (!user) {
        const error = new Error('Usuario no encontrado');
        return res.status(404).json({ error: error.message });
      }

      const token = new Token();
      token.user = user.id;
      token.token = generateToken();
      await token.save();

      await AuthEmail.sendPasswordResetToken({
        email: user.email,
        name: user.name,
        token: token.token,
      });

      return res.send('Se envio un nuevo token a tu email');
    } catch (error: any) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static validateToken = async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const tokenExist = await Token.findOne({ token });

      if (!tokenExist) {
        const error = new Error(`Token no valido`);
        return res.status(401).json({ error: error.message });
      }

      res.send('Token valido, define tu nuevo password');
    } catch (error: any) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static newPassword = async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
      const tokenExist = await Token.findOne({ token });

      if (!tokenExist) {
        const error = new Error(`Token no valido`);
        return res.status(401).json({ error: error.message });
      }

      const user = await UserRepository.getById(tokenExist.user);
      user.password = await hashPassword(password);

      await Promise.allSettled([user.save(), tokenExist.deleteOne()]);

      res.send('El password se modifico correctamente');
    } catch (error: any) {
      res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static user = async (req: Request, res: Response) => {
    return res.json(req.user);
  };

  static updateProfile = async (req: Request, res: Response) => {
    const { name, email } = req.body;

    try {
      const userExist = await UserRepository.getByEmail(email);
      if (userExist && email !== userExist.email) {
        const error = new Error('El email ingresado no esta disponible');
        return res.status(409).json({ error: error.message });
      }
    } catch (e: unknown) {}

    try {
      req.user!.name = name;
      req.user!.email = email;

      await req.user!.save();
      return res.send('Perfil actualizado correctamente');
    } catch (error: unknown) {
      return res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static updatePassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;

    try {
      const currentUser = await UserRepository.getById(req.user!.id);

      const isValidPassword = await validatePassword(
        current_password,
        currentUser.password
      );

      if (!isValidPassword) {
        return res
          .status(401)
          .json({ error: 'El password ingresado es incorrecto' });
      }

      req.user!.password = await hashPassword(password);
      await req.user!.save();

      return res.send('password actualizado correctamente');
    } catch (error: unknown) {
      return res.status(500).json({ error: 'Hubo un error' });
    }
  };

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;

    try {
      const currentUser = await UserRepository.getById(req.user!.id);

      const isValidPassword = await validatePassword(
        password,
        currentUser.password
      );

      if (!isValidPassword) {
        return res.status(401).json({
          error: 'El password ingresado es incorrecto',
        });
      }

      return res.send('Password Correcto');
    } catch (error: unknown) {
      return res.status(500).json({
        error: 'Hubo un error',
      });
    }
  };
}
