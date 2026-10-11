import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

/** Starts an isolated in-memory MongoDB for a test file; returns a stop function. */
export async function startMemoryDb(): Promise<() => Promise<void>> {
  const server = await MongoMemoryServer.create();
  await mongoose.connect(server.getUri('faralyah-test'));
  return async () => {
    await mongoose.disconnect();
    await server.stop();
  };
}

export async function clearDb(): Promise<void> {
  await Promise.all(Object.values(mongoose.connection.collections).map((c) => c.deleteMany({})));
}
