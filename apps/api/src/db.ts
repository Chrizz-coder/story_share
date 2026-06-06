import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dynamic_site';

  if (!process.env.MONGO_URI) {
    console.warn('⚠️  MONGO_URI not set — falling back to local MongoDB (127.0.0.1:27017)');
  }

  try {
    await mongoose.connect(uri);
    console.log('💚 Connected to MongoDB successfully.');
  } catch (error: any) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.error('   URI hint:', uri.replace(/:\/\/[^@]+@/, '://***@')); // mask credentials
    process.exit(1);
  }
}
