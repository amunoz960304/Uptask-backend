import type { Request, Response } from 'express';
import TaskRepository from '../repositories/TaskRepository';
import Task from '../models/Task';

export class TaskController {
  static create = async (req: Request, res: Response) => {
    try {
      const task = await TaskRepository.new({
        ...req.body,
        project: req.project.id,
      });

      req.project.tasks.push(task.id);
      await req.project.save();

      return res.status(201).json('Tarea Creada Correctamente');
    } catch (error: any) {
      return res.status(error.status || 500).json({
        message: error.message,
      });
    }
  };

  static findAll = async (req: Request, res: Response) => {
    try {
      const tasks = await TaskRepository.getAllByProject(req.project.id);
      return res.json(tasks);
    } catch (error: any) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  };

  static find = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const task = await Task.findById(id)
        .populate({
          path: 'completedBy.user',
          select: 'id name email',
        })
        .populate({
          path: 'notes',
          populate: { path: 'createdBy', select: 'id email name' },
        });

      return res.json(task);
    } catch (error: any) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  };

  static update = async (req: Request, res: Response) => {
    try {
      const { id, projectId } = req.params;
      await TaskRepository.update(id, req.body, projectId);
      return res.send('Tarea Actualizada Correctamente');
    } catch (error: any) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  };

  static remove = async (req: Request, res: Response) => {
    try {
      const { id, projectId } = req.params;
      await TaskRepository.remove(id, projectId, req.project);
      return res.json('Tarea Eliminada Correctamente');
    } catch (error: any) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  };

  static updateStatus = async (req: Request, res: Response) => {
    try {
      await TaskRepository.updateStatus(req);
      return res.json('Estatus Actualizado Correctamente');
    } catch (error: any) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  };
}
