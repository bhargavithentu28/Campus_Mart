import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  chat: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  text: string;
  image?: string;
  file?: string;
  seen: boolean;
  createdAt: Date;
}

const MessageSchema: Schema = new Schema({
  chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, default: '' },
  image: { type: String, default: '' },
  file: { type: String, default: '' },
  seen: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
