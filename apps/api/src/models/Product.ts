import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  condition: 'New' | 'Like New' | 'Good' | 'Fair';
  category: string;
  images: string[];
  seller: mongoose.Types.ObjectId;
  pickupLocation: string;
  pickupTime: string;
  isNegotiable: boolean;
  isSold: boolean;
  viewsCount: number;
  likesCount: number;
  aiAnalysis: {
    recommendedPrice: number;
    quickSalePrice: number;
    scamScore: number;
    aiSummary: string;
    isFlagged: boolean;
  };
  createdAt: Date;
}

const ProductSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  condition: { type: String, enum: ['New', 'Like New', 'Good', 'Fair'], default: 'Good' },
  category: { type: String, required: true },
  images: { type: [String], default: [] },
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pickupLocation: { type: String, default: '' },
  pickupTime: { type: String, default: '' },
  isNegotiable: { type: Boolean, default: false },
  isSold: { type: Boolean, default: false },
  viewsCount: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  aiAnalysis: {
    recommendedPrice: { type: Number, default: 0 },
    quickSalePrice: { type: Number, default: 0 },
    scamScore: { type: Number, default: 0 },
    aiSummary: { type: String, default: '' },
    isFlagged: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
