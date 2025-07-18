
import app from './index';
import { connectDB } from './config/db';
import { config } from './config/config';
import { seedDatabase } from './utils/seeder';

const PORT = config.port;

const start = async () => {
  try {
    console.log('🚀 Démarrage du serveur...');
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔌 Port: ${PORT}`);
    
    // Vérifier les variables d'environnement critiques
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET manquant dans les variables d\'environnement');
      process.exit(1);
    }
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI manquant dans les variables d\'environnement');
      process.exit(1);
    }
    
    console.log('🔐 Variables d\'environnement validées');
    
    // Connexion à la base de données
    console.log('📡 Connexion à MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connecté');
    
    // Seeding de la base de données au démarrage (uniquement en développement)
    if (process.env.SEED_DATABASE === 'true') {
      console.log('🌱 Seeding de la base de données...');
      await seedDatabase();
      console.log('✅ Seeding terminé');
    }
    
    // Démarrage du serveur
    const server = app.listen(PORT, () => {
      console.log(`✅ Serveur lancé sur http://0.0.0.0:${PORT}`);
      console.log(`📚 Documentation: http://0.0.0.0:${PORT}/api/docs`);
      console.log(`🏥 Health check: http://0.0.0.0:${PORT}/health`);
    });
    
    // Gestion gracieuse de l'arrêt
    process.on('SIGTERM', () => {
      console.log('📴 Signal SIGTERM reçu, arrêt gracieux...');
      server.close(() => {
        console.log('✅ Serveur fermé proprement');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('📴 Signal SIGINT reçu, arrêt gracieux...');
      server.close(() => {
        console.log('✅ Serveur fermé proprement');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('💥 Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

start();
