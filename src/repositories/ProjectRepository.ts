import Project, { type IProject } from '../models/Project';
import type { IUser } from '../models/User';

export default class ProjectRepository extends Project {
  static getAll = async (id: IUser['id']) => {
    return await Project.find({
      $or: [
        {
          manager: { $in: id },
        },
        { team: { $in: id } },
      ],
    }).populate('tasks');
  };

  static getById = async (id: IProject['id']) => {
    const project = await Project.findById(id).populate({
      path: 'tasks',
    });

    if (!project) {
      const error = new Error(`No existe el proyecto con el id ${id}`);
      error.status = 404;
      throw error;
    }

    return project;
  };

  static new = async (project: IProject) => {
    return await Project.create(project);
  };

  static update = async (project: IProject, projectUpdate: IProject) => {
    try {
      projectUpdate.name = project.name;
      projectUpdate.description = project.description;

      await projectUpdate.save();

      return projectUpdate;
    } catch (error: any) {
      const newError = new Error('Error al actualizar el producto');
      newError.status = error.status || 500;
      throw newError;
    }
  };

  static remove = async (id: IProject['id'], userId: IUser['id']) => {
    const project = await this.getById(id);

    if (project.manager?.toString() !== userId.toString()) {
      const error = new Error('Solo el manager puede eliminar el proyecto');
      error.status = 400;
      throw error;
    }

    await project.deleteOne();
    return true;
  };
}
