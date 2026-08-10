import mongoose from 'mongoose';

export let isMockDB = false;

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ WARNING: MONGO_URI environment variable not found in .env. Falling back to an IN-MEMORY Mock database.');
    isMockDB = true;
    return;
  }

  try {
    // Set low timeout for fast error detection
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('\x1b[32m%s\x1b[0m', '✅ Connected to MongoDB Atlas successfully.');
  } catch (error: any) {
    console.error('\x1b[31m%s\x1b[0m', `❌ MongoDB Connection Error: ${error?.message || error}`);
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ Falling back to an IN-MEMORY Mock database for testing.');
    isMockDB = true;
  }
}
