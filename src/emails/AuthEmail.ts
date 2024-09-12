import { transporter } from '../config/nodemailer';
import token from '../models/Token';

interface IEmail {
  email: string;
  name: string;
  token: string;
}

export class AuthEmail {
  static sendConfirmationEmail = async ({ email, token, name }: IEmail) => {
    const info = await transporter.sendMail({
      from: 'UpTask <admin@uptask.com>',
      to: email,
      subject: 'Confirma tu cuenta',
      text: 'Confirma tu cuenta',
      html: `<p>Hola ${name}, has creado tu cuenta en upTask, ya casi esta todo listo, solo debes confirmar tu cuenta</p>
        <p>Visita el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirma cuenta</a>
        <p>E ingresa el codigo: <b>${token}</b></p>
        <p>Este token expira en 10 minutos</p>
      `,
    });
  };

  static sendPasswordResetToken = async ({ email, token, name }: IEmail) => {
    const info = await transporter.sendMail({
      from: 'UpTask <admin@uptask.com>',
      to: email,
      subject: 'Restablece tu password',
      text: 'Restablece tu password',
      html: `<p>Hola ${name}, has solicitado restablecer tu password.</p>
        <p>Visita el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/auth/new-password">Restablecer Password</a>
        <p>E ingresa el codigo: <b>${token}</b></p>
        <p>Este token expira en 10 minutos</p>
      `,
    });
  };
}
