import { Request } from 'express';
import type { IProject } from '../models/Project';
import Task, { type ITask } from '../models/Task';

export default class TasktRepository extends Task {
  static getAllByProject = async (project: IProject['id']) => {
    return await Task.find({ project }).populate('project');
  };

  static getById = async (id: ITask['id'], project: IProject['id']) => {
    const task = await Task.findById(id);

    if (!task) {
      const error = new Error(`No existe la Tarea con el id ${id}`);
      error.status = 404;
      throw error;
    }

    if (task.project.toString() !== project) {
      const error = new Error(
        `La tarea ${id} no pertenece al proyecto ${project}`
      );
      error.status = 400;
      throw error;
    }

    return task;
  };

  static new = async (task: ITask) => {
    return await Task.create(task);
  };

  static update = async (
    id: ITask['id'],
    task: ITask,
    projectId: IProject['id']
  ) => {
    try {
      const taskUpdate = await this.getById(id, projectId);

      taskUpdate.name = task.name;
      taskUpdate.description = task.description;
      await taskUpdate.save();

      return taskUpdate;
    } catch (error: any) {
      const newError = new Error(
        error.message || 'Error al actualizar la tarea'
      );
      newError.status = error.status || 500;
      throw error;
    }
  };

  static remove = async (
    id: ITask['id'],
    projectId: IProject['id'],
    project: IProject
  ) => {
    const task = await this.getById(id, projectId);
    project.tasks = project.tasks.filter(
      (task) => task?.id.toString() !== projectId
    );
    Promise.allSettled([task.deleteOne(), project.save()]);
    return true;
  };

  static updateStatus = async (req: Request) => {
    const { projectId, id } = req.params;
    const { status } = req.body;
    const task = await this.getById(id, projectId);

    const data = {
      user: req.user?.id,
      status,
    };

    task.completedBy.push(data);
    task.status = status;
    await task.save();
    return task;
  };
}
