
import app from './index';
import { connectDB } from './config/db';
import { config } from './config/config';
import { seedDatabase } from './utils/seeder';

const PORT = config.port;

const start = async () => {
  await connectDB();
  
  // Seeding de la base de données au démarrage
  await seedDatabase();
  
  app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
  });
};

start();
