import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;

export async function getUploadSignature(req: AuthenticatedRequest, res: Response) {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    return res.status(200).json({
      success: true,
      cloudName: CLOUDINARY_CLOUD_NAME || 'campusmart_demo',
      apiKey: CLOUDINARY_API_KEY || 'demo_key',
      timestamp,
      folder: 'campusmart/products',
      uploadPreset: 'campusmart_unsigned'
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function uploadImageDirect(req: AuthenticatedRequest, res: Response) {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'imageBase64 payload is required.' });
    }

    // Return structured uploaded image metadata
    const mockUrl = imageBase64.startsWith('data:image')
      ? imageBase64
      : `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80`;

    return res.status(200).json({
      success: true,
      url: mockUrl,
      publicId: `campusmart_${Date.now()}`,
      format: 'png',
      width: 800,
      height: 600
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
