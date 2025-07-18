#!/usr/bin/env node

/**
 * Script pour tester la configuration trust proxy
 * Simule les headers Railway
 */

const express = require('express');
const rateLimit = require('express-rate-limit');

console.log('🧪 Test de configuration Trust Proxy pour Railway...\n');

// Simuler la configuration de production
const app = express();

// Configuration trust proxy (comme dans index.ts)
app.set('trust proxy', true);
console.log('✅ Trust proxy activé');

// Configuration rate limiting (comme dans index.ts)
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || 'unknown';
  },
  skip: (req) => {
    return req.path === '/health' || req.path === '/api/health';
  },
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer dans 15 minutes'
  }
};

app.use(rateLimit(rateLimitConfig));
console.log('✅ Rate limiting configuré');

// Route de test
app.get('/test', (req, res) => {
  res.json({
    success: true,
    clientIP: req.ip,
    headers: {
      'x-forwarded-for': req.get('X-Forwarded-For'),
      'x-real-ip': req.get('X-Real-IP'),
      'cf-connecting-ip': req.get('CF-Connecting-IP')
    },
    trustProxy: app.get('trust proxy')
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', trustProxy: app.get('trust proxy') });
});

const PORT = 3001;

const server = app.listen(PORT, () => {
  console.log(`✅ Serveur de test lancé sur http://localhost:${PORT}`);
  console.log('\n🧪 Tests à effectuer:');
  console.log('1. Test normal:', `curl http://localhost:${PORT}/test`);
  console.log('2. Test avec X-Forwarded-For:', `curl -H "X-Forwarded-For: 192.168.1.1" http://localhost:${PORT}/test`);
  console.log('3. Health check:', `curl http://localhost:${PORT}/health`);
  console.log('\n📝 Le test réussit si aucune erreur ERR_ERL_UNEXPECTED_X_FORWARDED_FOR n\'apparaît');
  console.log('\nAppuyez sur Ctrl+C pour arrêter');
});

// Test automatique
setTimeout(async () => {
  console.log('\n🔄 Test automatique...');
  
  try {
    const http = require('http');
    
    // Test avec X-Forwarded-For header (simule Railway)
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: '/test',
      method: 'GET',
      headers: {
        'X-Forwarded-For': '203.0.113.1',
        'X-Real-IP': '203.0.113.1'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const result = JSON.parse(data);
        console.log('✅ Test réussi:', result);
        console.log('📊 IP détectée:', result.clientIP);
        console.log('🔧 Trust proxy status:', result.trustProxy);
        
        if (result.clientIP === '203.0.113.1') {
          console.log('🎉 Configuration parfaite ! Railway fonctionnera correctement.');
        } else {
          console.log('⚠️  IP non détectée correctement, vérifiez la config trust proxy');
        }
        
        server.close();
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Erreur de test:', error.message);
      server.close();
    });
    
    req.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    server.close();
  }
}, 1000);

process.on('SIGINT', () => {
  console.log('\n👋 Arrêt du serveur de test');
  server.close();
  process.exit(0);
});
