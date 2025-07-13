
import app from './index';
import { connectDB } from './config/db';
import { config } from './config/config';

const PORT = config.port;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
  });
};

start();
