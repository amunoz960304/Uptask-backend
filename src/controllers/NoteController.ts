import type { Request, Response } from 'express';
import Note, { INote } from '../models/Note';
import Task from '../models/Task';

export class NoteController {
  static create = async (req: Request, res: Response) => {
    const { taskId } = req.params;
    const { content } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        error: `No existe la tarea con el id ${taskId}}`,
      });
    }
    const note = new Note();
    note.content = content;
    note.task = task.id;
    note.createdBy = req.user?.id;

    task.notes.push(note.id);

    try {
      Promise.allSettled([note.save(), task.save()]);

      return res.send('Nota creada correctamente');
    } catch (e: unknown) {
      return res.status(500).json({
        error: 'Hubo un error',
      });
    }
  };

  static getTaskNotes = async (req: Request, res: Response) => {
    try {
      const notes = await Note.find({ task: req.params.taskId }).populate({
        path: 'createdBy',
        select: 'id email name',
      });
      return res.json(notes);
    } catch (e: unknown) {
      return res.status(500).json({
        error: 'Hubo un error',
      });
    }
  };

  static remove = async (req: Request, res: Response) => {
    try {
      const { noteId, taskId } = req.params;
      const note = await Note.findById(noteId);

      if (!note) {
        return res.status(404).json({
          error: `No existe la nota con el id ${noteId}}`,
        });
      }

      if (note.createdBy.toString() !== req.user?.id.toString()) {
        return res.status(401).json({
          error: 'Accion no valida',
        });
      }

      const task = await Task.findById(taskId);

      if (!task) {
        return res.status(404).json({
          error: `No existe la tarea con el id ${taskId}}`,
        });
      }

      task.notes = task.notes.filter((note) => note.id.toString() !== noteId);

      Promise.allSettled([task.save(), note.deleteOne()]);
      return res.send('Nota eliminada correctamente');
    } catch (e: unknown) {
      return res.status(500).json({
        error: 'Hubo un error',
      });
    }
  };
}
