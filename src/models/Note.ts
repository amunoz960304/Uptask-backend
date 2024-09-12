import mongoose, { Schema, Document, PopulatedDoc, Types } from 'mongoose';
import type { ITask } from './Task';

export interface INote extends Document {
  content: string;
  createdBy: Types.ObjectId;
  task: Types.ObjectId;
}

const NoteSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    task: {
      type: Types.ObjectId,
      ref: 'Task',
      required: true,
    },
  },

  { timestamps: true }
);

const Note = mongoose.model<INote>('Note', NoteSchema);

export default Note;
