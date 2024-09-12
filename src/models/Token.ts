import mongoose, { Schema, Document, Types, mongo } from 'mongoose';

export interface IToken extends Document {
  token: string;
  user: Types.ObjectId;
  createdAt: Date;
}

const tokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  user: {
    type: Types.ObjectId,
    ref: 'User',
  },
  expiresAt: {
    type: Date,
    default: new Date(),
    expires: '10m',
  },
});

const token = mongoose.model<IToken>('Token', tokenSchema);

export default token;
