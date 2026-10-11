import mongoose from 'mongoose';

export async function connectDb(uri = process.env.MONGODB_URI): Promise<typeof mongoose> {
  if (!uri) throw new Error('MONGODB_URI is not set (see .env.example)');
  mongoose.set('strictQuery', true);
  return mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
