import mongoose from 'mongoose';

import { config } from './config';
const MONGODB_URI = config.mongodbUri;

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connecté');
  } catch (err) {
    console.error('Erreur connexion MongoDB:', err);
    process.exit(1);
  }
};
