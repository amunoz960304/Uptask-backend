import type { Request, Response, NextFunction } from 'express';
import ProjectRepository from '../repositories/ProjectRepository';
import type { IProject } from '../models/Project';

declare global {
  namespace Express {
    interface Request {
      project: IProject;
    }
  }
}

export const validateProjectExist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { projectId } = req.params;
    const project = await ProjectRepository.getById(projectId);

    req.project = project;

    next();
  } catch (error: any) {
    return res.status(404).json({
      message: error.message,
    });
  }
};
