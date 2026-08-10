import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type: 'message' | 'offer' | 'wishlist' | 'price_drop' | 'system';
  title: string;
  body: string;
  referenceId?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['message', 'offer', 'wishlist', 'price_drop', 'system'], required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  referenceId: { type: String },
  isRead: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
