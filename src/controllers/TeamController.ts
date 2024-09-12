import { Response, Request } from 'express';
import UserRepository from '../repositories/UserRespository';
import ProjectRepository from '../repositories/ProjectRepository';

export class TeamController {
  static findMemberByEmail = async (req: Request, res: Response) => {
    const { email } = req.body;

    const user = await UserRepository.findOne({ email }).select(
      'id email name'
    );

    if (!user) {
      const error = new Error('Usuario no encontrado');
      return res.status(404).json({ error: error.message });
    }

    return res.json(user);
  };

  static addMemberById = async (req: Request, res: Response) => {
    const { id } = req.body;

    const user = await UserRepository.findById(id).select('id');

    if (!user) {
      const error = new Error('Usuario no encontrado');
      return res.status(404).json({ error: error.message });
    }

    const existOnProject = req.project.team.some(
      (team) => team?.toString() === user.id.toString()
    );

    if (existOnProject) {
      const error = new Error('El usuario ya existe en el proyecto');
      return res.status(409).json({ error: error.message });
    }

    req.project.team.push(user.id);
    await req.project.save();

    return res.send('Usuario agregado corectamente');
  };

  static getProjectTeam = async (req: Request, res: Response) => {
    const project = await ProjectRepository.findById(req.project.id).populate({
      path: 'team',
      select: 'id email name',
    });

    return res.json(project?.team);
  };

  static deleteMemberById = async (req: Request, res: Response) => {
    const { memberId } = req.params;

    const existOnProject = req.project.team.some(
      (team) => team?.toString() === memberId.toString()
    );

    if (!existOnProject) {
      const error = new Error('El usuario no existe en el proyecto');
      return res.status(409).json({ error: error.message });
    }

    req.project.team = req.project.team.filter(
      (team) => team?.toString() !== memberId.toString()
    );

    await req.project.save();

    return res.send('Usuario eliminado corectamente');
  };
}
