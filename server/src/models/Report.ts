import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  reporter: mongoose.Types.ObjectId;
  reportedProduct?: mongoose.Types.ObjectId;
  reportedUser?: mongoose.Types.ObjectId;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
}

const ReportSchema: Schema = new Schema({
  reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reportedProduct: { type: Schema.Types.ObjectId, ref: 'Product' },
  reportedUser: { type: Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' }
}, {
  timestamps: true
});

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
