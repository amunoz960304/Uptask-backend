import type { Request, Response } from 'express';
import ProjectRepository from '../repositories/ProjectRepository';

export class ProjectController {
  static findAll = async (req: Request, res: Response) => {
    const projects = await ProjectRepository.getAll(req.user?.id);
    return res.json(projects);
  };

  static find = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const project = await ProjectRepository.getById(id);

      if (
        project.manager?.toString() != req.user?.id.toString() &&
        project.team?.some((member) => member?.toString() === id)
      ) {
        const error = new Error('Accion no valida');
        return res.status(404).json({
          error: error.message,
        });
      }

      return res.json(project);
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static create = async (req: Request, res: Response) => {
    try {
      const project = new ProjectRepository(req.body);
      project.manager = req.user?.id;
      await project.save();
      return res.status(201).send('Proyecto Creado Correctamente');
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static update = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;

      const project = await ProjectRepository.getById(id);

      if (project.manager?.toString() !== req.user?.id.toString()) {
        const error = new Error('Solo el manager puede actualizar el proyecto');
        return res.status(404).json({
          error: error.message,
        });
      }

      await ProjectRepository.update(req.body, project);

      return res.send('Proyecto Actualizado Correctamente');
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };

  static remove = async (req: Request, res: Response) => {
    try {
      await ProjectRepository.remove(req.params.id, req.user?.id);
      return res.send('Proyecto Eliminado Correctamente');
    } catch (error: any) {
      return res.status(error.status || 500).json({
        error: error.message,
      });
    }
  };
}
