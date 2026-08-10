import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  avatar?: string;
  joinedDate: Date;
  department: string;
  year: number;
  branch: string;
  ratings: number[];
  badges: string[];
  isVerified: boolean;
  isAdmin: boolean;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  avatar: { type: String, default: '' },
  joinedDate: { type: Date, default: Date.now },
  department: { type: String, default: '' },
  year: { type: Number, default: 1 },
  branch: { type: String, default: '' },
  ratings: { type: [Number], default: [] },
  badges: { type: [String], default: ['Verified Student'] },
  isVerified: { type: Boolean, default: true },
  isAdmin: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
