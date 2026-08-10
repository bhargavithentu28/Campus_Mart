import { z } from 'zod';

export const sendOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address.')
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  code: z.string().length(6, 'OTP must be 6 digits.'),
  name: z.string().optional()
});

export const googleLoginSchema = z.object({
  email: z.string().email('Valid Google email is required.'),
  name: z.string().optional(),
  avatar: z.string().optional()
});

export const createProductSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long.').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters long.'),
  price: z.number().min(0, 'Price must be non-negative.'),
  rentalPrice: z.number().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
  category: z.string().min(1, 'Category is required.'),
  transactionType: z.enum(['BUY', 'SELL', 'RENT', 'BORROW', 'EXCHANGE', 'DONATE']).default('SELL'),
  images: z.array(z.string().url()).min(1, 'At least one image is required.'),
  pickupLocation: z.string().min(2, 'Pickup location is required.'),
  pickupTime: z.string().optional(),
  isNegotiable: z.boolean().default(false),
  departmentId: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export const sendMessageSchema = z.object({
  chatId: z.string().min(1, 'Chat ID is required.'),
  text: z.string().optional(),
  image: z.string().optional(),
  file: z.string().optional()
}).refine((data: { text?: string; image?: string; file?: string }) => data.text || data.image || data.file, {
  message: 'Message must contain text, an image, or a file.'
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
